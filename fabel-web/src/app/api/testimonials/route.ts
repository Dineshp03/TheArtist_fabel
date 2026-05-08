import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: testimonials, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase fetch error:', error);
            throw error;
        }

        return NextResponse.json(testimonials);
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const newTestimonial = {
            name: body.name,
            role: body.role,
            image: body.image,
            text: body.text
        };

        const { data, error } = await supabase
            .from('testimonials')
            .insert([newTestimonial])
            .select()
            .single();

        if (error) {
            console.error('Supabase write error:', error);
            throw error;
        }

        return NextResponse.json({ success: true, testimonial: data });
    } catch (error) {
        console.error('Error adding testimonial to DB:', error);
        return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
    }
}
