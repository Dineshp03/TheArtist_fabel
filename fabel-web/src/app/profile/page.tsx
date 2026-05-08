"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Package, ShieldCheck, Activity, ArrowLeft, Clock, CreditCard, Save, X, Edit3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Order {
    id: string;
    created_at: string;
    total_price: number;
    status: string;
}

const ProfilePage = () => {
    const { user, logout, isAuthenticated, updateUser } = useAuthStore();
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.name || "");
    const [editEmail, setEditEmail] = useState(user?.email || "");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        const fetchOrders = async () => {
            if (!user?.email) return;

            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .eq("user_email", user.email)
                .order("created_at", { ascending: false });

            if (!error && data) {
                setOrders(data);
            }
            setLoading(false);
        };

        fetchOrders();
    }, [isAuthenticated, user?.email, router]);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        // Update Supabase Auth Metadata
        const { error } = await supabase.auth.updateUser({
            email: editEmail,
            data: { name: editName }
        });

        if (error) {
            setMessage(`ERROR: ${error.message}`);
        } else {
            updateUser({ name: editName, email: editEmail });
            setMessage("PROFILE UPDATED SUCCESSFULLY");
            setTimeout(() => setIsEditing(false), 2000);
        }
        setSaving(false);
    };

    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_price), 0);

    const stats = [
        { label: "TRANSMISSIONS", value: orders.length.toString() },
        { label: "TOTAL SPENT", value: `₹${totalSpent.toLocaleString()}` },
        { label: "CLEARANCE", value: user?.role === "admin" ? "S-TIER" : "LVL 1" },
    ];

    if (!isAuthenticated) return null;

    return (
        <main className="min-h-screen pt-32 pb-24 bg-background px-6">
            <div className="container mx-auto max-w-4xl">
                <Link href="/" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider hover:text-accent transition-colors mb-12">
                    <ArrowLeft className="w-3 h-3" />
                    Return to Surface
                </Link>

                <div className="flex flex-col md:flex-row gap-12 items-start">
                    {/* Operator Node */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full md:w-1/3 p-8 bg-muted border border-border relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 -rotate-45 translate-x-8 -translate-y-8" />

                        <div className="w-20 h-20 bg-accent/10 flex items-center justify-center mb-6 border border-accent/20">
                            <User className="w-10 h-10 text-accent" />
                        </div>

                        <AnimatePresence mode="wait">
                            {!isEditing ? (
                                <motion.div
                                    key="info"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <h1 className="text-3xl font-black uppercase tracking-wider leading-none mb-1">
                                        {user?.name}
                                    </h1>
                                    <p className="font-mono text-[10px] text-foreground/40 uppercase tracking-wider mb-8">
                                        {user?.email}
                                    </p>

                                    <div className="space-y-4">
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="w-full flex items-center justify-between p-3 border border-border hover:border-accent transition-all group/item"
                                        >
                                            <span className="font-mono text-[10px] uppercase tracking-wider">Edit Profile</span>
                                            <Edit3 className="w-3 h-3 text-foreground/20 group-hover/item:text-accent" />
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-between p-3 border border-border hover:border-accent hover:bg-accent/5 transition-all text-red-500 group/item"
                                        >
                                            <span className="font-mono text-[10px] uppercase tracking-wider">Terminate Session</span>
                                            <LogOut className="w-3 h-3" />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="edit"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    onSubmit={handleUpdateProfile}
                                    className="space-y-4"
                                >
                                    <div className="space-y-1">
                                        <label className="font-mono text-[8px] uppercase tracking-wider text-foreground/40">New Identifier</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full bg-background border border-border p-2 font-mono text-xs uppercase focus:border-accent outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="font-mono text-[8px] uppercase tracking-wider text-foreground/40">Update Comms</label>
                                        <input
                                            type="email"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value.toLowerCase())}
                                            className="w-full bg-background border border-border p-2 font-mono text-xs lowercase placeholder:uppercase focus:border-accent outline-none font-sans"
                                            required
                                        />
                                    </div>

                                    {message && (
                                        <p className="font-mono text-[8px] text-accent uppercase">{message}</p>
                                    )}

                                    <div className="flex gap-2 pt-4">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-grow bg-accent text-black p-2 font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-white transition-colors"
                                        >
                                            {saving ? "SAVING..." : <><Save className="w-3 h-3" /> SAVE</>}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="p-2 border border-border hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Dashboard Feed */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-grow space-y-8 w-full"
                    >
                        <div className="grid grid-cols-3 gap-4">
                            {stats.map((stat) => (
                                <div key={stat.label} className="p-4 border border-border bg-card">
                                    <div className="text-2xl font-black italic mb-1">{stat.value}</div>
                                    <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-foreground/40">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 border border-border bg-card/50 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-accent" />
                                    <h2 className="font-black uppercase tracking-wider text-sm">Active Transmissions</h2>
                                </div>
                                <div className="font-mono text-[8px] text-foreground/20 uppercase tracking-wider">LOG_SYNC: ON</div>
                            </div>

                            {loading ? (
                                <div className="h-48 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">
                                    Scanning Archive...
                                </div>
                            ) : orders.length > 0 ? (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="p-4 border border-border bg-background hover:border-accent/40 transition-colors group">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2 bg-muted border border-border group-hover:bg-accent/5 transition-colors">
                                                        <Package className="w-4 h-4 text-accent" />
                                                    </div>
                                                    <div>
                                                        <p className="font-mono text-[10px] uppercase tracking-wider mb-1">
                                                            ID: {order.id.slice(0, 8)}...
                                                        </p>
                                                        <div className="flex items-center gap-4">
                                                            <span className="flex items-center gap-1 font-mono text-[10px] text-foreground/40 uppercase">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(order.created_at).toLocaleDateString()} // {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between md:justify-end gap-8">
                                                    <div className="text-right">
                                                        <div className="font-black text-sm italic">₹{order.total_price.toLocaleString()}</div>
                                                        <div className="font-mono text-[8px] uppercase tracking-wider text-foreground/40">Total Amount</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="px-2 py-0.5 border border-border font-mono text-[8px] uppercase tracking-wider bg-muted">
                                                            {order.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-48 border border-border border-dashed flex flex-col items-center justify-center gap-4 text-center">
                                    <Activity className="w-6 h-6 text-foreground/10" />
                                    <p className="font-mono text-[10px] text-foreground/20 uppercase tracking-wider">
                                        No active orders detected in this archive node.
                                    </p>
                                    <Link href="/products" className="text-[10px] font-black uppercase tracking-wider underline underline-offset-4 hover:text-accent">
                                        Initialize Procurement
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-l-2 border-accent bg-accent/5">
                            <p className="font-mono text-[10px] uppercase tracking-wider leading-relaxed">
                                <span className="text-accent font-bold">SYSTEM NOTICE:</span> All transmissions are processed through our secure Indian nodes. Total paid history is summarized for billing integrity.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
};

export default ProfilePage;
