import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
    try {
        // Update all delivered orders to 'ARCHIVED'
        const { data, error } = await supabase
            .from('orders')
            .update({ status: 'ARCHIVED' })
            .eq('status', 'DELIVERED');

        if (error) {
            console.error('Supabase reset error:', error);
            throw error;
        }

        return NextResponse.json({ success: true, message: 'All active orders moved to archive.' });
    } catch (error: unknown) {
        console.error('Error resetting orders:', error);
        return NextResponse.json({ error: 'Failed to reset orders' }, { status: 500 });
    }
}
