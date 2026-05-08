import { NextResponse } from 'next/server';
import { checkShippingRates } from '@/lib/shiprocket';

/**
 * POST /api/shiprocket/rates
 * Check available couriers and shipping charges for a delivery pincode.
 *
 * Body: { deliveryPostcode: string, weight?: number, cod?: boolean, declaredValue?: number }
 */
export async function POST(req: Request) {
    try {
        const { deliveryPostcode, weight = 0.5, cod = false, declaredValue } = await req.json();

        if (!deliveryPostcode) {
            return NextResponse.json({ error: 'Delivery pincode is required' }, { status: 400 });
        }

        const pickupPostcode = process.env.SHIPROCKET_PICKUP_POSTCODE;
        if (!pickupPostcode) {
            return NextResponse.json({ error: 'Pickup postcode not configured' }, { status: 500 });
        }

        const data = await checkShippingRates({
            pickupPostcode,
            deliveryPostcode: String(deliveryPostcode),
            weight,
            cod: cod ? 1 : 0,
            declaredValue,
        });

        // Extract the cheapest available courier for display
        const couriers = data?.data?.available_courier_companies ?? [];
        const recommended = data?.data?.shiprocket_recommended_courier_id ?? null;

        const simplifiedCouriers = couriers.map((c: {
            courier_company_id: number;
            courier_name: string;
            rate: number;
            estimated_delivery_days: number | string;
        }) => ({
            id: c.courier_company_id,
            name: c.courier_name,
            rate: c.rate,
            estimatedDays: c.estimated_delivery_days,
            isRecommended: c.courier_company_id === recommended,
        }));

        // Find the cheapest rate
        const cheapest = simplifiedCouriers.length > 0
            ? Math.min(...simplifiedCouriers.map((c: { rate: number }) => c.rate))
            : null;

        return NextResponse.json({
            success: true,
            serviceable: couriers.length > 0,
            cheapestRate: cheapest,
            recommendedCourierId: recommended,
            couriers: simplifiedCouriers,
        });

    } catch (error: unknown) {
        console.error('Shiprocket rates error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Failed to fetch shipping rates' },
            { status: 500 }
        );
    }
}
