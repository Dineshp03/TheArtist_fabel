import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
        }

        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
            return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
        }

        // Use the service role client to securely search auth users
        const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey
        );

        // List users filtered by email
        const { data, error } = await adminClient.auth.admin.listUsers();

        if (error) {
            console.error('Supabase admin list users error:', error);
            return NextResponse.json({ error: 'Failed to verify email.' }, { status: 500 });
        }

        // Check if this email exists in Supabase Auth
        const userExists = data.users.some(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (!userExists) {
            return NextResponse.json(
                { error: 'No account found with this email address.' },
                { status: 404 }
            );
        }

        // User exists — trigger the Supabase reset email
        const { error: resetError } = await adminClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/update-password`,
        });

        if (resetError) {
            console.error('Reset password error:', resetError);
            return NextResponse.json({ error: resetError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Forgot password route error:', err);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}
