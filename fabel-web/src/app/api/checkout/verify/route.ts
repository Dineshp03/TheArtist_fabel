import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/mail';
import { buildOrderConfirmationEmail } from '@/lib/emailTemplates';
import { createShiprocketOrder } from '@/lib/shiprocket';



export async function POST(req: Request) {
    try {
        const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, email } = await req.json();

        // Verify signature
        const secret = process.env.RAZORPAY_KEY_SECRET!;
        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpayOrderId + "|" + razorpayPaymentId)
            .digest('hex');

        if (generated_signature !== razorpaySignature) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // Update order status in database
        const { data: order, error: updateError } = await supabase
            .from('orders')
            .update({ status: 'processing' })
            .eq('id', orderId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating order status:', updateError);
            return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
        }

        // Send confirmation email
        if (email) {
            try {
                // Fetch full order with items for the email template
                const { data: fullOrderData } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .eq('id', orderId)
                    .single();

                const orderDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

                // Build Fabel-branded HTML email
                const emailHtml = buildOrderConfirmationEmail({
                    customerName: order.first_name || 'Customer',
                    orderId: `FB-${order.id.split('-')[0].toUpperCase()}`,
                    orderDate,
                    deliveryDate,
                    address: fullOrderData?.address || '',
                    city: fullOrderData?.city || '',
                    pincode: String(fullOrderData?.pincode || ''),
                    items: (fullOrderData?.order_items || []).map((item: { product_name: string; quantity: number; price: number }) => ({
                        name: item.product_name,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    totalPrice: order.total_price,
                    paymentMethod: 'online',
                    paymentId: razorpayPaymentId,
                });

                // Send branded order confirmation email
                await sendEmail({
                    to: email,
                    subject: `Your Fabel order is on its way!`,
                    html: emailHtml,
                });

                // Send notification to Admin
                const adminEmail = process.env.ADMIN_EMAIL;
                if (adminEmail) {
                    await sendEmail({
                        to: adminEmail,
                        subject: `New order received - FB-${order.id.split('-')[0].toUpperCase()}`,
                        html: `
                            <div style="font-family: monospace; max-width: 600px; margin: 0 auto; color: #000; padding: 20px;">
                                <h1 style="text-transform: uppercase;">Payment Confirmed</h1>
                                <p><strong>Order ID:</strong> FB-${order.id.split('-')[0].toUpperCase()}</p>
                                <p><strong>Total Paid:</strong> ₹${order.total_price}</p>
                                <p><strong>Customer Email:</strong> ${email}</p>
                                <p><strong>Payment ID:</strong> ${razorpayPaymentId}</p>
                                <hr/>
                                <p>Check admin panel for details.</p>
                            </div>
                        `
                    });
                }
            } catch (emailErr) {
                console.error("Email error:", emailErr);
            }
        }

        // ── Push order to Shiprocket ──────────────────────────────────────────
        try {
            const { data: fullOrder } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('id', orderId)
                .single();

            if (fullOrder) {
                const shiprocketResult = await createShiprocketOrder({
                    orderId: fullOrder.id,
                    orderDate: new Date(fullOrder.created_at).toISOString().split('T')[0],
                    firstName: fullOrder.first_name,
                    lastName: fullOrder.last_name || '',
                    email: fullOrder.user_email,
                    phone: fullOrder.phone || '9999999999',
                    address: fullOrder.address,
                    city: fullOrder.city,
                    pincode: String(fullOrder.pincode),
                    state: fullOrder.state || 'Maharashtra',
                    items: (fullOrder.order_items || []).map((item: {
                        product_name: string;
                        product_id: string;
                        quantity: number;
                        price: number;
                    }) => ({
                        name: item.product_name,
                        sku: item.product_id,
                        units: item.quantity,
                        sellingPrice: item.price,
                    })),
                    totalPrice: fullOrder.total_price,
                    paymentMethod: 'Prepaid',
                });

                if (shiprocketResult?.order_id) {
                    await supabase
                        .from('orders')
                        .update({
                            shiprocket_order_id: shiprocketResult.order_id,
                            shiprocket_shipment_id: shiprocketResult.shipment_id,
                            shiprocket_awb_code: shiprocketResult.awb_code || null,
                        })
                        .eq('id', orderId);
                }
            }
        } catch (shiprocketErr) {
            // Don't fail the payment confirmation if Shiprocket sync fails
            // Order can be pushed manually from admin panel
            console.error('Shiprocket sync error (non-fatal):', shiprocketErr);
        }

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
