import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPhonePeChecksum, checkPhonePePaymentStatus } from '@/lib/phonepe';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // S2S Webhook from PhonePe sends a base64 encoded response inside "response" body
        if (!body.response) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const xVerify = req.headers.get('x-verify') || '';
        
        // Verify the checksum
        const isValid = verifyPhonePeChecksum(body.response, xVerify);
        
        if (!isValid) {
            console.error('PhonePe Webhook Checksum Verification Failed');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Decode the base64 payload
        const decodedString = Buffer.from(body.response, 'base64').toString('utf-8');
        const payload = JSON.parse(decodedString);

        console.log('PhonePe Webhook Payload:', payload);

        // The exact state we are looking for is in payload.data.state or root level payload.state depending on the event
        // The user instructions specifically mention:
        // Use the “payload.state” Parameter: For payment status, rely only on the root-level “payload.state” field in the response
        // Use the “event” parameter instead to identify the event type
        
        const event = payload.event;
        const state = payload.payload?.state || payload.state; // Fallback to either structure
        const merchantTransactionId = payload.payload?.merchantTransactionId || payload.data?.merchantTransactionId;
        const providerReferenceId = payload.payload?.providerReferenceId || payload.data?.providerReferenceId;

        if (!merchantTransactionId) {
            return NextResponse.json({ error: 'No transaction ID found' }, { status: 400 });
        }

        if (event === 'checkout.order.completed' && state === 'COMPLETED') {
            // Update order status to paid
            await supabase
                .from('orders')
                .update({ 
                    status: 'paid', 
                    payment_id: providerReferenceId 
                })
                .eq('id', merchantTransactionId);
                
        } else if (event === 'checkout.order.failed' || state === 'FAILED') {
            // Update order status to failed
            await supabase
                .from('orders')
                .update({ status: 'failed' })
                .eq('id', merchantTransactionId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PhonePe Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
