import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase delete error:', error);
            throw error;
        }

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error deleting testimonial from DB:', error);
        return NextResponse.json({
            error: 'Failed to delete testimonial',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
