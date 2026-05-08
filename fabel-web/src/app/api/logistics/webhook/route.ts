import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/shiprocket/webhook
 *
 * Shiprocket posts tracking updates here whenever a shipment status changes.
 *
 * Setup in Shiprocket:
 *   Settings → API → Webhooks → Add URL: https://fabel.in/api/shiprocket/webhook
 *   Enable the toggle. Optionally add a security token as x-api-key header.
 *
 * Webhook specs from Shiprocket docs:
 *  - Method: POST
 *  - Content-Type: application/json
 *  - Must return HTTP 200
 *  - Do NOT use "shiprocket", "kartrocket", "sr", "kr" in the webhook URL path
 *  - Security token header: x-api-key
 */
export async function POST(req: Request) {
    try {
        // Optional: verify security token if you set one in Shiprocket dashboard
        const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;
        if (webhookSecret) {
            const incomingKey = req.headers.get('x-api-key');
            if (incomingKey !== webhookSecret) {
                console.warn('Shiprocket webhook: invalid x-api-key');
                // Still return 200 to prevent Shiprocket from retrying
                return NextResponse.json({ received: true }, { status: 200 });
            }
        }

        const body = await req.json();

        const {
            awb,
            courier_name,
            current_status,
            current_status_id,
            shipment_status,
            order_id,        // This is Shiprocket's order ID (SR order id)
            sr_order_id,
            current_timestamp,
            scans,
        } = body;

        console.log(`Shiprocket webhook received: AWB=${awb}, Status="${current_status}", Order=${order_id}`);

        // Map Shiprocket status to your internal order status
        const statusMap: Record<number, string> = {
            1: 'pending',
            2: 'processing',
            3: 'processing',          // PICKUP PENDING
            4: 'processing',
            5: 'processing',          // MANIFEST GENERATED
            6: 'shipped',             // SHIPPED
            7: 'delivered',           // DELIVERED
            8: 'cancelled',           // CANCELLED
            9: 'rto-initiated',       // RTO INITIATED (return to origin)
            10: 'rto-delivered',       // RTO DELIVERED
            11: 'lost',
            17: 'out-for-delivery',    // OUT FOR DELIVERY
            18: 'in-transit',          // IN TRANSIT
            42: 'picked-up',           // PICKED UP
        };

        const newStatus = statusMap[current_status_id] ?? current_status?.toLowerCase() ?? 'processing';

        // Find the Fabel order by AWB code and update its status
        if (awb) {
            const { data: order } = await supabase
                .from('orders')
                .select('id, status')
                .eq('shiprocket_awb_code', awb)
                .single();

            if (order) {
                await supabase
                    .from('orders')
                    .update({
                        status: newStatus,
                        shiprocket_status: current_status,
                        shiprocket_status_id: current_status_id,
                        shiprocket_last_update: current_timestamp,
                    })
                    .eq('id', order.id);

                console.log(`Order ${order.id} updated to status: ${newStatus} (${current_status})`);
            }
        }

        // Always return 200 — Shiprocket requires this
        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error: unknown) {
        console.error('Shiprocket webhook error:', error);
        // Still return 200 so Shiprocket doesn't keep retrying
        return NextResponse.json({ received: true }, { status: 200 });
    }
}
