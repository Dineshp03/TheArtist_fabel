import crypto from 'crypto';

const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || '';
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || '';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const PHONEPE_ENV = process.env.PHONEPE_ENV || 'UAT'; // UAT or PROD

const PHONEPE_URL = PHONEPE_ENV === 'PROD' 
  ? "https://api.phonepe.com/apis/hermes/pg/v1/pay" 
  : "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

const PHONEPE_STATUS_URL = PHONEPE_ENV === 'PROD'
  ? "https://api.phonepe.com/apis/hermes/pg/v1/status"
  : "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status";


export const createPhonePePayment = async (orderId: string, amount: number, redirectUrl: string, userId: string, mobileNumber: string) => {
    const payload = {
        merchantId: PHONEPE_MERCHANT_ID,
        merchantTransactionId: orderId,
        merchantUserId: userId || `MUID-${orderId}`,
        amount: Math.round(amount * 100), // amount in paise
        redirectUrl: redirectUrl,
        redirectMode: "POST",
        callbackUrl: redirectUrl.replace('/api/checkout/phonepe-callback', '/api/webhook/phonepe'), // S2S callback URL
        mobileNumber: mobileNumber,
        paymentInstrument: {
            type: "PAY_PAGE"
        }
    };

    const payloadString = JSON.stringify(payload);
    const base64Payload = Buffer.from(payloadString).toString("base64");
    
    const stringToHash = base64Payload + "/pg/v1/pay" + PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = sha256 + "###" + PHONEPE_SALT_INDEX;

    const response = await fetch(PHONEPE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum
        },
        body: JSON.stringify({ request: base64Payload })
    });

    const data = await response.json();
    return data;
};

export const verifyPhonePeChecksum = (base64Response: string, signature: string) => {
    const stringToHash = base64Response + PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const expectedSignature = sha256 + "###" + PHONEPE_SALT_INDEX;
    return expectedSignature === signature;
};

export const checkPhonePePaymentStatus = async (merchantTransactionId: string) => {
    const stringToHash = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}` + PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = sha256 + "###" + PHONEPE_SALT_INDEX;

    const response = await fetch(`${PHONEPE_STATUS_URL}/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
            "X-MERCHANT-ID": PHONEPE_MERCHANT_ID
        }
    });

    const data = await response.json();
    return data;
};
