import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { razorpay } from '@/lib/razorpay';
import { sendEmail } from '@/lib/mail';
import { buildOrderConfirmationEmail } from '@/lib/emailTemplates';
import { createShiprocketOrder } from '@/lib/shiprocket';
import { createPhonePePayment } from '@/lib/phonepe';



export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, phone, firstName, lastName, address, city, pincode, items, totalPrice, paymentMethod } = body;

        // 1. Insert into orders table
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_email: email,
                phone: phone,
                first_name: firstName,
                last_name: lastName,
                address,
                city,
                pincode,
                total_price: totalPrice,
                status: paymentMethod === 'cod' ? 'processing - COD' : 'pending'
            }])
            .select()
            .single();

        if (orderError) {
            console.error('Error inserting order:', orderError);
            throw new Error('Failed to create order');
        }

        // 2. Insert order items
        if (items && items.length > 0) {
            const orderItemsInsert = items.map((item: { id: string, name: string, quantity: number, price: number }) => ({
                order_id: order.id,
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItemsInsert);

            if (itemsError) {
                console.error('Error inserting order items:', itemsError);
            }
        }

        // 3. Handle Razorpay if payment method is online
        if (paymentMethod === 'online') {
            const options = {
                amount: Math.round(totalPrice * 100), // amount in the smallest currency unit (paise)
                currency: "INR",
                receipt: `receipt_${order.id.split('-')[0]}`,
            };

            try {
                const razorpayOrder = await razorpay.orders.create(options);
                return NextResponse.json({
                    success: true,
                    orderId: order.id,
                    razorpayOrderId: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency
                });
            } catch (razorpayErr) {
                console.error('Razorpay Order Error:', razorpayErr);
                throw new Error('Failed to initialize gateway transaction');
            }
        }

        // 3b. Handle PhonePe if payment method is phonepe
        if (paymentMethod === 'phonepe') {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (req.headers.get('host') ? `http://${req.headers.get('host')}` : 'http://localhost:3000');
                const redirectUrl = `${baseUrl}/api/checkout/phonepe-callback`;
                const userId = email || `user_${Date.now()}`;
                
                const phonepeResponse = await createPhonePePayment(order.id, totalPrice, redirectUrl, userId, phone || '9999999999');

                if (phonepeResponse && phonepeResponse.success) {
                    const paymentUrl = phonepeResponse.data.instrumentResponse.redirectInfo.url;
                    return NextResponse.json({
                        success: true,
                        orderId: order.id,
                        paymentUrl: paymentUrl
                    });
                } else {
                    console.error('PhonePe error:', phonepeResponse);
                    throw new Error('Failed to initialize PhonePe transaction');
                }
            } catch (phonepeErr) {
                console.error('PhonePe Order Error:', phonepeErr);
                throw new Error('Failed to initialize PhonePe gateway transaction');
            }
        }

        // 4. Send email receipt for COD
        if (paymentMethod === 'cod') {
            try {
                // Build Fabel-branded HTML email
                const orderDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

                const emailHtml = buildOrderConfirmationEmail({
                    customerName: firstName || 'Customer',
                    orderId: `FB-${order.id.split('-')[0].toUpperCase()}`,
                    orderDate,
                    deliveryDate,
                    address,
                    city,
                    pincode: String(pincode),
                    items: (items || []).map((item: { name: string; quantity: number; price: number }) => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    totalPrice,
                    paymentMethod: 'cod',
                });

                await sendEmail({
                    to: email,
                    subject: `Order Confirmed — FB-${order.id.split('-')[0].toUpperCase()}`,
                    html: emailHtml,
                });

                // 4b. Send notification to Admin
                const adminEmail = process.env.ADMIN_EMAIL;
                if (adminEmail) {
                    await sendEmail({
                        to: adminEmail,
                        subject: `NEW COD ORDER - FB-${order.id.split('-')[0].toUpperCase()}`,
                        html: `
                            <div style="font-family: monospace; max-width: 600px; margin: 0 auto; color: #000; padding: 20px;">
                                <h1 style="text-transform: uppercase;">New Order Received (COD)</h1>
                                <p><strong>Order ID:</strong> FB-${order.id.split('-')[0].toUpperCase()}</p>
                                <p><strong>Amount:</strong> ₹${totalPrice}</p>
                                <p><strong>Customer:</strong> ${firstName} ${lastName} (${email})</p>
                                <p><strong>Phone:</strong> ${phone}</p>
                                <p><strong>Address:</strong> ${address}, ${city} - ${pincode}</p>
                                <hr/>
                                <p>Check admin panel for details.</p>
                            </div>
                        `
                    });
                }
            } catch (emailErr) {
                console.error("Email error:", emailErr);
            }

            // ── Push COD order to Shiprocket ──────────────────────────────────
            try {
                const shiprocketResult = await createShiprocketOrder({
                    orderId: order.id,
                    orderDate: new Date().toISOString().split('T')[0],
                    firstName,
                    lastName: lastName || '',
                    email,
                    phone: phone || '9999999999',
                    address,
                    city,
                    pincode: String(pincode),
                    state: 'Maharashtra', // Update if you capture state on checkout
                    items: (items || []).map((item: { id: string; name: string; quantity: number; price: number }) => ({
                        name: item.name,
                        sku: item.id,
                        units: item.quantity,
                        sellingPrice: item.price,
                    })),
                    totalPrice,
                    paymentMethod: 'COD',
                    codAmount: totalPrice,
                });

                if (shiprocketResult?.order_id) {
                    await supabase
                        .from('orders')
                        .update({
                            shiprocket_order_id: shiprocketResult.order_id,
                            shiprocket_shipment_id: shiprocketResult.shipment_id,
                            shiprocket_awb_code: shiprocketResult.awb_code || null,
                        })
                        .eq('id', order.id);
                }
            } catch (shiprocketErr) {
                console.error('Shiprocket COD sync error (non-fatal):', shiprocketErr);
            }
        }

        return NextResponse.json({ success: true, orderId: order.id });

    } catch (error: unknown) {
        console.error('Checkout API error:', error);
        return NextResponse.json({ error: (error as Error).message || 'Payment processing failed' }, { status: 500 });
    }
}

