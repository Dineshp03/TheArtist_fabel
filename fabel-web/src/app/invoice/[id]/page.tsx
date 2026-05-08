"use client";

import React, { useEffect, useState } from "react";
import { use } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    user_email: string;
    phone?: string;
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    pincode: string;
    state?: string;
    total_price: number;
    status: string;
    created_at: string;
    order_items: OrderItem[];
}

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const orderId = resolvedParams.id;

    const [mounted, setMounted] = useState(false);
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Hydration-safe authentication check
    useEffect(() => {
        if (mounted) {
            if (!isAuthenticated || user?.role !== "admin") {
                router.push("/auth/login");
            }
        }
    }, [mounted, isAuthenticated, user, router]);

    useEffect(() => {
        if (!mounted || !isAuthenticated || user?.role !== "admin") return;

        const fetchOrder = async () => {
            try {
                const { data, error: sbError } = await supabase
                    .from("orders")
                    .select("*, order_items(*)")
                    .eq("id", orderId)
                    .single();

                if (sbError) throw sbError;
                setOrder(data);

                // Add a small delay for images/fonts to load, then open print dialog
                setTimeout(() => {
                    window.print();
                }, 500);

            } catch (err: any) {
                console.error("Failed to load order:", err);
                setError(err.message || "Failed to load order data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, mounted, isAuthenticated, user]);

    // Don't render anything until mounted and authenticated to prevent flash of restricted content or layout mismatch
    if (!mounted || !isAuthenticated || user?.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-red-500">
                {error || "Order not found."}
            </div>
        );
    }

    const orderNumber = `FB-${order.id.split('-')[0].toUpperCase()}`;
    const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    const isCOD = order.status.toLowerCase().includes("cod");

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: auto; margin: 0mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; color: black !important; }
                    .no-print { display: none !important; }
                }
            ` }} />

            <div className="bg-white min-h-screen text-black flex justify-center py-10 print:py-0" style={{ fontFamily: 'Arial, sans-serif' }}>
                <button
                    onClick={() => window.print()}
                    className="fixed top-4 right-4 bg-black text-white px-6 py-2 text-xs font-bold uppercase tracking-wider no-print z-50 hover:bg-black/80 transition-colors"
                >
                    Print Again
                </button>

                {/* A4 Wrapper for screen viewing */}
                <div className="w-full max-w-[210mm] min-h-[297mm] bg-white border border-gray-200 shadow-xl print:border-none print:shadow-none mx-auto relative overflow-hidden">

                    {/* Dark Header Strip */}
                    <div className="bg-black text-white px-12 py-10 print:bg-black print:text-white">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <h1 className="text-4xl font-extrabold tracking-wider uppercase">FABEL</h1>
                                <p className="text-[10px] tracking-[0.3em] uppercase opacity-70">Authenticity Guaranteed</p>
                            </div>
                            <div className="text-right space-y-1">
                                <h2 className="text-2xl font-bold tracking-wider">INVOICE</h2>
                                <p className="text-xs uppercase tracking-wider opacity-80">{orderNumber}</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-12 py-12 space-y-12">
                        {/* Summary Info */}
                        <div className="grid grid-cols-2 gap-8 text-sm">
                            <div className="space-y-4">
                                <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] border-b border-gray-200 pb-2">Billed To / Delivered To</h3>
                                <div className="space-y-1 leading-relaxed">
                                    <p className="font-bold text-base uppercase">{order.first_name} {order.last_name}</p>
                                    <p className="text-gray-600">{order.address}</p>
                                    <p className="text-gray-600">{order.city}, {order.state} - {order.pincode}</p>
                                    <p className="text-gray-600 pt-2">Email: {order.user_email}</p>
                                    <p className="text-gray-600">Phone: +91 {order.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] border-b border-gray-200 pb-2">Order Details</h3>
                                <div className="space-y-2 text-gray-800">
                                    <div className="grid grid-cols-2 gap-4">
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Date</span>
                                        <span className="font-semibold">{orderDate}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Payment</span>
                                        <span className="font-semibold uppercase">{isCOD ? 'Cash on Delivery' : 'Prepaid (Online)'}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Status</span>
                                        <span className="font-semibold uppercase">{order.status.replace(/ - COD/i, '')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Table */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] border-b border-black pb-2">Hardware Manifest (Items)</h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                        <th className="py-4 px-2 font-normal w-1/2">Description</th>
                                        <th className="py-4 px-2 font-normal text-center">Unit Price</th>
                                        <th className="py-4 px-2 font-normal text-center">Qty</th>
                                        <th className="py-4 px-2 font-normal text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="border-b border-gray-800">
                                    {order.order_items?.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 last:border-0 group">
                                            <td className="py-6 px-2 font-bold uppercase tracking-tight">{item.product_name}</td>
                                            <td className="py-6 px-2 text-center text-gray-600">₹{item.price.toLocaleString("en-IN")}</td>
                                            <td className="py-6 px-2 text-center text-gray-600">{item.quantity}</td>
                                            <td className="py-6 px-2 text-right font-medium text-black">₹{(item.price * item.quantity).toLocaleString("en-IN")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Calculation */}
                        <div className="flex justify-end pt-4 pb-12">
                            <div className="w-1/2 space-y-3 text-sm">
                                <div className="flex justify-between items-center text-gray-600 px-2 pb-2">
                                    <span className="text-xs uppercase tracking-wider">Subtotal</span>
                                    <span>₹{order.total_price.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600 px-2 pb-2">
                                    <span className="text-xs uppercase tracking-wider">Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600 px-2 pb-2">
                                    <span className="text-xs uppercase tracking-wider">Tax (Included)</span>
                                    <span>₹0</span>
                                </div>
                                <div className="flex justify-between items-center border-t-2 border-black pt-4 px-2">
                                    <span className="text-sm font-bold uppercase tracking-wider">Grand Total</span>
                                    <span className="text-xl font-extrabold tracking-wider">₹{order.total_price.toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-0 w-full p-12 text-center border-t border-gray-100 text-xs text-gray-400 uppercase tracking-wider bg-gray-50/50">
                        <p>Thank you for choosing Fabel.</p>
                        <p className="mt-1">For support, contact update@fabel.in</p>
                    </div>

                </div>
            </div>
        </>
    );
}
