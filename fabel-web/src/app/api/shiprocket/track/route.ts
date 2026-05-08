import { NextResponse } from 'next/server';
import { trackByAWB } from '@/lib/shiprocket';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/shiprocket/track?orderId=xxx
 * OR
 * GET /api/shiprocket/track?awb=xxx
 *
 * Tracks shipment using either your internal orderId (looks up AWB from DB)
 * or directly with an AWB code.
 * Implements Step 11 from Shiprocket docs.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get('orderId');
        const awbParam = searchParams.get('awb');

        let awbCode = awbParam;

        // If orderId supplied, look up AWB from Supabase
        if (orderId && !awbCode) {
            const { data: order, error } = await supabase
                .from('orders')
                .select('shiprocket_awb_code')
                .eq('id', orderId)
                .single();

            if (error || !order) {
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            awbCode = order.shiprocket_awb_code;
        }

        if (!awbCode) {
            return NextResponse.json(
                { error: 'No AWB code found. Please provide awb or orderId with a tracked shipment.' },
                { status: 400 }
            );
        }

        const trackingData = await trackByAWB(awbCode);

        // Extract key tracking info for a clean response
        const trackInfo = trackingData?.tracking_data;

        return NextResponse.json({
            success: true,
            awbCode,
            currentStatus: trackInfo?.track_status ?? null,
            shipmentTrack: trackInfo?.shipment_track ?? [],
            shipmentTrackActivities: trackInfo?.shipment_track_activities ?? [],
            delivered: trackInfo?.track_status === 1,
        });

    } catch (error: unknown) {
        console.error('Shiprocket track error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Failed to fetch tracking info' },
            { status: 500 }
        );
    }
}
