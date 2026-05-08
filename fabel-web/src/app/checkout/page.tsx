"use client";

import React, { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Truck, Package, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { useSearchParams, useRouter } from "next/navigation";

declare global {
    interface Window {
        Razorpay: any;
    }
}

const CheckoutContent = () => {
    // ... logic is inside here

    const searchParams = useSearchParams();
    const router = useRouter();
    const { items, totalPrice, clearCart } = useCartStore();
    
    // Check if we came from a successful payment redirect
    const initialOrderId = searchParams.get('orderId');
    const initialError = searchParams.get('error');

    const [step, setStep] = useState(initialOrderId ? 3 : 1); // 1: Info, 2: Payment, 3: Success
    const [orderId, setOrderId] = useState<string | null>(initialOrderId ? initialOrderId.split("-")[0] : null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState(initialError || "");
    const [paymentMethod, setPaymentMethod] = useState("online"); // online, phonepe, or cod

    // Clear cart on success param
    React.useEffect(() => {
        if (initialOrderId) {
            clearCart();
            // Optional: clean up URL
            router.replace('/checkout');
        }
    }, [initialOrderId, clearCart, router]);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        pincode: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'email' ? value.toLowerCase() : value });
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        setErrorMsg("");

        try {
            if (paymentMethod === "online") {
                const res = await loadRazorpay();
                if (!res) {
                    setErrorMsg("Razorpay SDK failed to load. Are you online?");
                    setIsProcessing(false);
                    return;
                }
            }

            const resp = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    paymentMethod,
                    items: items.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    })),
                    totalPrice: totalPrice()
                })
            });

            const data = await resp.json();

            if (!resp.ok) {
                throw new Error(data.error || "Failed to process order");
            }

            if (paymentMethod === 'online' && data.razorpayOrderId) {
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: data.amount,
                    currency: data.currency,
                    name: "FABEL",
                    description: "Order Transaction",
                    order_id: data.razorpayOrderId,
                    handler: async function (response: any) {
                        try {
                            const verifyResp = await fetch("/api/checkout/verify", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    orderId: data.orderId,
                                    razorpayOrderId: response.razorpay_order_id,
                                    razorpayPaymentId: response.razorpay_payment_id,
                                    razorpaySignature: response.razorpay_signature,
                                    email: formData.email
                                })
                            });

                            const verifyData = await verifyResp.json();
                            if (verifyResp.ok) {
                                setOrderId(data.orderId.split("-")[0]);
                                setStep(3);
                                clearCart();
                            } else {
                                throw new Error(verifyData.error || "Verification failed");
                            }
                        } catch (err) {
                            setErrorMsg("Payment verification failed. Please contact support.");
                            console.error(err);
                        }
                    },
                    prefill: {
                        name: `${formData.firstName} ${formData.lastName}`,
                        email: formData.email,
                        contact: formData.phone
                    },
                    theme: {
                        color: "#000000" // Accent color
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response: any) {
                    setErrorMsg("Payment failed: " + response.error.description);
                });
                rzp.open();
                setIsProcessing(false);
            } else if (paymentMethod === 'phonepe' && data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                // COD Flow or Error
                setOrderId(data.orderId.split("-")[0]);
                setStep(3);
                clearCart();
            }

        } catch (error: unknown) {
            setErrorMsg((error as Error).message);
        } finally {
            if (paymentMethod !== 'online') {
                setIsProcessing(false);
            }
        }
    };

    if (step === 3) {

        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-8"
                >
                    <CheckCircle2 className="w-10 h-10 text-black" />
                </motion.div>
                <h1 className="text-4xl font-black tracking-wider uppercase mb-4">Transmission Successful</h1>
                <p className="font-mono text-sm text-foreground/60 max-w-md mb-12 uppercase tracking-wider">
                    Order #FB-{orderId} has been logged in the collective. Expect dispatch within 48 standard industrial hours.
                </p>
                <Link
                    href="/products"
                    className="h-14 px-12 bg-foreground text-background font-black tracking-wider uppercase text-xs flex items-center justify-center border border-foreground hover:bg-transparent hover:text-foreground transition-all"
                >
                    Back to Archives
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12 lg:py-24">
            <div className="flex flex-col lg:flex-row gap-16">
                {/* Left Side: Forms */}
                <div className="flex-grow max-w-2xl space-y-12">
                    <Link href="/products" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider hover:text-accent transition-colors">
                        <ArrowLeft className="w-3 h-3" />
                        Abort & Return
                    </Link>

                    <div>
                        <h1 className="text-5xl font-black tracking-wider uppercase mb-2">Checkout</h1>
                        <p className="font-mono text-xs text-foreground/40 uppercase tracking-wider">System Sequence: Step {step} of 2</p>
                    </div>

                    <div className="space-y-12">
                        {step === 1 ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <section>
                                    <h2 className="flex items-center gap-3 font-black uppercase tracking-tight text-xl mb-6">
                                        <Truck className="w-5 h-5 text-accent" />
                                        Dispatch Info
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="FIRST NAME" className="bg-muted border border-border p-4 font-mono text-xs uppercase tracking-wider focus:border-accent outline-none" required />
                                        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="LAST NAME" className="bg-muted border border-border p-4 font-mono text-xs uppercase tracking-wider focus:border-accent outline-none" required />
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="COMMUNICATION (EMAIL)" className="bg-muted border border-border p-4 font-mono text-xs lowercase placeholder:uppercase tracking-wider focus:border-accent outline-none" required />
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="PHONE NUMBER" className="bg-muted border border-border p-4 font-mono text-xs uppercase tracking-wider focus:border-accent outline-none" required />
                                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="DESTINATION (STREET ADDRESS)" className="md:col-span-2 bg-muted border border-border p-4 font-mono text-xs uppercase tracking-wider focus:border-accent outline-none" required />
                                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="CITY" className="bg-muted border border-border p-4 font-mono text-xs uppercase tracking-wider focus:border-accent outline-none" required />
                                        <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="PINCODE" className="bg-muted border border-border p-4 font-mono text-xs uppercase tracking-wider focus:border-accent outline-none" required />
                                    </div>
                                    {errorMsg && step === 1 && (
                                        <p className="text-red-500 font-mono text-[10px] uppercase tracking-wider mt-4">
                                            [ ERROR: {errorMsg} ]
                                        </p>
                                    )}
                                </section>
                                <button
                                    onClick={() => {
                                        const isComplete = Object.values(formData).every(val => val.trim() !== "");
                                        if (isComplete) {
                                            setErrorMsg("");
                                            setStep(2);
                                        } else {
                                            setErrorMsg("Please fill all dispatch details to proceed");
                                        }
                                    }}
                                    className="w-full h-14 bg-accent text-black font-black tracking-wider uppercase text-xs hover:bg-white hover:text-black transition-all border border-accent"
                                >
                                    Proceed to Payment
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <section>
                                    <h2 className="flex items-center gap-3 font-black uppercase tracking-tight text-xl mb-6">
                                        <CreditCard className="w-5 h-5 text-accent" />
                                        Payment Details
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="space-y-0">
                                            <div
                                                onClick={() => setPaymentMethod("online")}
                                                className={`bg-muted border border-b-0 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer transition-colors gap-4 ${paymentMethod === 'online' ? 'border-accent' : 'border-border hover:border-accent/50'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-accent' : 'border-border'}`}>
                                                        {paymentMethod === 'online' && <div className="w-2 h-2 rounded-full bg-accent" />}
                                                    </div>
                                                    <span className="font-mono text-xs uppercase tracking-wider text-foreground">
                                                        Razorpay Payments (UPI, Cards, Int'l cards, Wallets)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 pl-8 sm:pl-0 opacity-70">
                                                    <img src="/icons/upi.svg" alt="UPI" className="h-4 object-contain" />
                                                    <img src="/icons/mastercard.svg" alt="Mastercard" className="h-4 object-contain mx-1" />
                                                    <span className="font-mono text-[10px] bg-background border border-border px-1.5 py-0.5 rounded ml-1 text-foreground/70">+11</span>
                                                </div>
                                            </div>
                                            {paymentMethod === 'online' && (
                                                <div className="bg-muted/50 border border-accent p-6 text-center border-t-0">
                                                    <p className="font-mono text-xs text-foreground/70 max-w-sm mx-auto uppercase tracking-wider">
                                                        You'll be redirected to Razorpay Payments (UPI, Cards, Int'l cards, Wallets) to complete your purchase.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            onClick={() => setPaymentMethod("phonepe")}
                                            className={`bg-muted border p-6 flex justify-between items-center cursor-pointer transition-colors ${paymentMethod === 'phonepe' ? 'border-accent' : 'border-border hover:border-accent/50'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'phonepe' ? 'border-accent' : 'border-border'}`}>
                                                    {paymentMethod === 'phonepe' && <div className="w-2 h-2 rounded-full bg-accent" />}
                                                </div>
                                                <span className="font-mono text-xs uppercase tracking-wider">PhonePe Payments</span>
                                            </div>
                                            <span className="font-mono text-[10px] text-foreground/40">UPI & CARDS</span>
                                        </div>

                                        <div
                                            onClick={() => setPaymentMethod("cod")}
                                            className={`bg-muted border p-6 flex justify-between items-center cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-accent' : 'border-border hover:border-accent/50'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-accent' : 'border-border'}`}>
                                                    {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-accent" />}
                                                </div>
                                                <span className="font-mono text-xs uppercase tracking-wider">Cash on Delivery (COD)</span>
                                            </div>
                                            <span className="font-mono text-[10px] text-foreground/40">PAY AT DOORSTEP</span>
                                        </div>

                                        <p className="font-mono text-[10px] text-foreground/40 uppercase tracking-wider text-center py-4">
                                            * All transactions are processed through FABEL&apos;s private ledger
                                        </p>
                                    </div>
                                </section>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-grow h-14 border border-border font-black tracking-wider uppercase text-xs hover:bg-muted transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={isProcessing}
                                        className="flex-[2] h-14 bg-accent text-black font-black tracking-wider uppercase text-xs hover:bg-white hover:text-black transition-all border border-accent disabled:opacity-50"
                                    >
                                        {isProcessing ? "Processing..." : "Confirm Transaction"}
                                    </button>
                                </div>
                                {errorMsg && (
                                    <div className="text-red-500 font-mono text-xs text-center uppercase tracking-wider mt-4">
                                        Error: {errorMsg}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Right Side: Summary */}
                <aside className="w-full lg:w-[400px] shrink-0">
                    <div className="bg-muted border border-border p-8 sticky top-32 space-y-8">
                        <h2 className="flex items-center gap-3 font-black uppercase tracking-tight text-xl">
                            <Package className="w-5 h-5 text-accent" />
                            Manifest
                        </h2>

                        <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="w-16 h-20 bg-card border border-border shrink-0">
                                        <img src={item.img} alt={item.name} className="w-full h-full object-cover md:grayscale md:brightness-75 group-hover:grayscale-0 active:scale-95 transition-all" />
                                    </div>
                                    <div className="flex-grow flex flex-col justify-center">
                                        <h3 className="font-bold text-[10px] md:text-xs uppercase tracking-tight truncate w-32">{item.name}</h3>
                                        <p className="font-mono text-[10px] text-foreground/40 mt-1">QTY: {item.quantity}</p>
                                        <p className="font-mono text-[10px] mt-1">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-border space-y-3">
                            <div className="flex justify-between font-mono text-[10px] text-foreground/40 uppercase tracking-[0.2em]">
                                <span>Logistics</span>
                                <span>FREE</span>
                            </div>
                            <div className="flex justify-between font-mono text-[10px] text-foreground/40 uppercase tracking-[0.2em]">
                                <span>Taxes</span>
                                <span>INCLUDED</span>
                            </div>
                            <div className="flex justify-between font-black text-2xl tracking-wider uppercase pt-2">
                                <span>Total</span>
                                <span className="text-accent">₹{totalPrice().toLocaleString("en-IN")}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-background/50 border border-border/50 text-center">
                            <p className="font-mono text-[8px] text-foreground/30 uppercase tracking-[0.3em]">
                                Authenticity Guaranteed by Fabel Studio
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div >
    );
};

export default function CheckoutPage() {
    return (
        <React.Suspense fallback={<div className="container mx-auto px-6 py-12 flex justify-center uppercase font-mono text-xs">Loading...</div>}>
            <CheckoutContent />
        </React.Suspense>
    );
}
