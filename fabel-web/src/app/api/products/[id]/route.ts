import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase fetch error:', error);
            throw error;
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        const updatedProduct = {
            name: body.name,
            price: Number(body.price),
            category: body.category,
            img: body.img,
            images: body.images,
            tag: body.tag,
            stock: Number(body.stock),
            description: body.description,
            sizes: body.sizes,
            details: body.details,
            reviews: body.reviews,
        };

        const { data, error } = await supabase
            .from('products')
            .update(updatedProduct)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase update error detail:', error);
            throw error;
        }
        return NextResponse.json({ success: true, product: data });
    } catch (error) {
        console.error('Error updating product (full stack):', error);
        return NextResponse.json({
            error: 'Failed to update product',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase delete error:', error);
            throw error;
        }

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error deleting product from DB:', error);
        return NextResponse.json({
            error: 'Failed to delete product',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
