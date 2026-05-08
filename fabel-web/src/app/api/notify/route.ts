import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sendEmail } from '@/lib/mail';

export async function POST(request: Request) {
    try {
        const { email, category } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
        }

        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }

        const filePath = path.join(dataDir, 'notifications.json');
        let notifications: { email: string; category: string; timestamp: string }[] = [];

        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            notifications = JSON.parse(fileContent);
        }

        // Check if email already exists for this category
        const exists = notifications.find((n) => n.email === email && n.category === category);
        if (!exists) {
            notifications.push({
                email,
                category,
                timestamp: new Date().toISOString()
            });
            fs.writeFileSync(filePath, JSON.stringify(notifications, null, 2));

            // Send an email to the admin
            const adminEmail = process.env.ADMIN_EMAIL || 'update@fabel.in';
            try {
                await sendEmail({
                    to: adminEmail,
                    subject: `New Interest Registered: ${category}`,
                    html: `
                        <h2>New Interest Registration</h2>
                        <p>A user has registered interest for an upcoming drop.</p>
                        <ul>
                            <li><strong>Email:</strong> ${email}</li>
                            <li><strong>Category:</strong> ${category}</li>
                            <li><strong>Time:</strong> ${new Date().toLocaleString('en-IN')}</li>
                        </ul>
                    `
                });
                console.log(`Sent interest notification to admin for ${email}`);
            } catch (emailError) {
                console.error("Failed to send admin notification email:", emailError);
                // We don't throw here to avoid failing the user's registration
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Notification error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

