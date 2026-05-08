export interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

export interface OrderEmailData {
    customerName: string;
    orderId: string;
    orderDate: string;
    deliveryDate: string;
    address: string;
    city: string;
    pincode: string;
    items: OrderItem[];
    totalPrice: number;
    paymentMethod: 'online' | 'cod';
    paymentId?: string;
}

// Soft off-white cream accent — matches the Fabel website button colour
const ACCENT = '#e8f0c4';
const ACCENT_TEXT = '#1a1a0f'; // dark text on cream background

export function buildOrderConfirmationEmail(data: OrderEmailData): string {
    const {
        customerName,
        orderId,
        orderDate,
        deliveryDate,
        address,
        city,
        pincode,
        items,
        totalPrice,
        paymentMethod,
        paymentId,
    } = data;

    const productRows = items.map(item => `
        <tr>
            <td style="padding:16px 0;border-bottom:1px solid #1e1e1e;font-size:15px;color:#d0d0d0;letter-spacing:0.03em;font-family:monospace;">
                ${item.name}
            </td>
            <td style="padding:16px 0;border-bottom:1px solid #1e1e1e;font-size:15px;color:#999;text-align:center;font-family:monospace;">
                &times;${item.quantity}
            </td>
            <td style="padding:16px 0;border-bottom:1px solid #1e1e1e;font-size:15px;color:#d0d0d0;text-align:right;font-family:monospace;">
                &#8377;${(item.price * item.quantity).toLocaleString('en-IN')}
            </td>
        </tr>
    `).join('');

    const paymentInfo = paymentMethod === 'cod'
        ? `<tr>
            <td style="padding:10px 0;font-size:12px;letter-spacing:0.2em;color:#555;text-transform:uppercase;font-family:monospace;">Payment</td>
            <td style="padding:10px 0;font-size:14px;color:#aaa;text-align:right;font-family:monospace;">Cash on Delivery</td>
           </tr>`
        : paymentId
            ? `<tr>
                <td style="padding:10px 0;font-size:12px;letter-spacing:0.2em;color:#555;text-transform:uppercase;font-family:monospace;">Payment ID</td>
                <td style="padding:10px 0;font-size:12px;color:#666;text-align:right;font-family:monospace;word-break:break-all;">${paymentId}</td>
               </tr>`
            : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Order Confirmed - Fabel</title>
</head>
<body style="margin:0;padding:0;background-color:#080808;font-family:monospace;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#080808;">
    <tr>
        <td align="center" style="padding:40px 16px;">

            <!-- Card -->
            <table width="600" cellpadding="0" cellspacing="0" border="0"
                   style="max-width:600px;width:100%;background-color:#0f0f0f;border:1px solid #1e1e1e;">

                <!-- Header / Logo -->
                <tr>
                    <td style="padding:44px 48px;border-bottom:1px solid #1a1a1a;text-align:center;">
                        <div style="font-size:36px;font-weight:900;letter-spacing:0.4em;color:#ffffff;text-transform:uppercase;font-family:monospace;">
                            FABEL
                        </div>
                    </td>
                </tr>

                <!-- Status Banner -->
                <tr>
                    <td style="background-color:${ACCENT};padding:22px 48px;text-align:center;">
                        <div style="font-size:14px;font-weight:900;letter-spacing:0.45em;color:${ACCENT_TEXT};text-transform:uppercase;font-family:monospace;">
                            &#10003;&nbsp;&nbsp;Order Confirmed
                        </div>
                        <div style="margin-top:8px;font-size:11px;letter-spacing:0.25em;color:#3a3a20;text-transform:uppercase;font-family:monospace;">
                            Logged in the Collective
                        </div>
                    </td>
                </tr>

                <!-- Greeting -->
                <tr>
                    <td style="padding:40px 48px;border-bottom:1px solid #1a1a1a;">
                        <div style="font-size:11px;letter-spacing:0.35em;color:#555;text-transform:uppercase;margin-bottom:10px;font-family:monospace;">
                            Operator
                        </div>
                        <div style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:18px;font-family:monospace;">
                            ${customerName}
                        </div>
                        <div style="font-size:15px;color:#999;line-height:1.9;letter-spacing:0.03em;font-family:monospace;">
                            Your requisition has been verified and logged. Dispatch expected within
                            <span style="color:${ACCENT};font-weight:bold;">48 standard industrial hours</span>.
                            Estimated delivery by
                            <span style="color:#ffffff;font-weight:bold;">${deliveryDate}</span>.
                        </div>
                    </td>
                </tr>

                <!-- Order Meta -->
                <tr>
                    <td style="padding:0 48px;border-bottom:1px solid #1a1a1a;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td style="padding:26px 0;width:50%;vertical-align:top;">
                                    <div style="font-size:11px;letter-spacing:0.3em;color:#444;text-transform:uppercase;margin-bottom:10px;font-family:monospace;">Order ID</div>
                                    <div style="font-size:18px;font-weight:900;color:#ffffff;letter-spacing:0.12em;font-family:monospace;">${orderId}</div>
                                </td>
                                <td style="padding:26px 0;width:50%;vertical-align:top;text-align:right;">
                                    <div style="font-size:11px;letter-spacing:0.3em;color:#444;text-transform:uppercase;margin-bottom:10px;font-family:monospace;">Date</div>
                                    <div style="font-size:14px;color:#777;letter-spacing:0.08em;font-family:monospace;">${orderDate}</div>
                                </td>
                            </tr>
                            ${paymentInfo}
                        </table>
                    </td>
                </tr>

                <!-- Items / Manifest -->
                <tr>
                    <td style="padding:36px 48px;border-bottom:1px solid #1a1a1a;">
                        <div style="font-size:12px;letter-spacing:0.4em;color:#444;text-transform:uppercase;margin-bottom:22px;font-family:monospace;">
                            Manifest
                        </div>

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <!-- Column Headers -->
                            <tr>
                                <td style="padding:0 0 14px;font-size:11px;letter-spacing:0.3em;color:#333;text-transform:uppercase;font-family:monospace;width:60%;">Item</td>
                                <td style="padding:0 0 14px;font-size:11px;letter-spacing:0.3em;color:#333;text-transform:uppercase;text-align:center;font-family:monospace;width:20%;">Qty</td>
                                <td style="padding:0 0 14px;font-size:11px;letter-spacing:0.3em;color:#333;text-transform:uppercase;text-align:right;font-family:monospace;width:20%;">Price</td>
                            </tr>

                            <!-- Product rows -->
                            ${productRows}

                            <!-- Total -->
                            <tr>
                                <td colspan="2" style="padding:22px 0 0;text-align:right;padding-right:24px;">
                                    <span style="font-size:12px;letter-spacing:0.35em;color:#555;text-transform:uppercase;font-family:monospace;">Total</span>
                                </td>
                                <td style="padding:22px 0 0;text-align:right;">
                                    <span style="font-size:22px;font-weight:900;color:${ACCENT};letter-spacing:0.05em;font-family:monospace;">
                                        &#8377;${totalPrice.toLocaleString('en-IN')}
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Delivery Address -->
                <tr>
                    <td style="padding:36px 48px;border-bottom:1px solid #1a1a1a;">
                        <div style="font-size:12px;letter-spacing:0.4em;color:#444;text-transform:uppercase;margin-bottom:18px;font-family:monospace;">
                            Destination
                        </div>
                        <div style="font-size:15px;color:#888;line-height:2.0;letter-spacing:0.03em;font-family:monospace;">
                            ${address}<br>
                            ${city} &mdash; ${pincode}
                        </div>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="padding:36px 48px;text-align:center;">
                        <div style="font-size:13px;color:#555;letter-spacing:0.08em;font-family:monospace;margin-bottom:10px;">
                            Questions? Write to us at
                            <a href="mailto:update@fabel.in"
                               style="color:${ACCENT};text-decoration:none;font-family:monospace;">
                                update@fabel.in
                            </a>
                        </div>
                        <div style="margin-top:28px;padding-top:24px;border-top:1px solid #1a1a1a;font-size:10px;letter-spacing:0.4em;color:#2d2d2d;text-transform:uppercase;font-family:monospace;">
                            Authenticity Guaranteed by Fabel Studio
                        </div>
                    </td>
                </tr>

            </table>
            <!-- /Card -->

        </td>
    </tr>
</table>
</body>
</html>`;
}
