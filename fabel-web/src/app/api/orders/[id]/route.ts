import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ status: status.toUpperCase() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase update error:', error);
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Delete associated order items first to avoid foreign key constraints
        const { error: itemsError } = await supabase
            .from('order_items')
            .delete()
            .eq('order_id', id);

        if (itemsError) {
            console.error('Supabase order_items delete error:', itemsError);
            throw itemsError;
        }

        // 2. Delete the order
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase delete error:', error);
            throw error;
        }

        return NextResponse.json({ success: true, message: 'Transmission purged from archive' });
    } catch (error: unknown) {
        console.error('Error deleting order:', error);
        return NextResponse.json({ error: 'Failed to purge record' }, { status: 500 });
    }
}

