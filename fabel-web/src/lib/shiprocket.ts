/**
 * Shiprocket API Integration Library
 * Base URL: https://apiv2.shiprocket.in/v1/external
 * Auth token valid for 240 hours (10 days)
 */

const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external';

// ─── In-memory token cache ────────────────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Step 2 from docs: POST /auth/login
 * Gets a JWT token using your API user credentials.
 * Caches the token for up to 9 days (token is valid 10 days / 240 hours).
 */
export async function getShiprocketToken(): Promise<string> {
    const now = Date.now();

    // Return cached token if still valid
    if (cachedToken && tokenExpiry && now < tokenExpiry) {
        return cachedToken;
    }

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
        throw new Error('Shiprocket credentials are not configured in environment variables.');
    }

    const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Shiprocket auth failed: ${err}`);
    }

    const data = await res.json();
    cachedToken = data.token as string;
    // Cache for 9 days (slightly less than the 10-day validity)
    tokenExpiry = now + 9 * 24 * 60 * 60 * 1000;

    return cachedToken;
}

/**
 * Helper: build auth headers
 */
async function authHeaders(): Promise<Record<string, string>> {
    const token = await getShiprocketToken();
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ShiprocketOrderPayload {
    orderId: string;         // Your internal order ID (Fabel order ID)
    orderDate: string;       // ISO date string
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    state: string;
    items: Array<{
        name: string;
        sku: string;
        units: number;
        sellingPrice: number;
    }>;
    totalPrice: number;
    paymentMethod: 'Prepaid' | 'COD';
    codAmount?: number;     // Required only for COD
}

export interface ShiprocketRatePayload {
    pickupPostcode: string;
    deliveryPostcode: string;
    weight: number;          // in kg
    cod: 0 | 1;
    declaredValue?: number;  // declared value of shipment
}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * Step 3: GET /courier/serviceability/
 * Check available couriers and shipping rates for a given pincode.
 */
export async function checkShippingRates(payload: ShiprocketRatePayload) {
    const headers = await authHeaders();

    const params = new URLSearchParams({
        pickup_postcode: payload.pickupPostcode,
        delivery_postcode: payload.deliveryPostcode,
        weight: String(payload.weight),
        cod: String(payload.cod),
        ...(payload.declaredValue && { declared_value: String(payload.declaredValue) }),
    });

    const res = await fetch(
        `${SHIPROCKET_BASE}/courier/serviceability/?${params.toString()}`,
        { method: 'GET', headers }
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Shiprocket rates check failed: ${err}`);
    }

    return res.json();
}

/**
 * Step 4: POST /orders/create/adhoc
 * Creates an order on Shiprocket.
 * Returns shiprocket_order_id and shipment_id.
 */
export async function createShiprocketOrder(payload: ShiprocketOrderPayload) {
    const headers = await authHeaders();

    const body = {
        order_id: `FB-${payload.orderId.split('-')[0].toUpperCase()}`,
        order_date: payload.orderDate,
        pickup_location: process.env.SHIPROCKET_PICKUP_NAME || 'Primary',
        channel_id: '',
        comment: 'Fabel Studio Order',
        billing_customer_name: payload.firstName,
        billing_last_name: payload.lastName,
        billing_address: payload.address,
        billing_city: payload.city,
        billing_pincode: payload.pincode,
        billing_state: payload.state,
        billing_country: 'India',
        billing_email: payload.email,
        billing_phone: payload.phone,
        shipping_is_billing: true,
        order_items: payload.items.map((item) => ({
            name: item.name,
            sku: item.sku,
            units: item.units,
            selling_price: item.sellingPrice,
        })),
        payment_method: payload.paymentMethod,
        sub_total: payload.totalPrice,
        length: 30,  // cm — adjust for your packaging
        breadth: 20, // cm
        height: 5,   // cm
        weight: 0.5, // kg — adjust for your products
        ...(payload.paymentMethod === 'COD' && {
            cod_amount: payload.codAmount || payload.totalPrice,
            cod_charges: 0,
        }),
    };

    const res = await fetch(`${SHIPROCKET_BASE}/orders/create/adhoc`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Shiprocket order creation failed: ${err}`);
    }

    return res.json();
    // Returns: { order_id, shipment_id, status, status_code, onboarding_completed_now, awb_code, courier_company_id, ... }
}

/**
 * Step 5: POST /courier/assign/awb
 * Assigns a courier and gets an AWB code for a shipment.
 */
export async function assignAWB(shipmentId: number, courierId: number) {
    const headers = await authHeaders();

    const res = await fetch(`${SHIPROCKET_BASE}/courier/assign/awb`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ shipment_id: String(shipmentId), courier_id: String(courierId) }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Shiprocket AWB assignment failed: ${err}`);
    }

    return res.json();
}

/**
 * Step 6: POST /courier/generate/pickup
 * Schedules a pickup for a shipment.
 */
export async function generatePickup(shipmentId: number) {
    const headers = await authHeaders();

    const res = await fetch(`${SHIPROCKET_BASE}/courier/generate/pickup`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ shipment_id: [shipmentId] }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Shiprocket pickup generation failed: ${err}`);
    }

    return res.json();
}

/**
 * Step 9: POST /courier/generate/label
 * Generates a shipping label PDF for a shipment.
 */
export async function generateLabel(shipmentId: number) {
    const headers = await authHeaders();

    const res = await fetch(`${SHIPROCKET_BASE}/courier/generate/label`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ shipment_id: [shipmentId] }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Shiprocket label generation failed: ${err}`);
    }

    return res.json();
    // Returns: { label_url: string } — PDF URL for printing
}

/**
 * Step 11: GET /courier/track/awb/{awb_code}
 * Tracks a shipment by AWB code.
 */
export async function trackByAWB(awbCode: string) {
    const headers = await authHeaders();

    const res = await fetch(`${SHIPROCKET_BASE}/courier/track/awb/${awbCode}`, {
        method: 'GET',
        headers,
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Shiprocket tracking failed: ${err}`);
    }

    return res.json();
}

/**
 * Step 10: POST /orders/print/invoice
 * Generates a printable invoice PDF.
 */
export async function generateInvoice(orderId: number) {
    const headers = await authHeaders();

    const res = await fetch(`${SHIPROCKET_BASE}/orders/print/invoice`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ids: [orderId] }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Shiprocket invoice generation failed: ${err}`);
    }

    return res.json();
    // Returns: { invoice_url: string }
}
