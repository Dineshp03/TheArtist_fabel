import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase fetch error:', error);
            throw error;
        }

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products from DB:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const newProduct = {
            name: body.name,
            price: Number(body.price),
            category: body.category,
            img: body.img || '',
            images: body.images || [],
            tag: body.tag || null,
            stock: Number(body.stock),
            description: body.description,
            sizes: body.sizes || [],
            details: body.details || [],
            reviews: []
        };

        const { data, error } = await supabase
            .from('products')
            .insert([newProduct])
            .select()
            .single();

        if (error) {
            console.error('Supabase write error:', error);
            throw error;
        }

        return NextResponse.json({ success: true, product: data });
    } catch (error) {
        console.error('Error adding product to DB:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
