const crypto = require('crypto');

const PHONEPE_MERCHANT_ID = 'M22P4TC36FJMC';
const PHONEPE_SALT_KEY = 'd8237d44-4140-4e6b-94bb-4bfe82b6dc6b';
const PHONEPE_SALT_INDEX = '1';
const PHONEPE_ENV = 'UAT'; 

const PHONEPE_URL = PHONEPE_ENV === 'PROD' 
  ? "https://api.phonepe.com/apis/hermes/pg/v1/pay" 
  : "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

async function test() {
    const orderId = 'test_' + Date.now();
    const payload = {
        merchantId: PHONEPE_MERCHANT_ID,
        merchantTransactionId: orderId,
        merchantUserId: `MUID-${orderId}`,
        amount: 10000,
        redirectUrl: 'http://localhost:3000/api/checkout/phonepe-callback',
        redirectMode: "POST",
        callbackUrl: 'http://localhost:3000/api/webhook/phonepe',
        mobileNumber: '9999999999',
        paymentInstrument: {
            type: "PAY_PAGE"
        }
    };

    const payloadString = JSON.stringify(payload);
    const base64Payload = Buffer.from(payloadString).toString("base64");
    
    const stringToHash = base64Payload + "/pg/v1/pay" + PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = sha256 + "###" + PHONEPE_SALT_INDEX;

    console.log("URL:", PHONEPE_URL);
    console.log("Checksum:", checksum);
    console.log("Payload Base64:", base64Payload);

    try {
        const response = await fetch(PHONEPE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-VERIFY": checksum
            },
            body: JSON.stringify({ request: base64Payload })
        });
        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Response text:", text);
    } catch (err) {
        console.error(err);
    }
}

test();
