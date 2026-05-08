import { NextResponse } from 'next/server';
import { generateInvoice } from '@/lib/shiprocket';

export async function POST(req: Request) {
    try {
        const { shiprocketOrderId } = await req.json();

        if (!shiprocketOrderId) {
            return NextResponse.json({ error: 'Shiprocket Order ID is required' }, { status: 400 });
        }

        const result = await generateInvoice(Number(shiprocketOrderId));

        if (result && result.is_error) {
            return NextResponse.json({ error: result.extra_info || 'Shiprocket returned an error' }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Invoice generation error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate invoice' }, { status: 500 });
    }
}
