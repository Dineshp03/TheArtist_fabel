import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPhonePeChecksum } from '@/lib/phonepe';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const code = formData.get('code');
        const transactionId = formData.get('transactionId');
        const merchantId = formData.get('merchantId');

        if (code === 'PAYMENT_SUCCESS') {
            // Update order status to paid in Supabase
            const { error: updateError } = await supabase
                .from('orders')
                .update({ status: 'paid', payment_id: formData.get('providerReferenceId') })
                .eq('id', transactionId);

            if (updateError) {
                console.error('Error updating order:', updateError);
            }

            // Redirect to success page (or the checkout page with success step)
            // Assuming your success logic expects a URL with order id
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (req.headers.get('host') ? `http://${req.headers.get('host')}` : 'http://localhost:3000');
            return NextResponse.redirect(`${baseUrl}/checkout/success?orderId=${transactionId}`, 303);
        } else {
            // Update order status to failed
            await supabase
                .from('orders')
                .update({ status: 'failed' })
                .eq('id', transactionId);

            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (req.headers.get('host') ? `http://${req.headers.get('host')}` : 'http://localhost:3000');
            return NextResponse.redirect(`${baseUrl}/checkout?error=Payment+Failed`, 303);
        }
    } catch (error) {
        console.error('PhonePe Callback Error:', error);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (req.headers.get('host') ? `http://${req.headers.get('host')}` : 'http://localhost:3000');
        return NextResponse.redirect(`${baseUrl}/checkout?error=Payment+Callback+Failed`, 303);
    }
}
