import { NextResponse } from 'next/server';
import { createShiprocketOrder } from '@/lib/shiprocket';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/shiprocket/create-order
 * Pushes an existing Fabel order to Shiprocket (Steps 4 from docs).
 * Called automatically after payment verification.
 *
 * Body: { orderId: string }
 */
export async function POST(req: Request) {
    try {
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
        }

        // Fetch order + items from Supabase
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Map Supabase order to Shiprocket payload
        const shiprocketPayload = {
            orderId: order.id,
            orderDate: new Date(order.created_at).toISOString().split('T')[0], // YYYY-MM-DD
            firstName: order.first_name,
            lastName: order.last_name || '',
            email: order.user_email,
            phone: order.phone || '9999999999',
            address: order.address,
            city: order.city,
            pincode: String(order.pincode),
            state: order.state || 'Maharashtra', // default if state not captured
            items: (order.order_items || []).map((item: {
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
            totalPrice: order.total_price,
            paymentMethod: order.status?.includes('COD') ? ('COD' as const) : ('Prepaid' as const),
            ...(order.status?.includes('COD') && { codAmount: order.total_price }),
        };

        const result = await createShiprocketOrder(shiprocketPayload);

        // Save Shiprocket IDs back to Supabase for future reference
        if (result?.order_id) {
            await supabase
                .from('orders')
                .update({
                    shiprocket_order_id: result.order_id,
                    shiprocket_shipment_id: result.shipment_id,
                    shiprocket_awb_code: result.awb_code || null,
                    status: order.status?.includes('COD')
                        ? 'processing - COD'
                        : 'processing',
                })
                .eq('id', orderId);
        }

        return NextResponse.json({
            success: true,
            shiprocketOrderId: result.order_id,
            shipmentId: result.shipment_id,
            awbCode: result.awb_code || null,
            courierName: result.courier_name || null,
            message: 'Order successfully pushed to Shiprocket',
        });

    } catch (error: unknown) {
        console.error('Shiprocket create-order error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Failed to create Shiprocket order' },
            { status: 500 }
        );
    }
}
