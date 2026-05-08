import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zeptomail.in',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Sends email via Zepto Mail REST API (Preferred for deliverability)
 * Falls back to SMTP if API key is missing.
 */
export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    const apiKey = process.env.ZEPTO_MAIL_API_KEY;

    // Use API if available (Always preferred to avoid spam)
    if (apiKey) {
        try {
            const payload = {
                from: {
                    address: 'update@fabel.in',
                    name: 'Fabel',
                },
                to: [
                    {
                        email_address: {
                            address: to,
                        },
                    },
                ],
                subject: subject,
                htmlbody: html,
            };

            const response = await fetch('https://api.zeptomail.in/v1.1/email', {
                method: 'POST',
                headers: {
                    'Authorization': `Zoho-Enczapikey ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('[ZeptoMail API] Email sent:', data.messageId || 'Success');
                return data;
            } else {
                const error = await response.text();
                console.error('[ZeptoMail API] Error:', error);
                // Fall through to SMTP if API fails
            }
        } catch (error) {
            console.error('[ZeptoMail API] Request failed:', error);
            // Fall through to SMTP if API fails
        }
    }

    // Fallback: SMTP (Already configured in Transporter)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('Zepto API Key and SMTP credentials both missing.');
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'Fabel <update@fabel.in>',
            to,
            subject,
            html,
        });
        console.log('[ZeptoMail SMTP] Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('[ZeptoMail SMTP] Error:', error);
        throw error;
    }
}

/**
 * Send an email using a Zepto Mail template (REST API).
 * mergeInfo keys must match the {{variable}} placeholders in your template.
 * Supports string values and arrays (for {{#loop}} blocks).
 */
export async function sendTemplateEmail({
    to,
    toName,
    templateKey,
    mergeInfo,
}: {
    to: string;
    toName?: string;
    templateKey: string;
    mergeInfo: Record<string, string | Array<Record<string, string>>>;
}) {
    const apiKey = process.env.ZEPTO_MAIL_API_KEY;
    if (!apiKey) {
        console.warn('ZEPTO_MAIL_API_KEY not configured. Template email not sent.');
        return;
    }

    const payload = {
        template_key: templateKey,
        from: {
            address: 'update@fabel.in',
            name: 'Fabel',
        },
        to: [
            {
                email_address: {
                    address: to,
                    name: toName || to,
                },
            },
        ],
        merge_info: mergeInfo,
    };

    // DEBUG: log exactly what we're sending to Zepto Mail
    console.log('[ZeptoMail] Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://api.zeptomail.in/v1.1/email/template', {
        method: 'POST',
        headers: {
            'Authorization': `Zoho-Enczapikey ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('[ZeptoMail] API response status:', response.status);
    console.log('[ZeptoMail] API response body:', responseText);

    if (!response.ok) {
        throw new Error(`Zepto Mail template send failed: ${response.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);
    return result;
}

