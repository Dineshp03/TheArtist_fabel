"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Package,
    ShoppingBag,
    ArrowUpRight,
    TrendingUp,
    AlertTriangle,
    CreditCard,
    Loader2
} from "lucide-react";
import Link from "next/link";

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    img: string;
}

interface Order {
    id: string;
    total_price: number;
    status: string;
    created_at: string;
}

const AdminDashboard = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [productsRes, ordersRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/orders')
                ]);

                if (productsRes.ok) {
                    setProducts(await productsRes.json());
                }

                if (ordersRes.ok) {
                    setOrders(await ordersRes.json());
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
    const lowStockProducts = products.filter(p => p.stock < 5);
    const pendingOrders = orders.filter(o => o.status === 'PROCESSING').length;

    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_price, 0);

    const stats = [
        {
            label: "Total Products",
            value: totalProducts,
            icon: Package,
            trend: "Live Catalog",
            color: "text-blue-500"
        },
        {
            label: "Total Orders",
            value: totalOrders,
            icon: ShoppingBag,
            trend: `${todayOrders.length} today`,
            color: "text-green-500"
        },
        {
            label: "Total Revenue",
            value: `₹${totalRevenue.toLocaleString("en-IN")}`,
            icon: CreditCard,
            trend: `+₹${todayRevenue.toLocaleString("en-IN")} today`,
            color: "text-accent"
        },
        {
            label: "Low Stock Alert",
            value: lowStockProducts.length,
            icon: AlertTriangle,
            trend: "Action required",
            color: "text-red-500"
        },
    ];

    return (
        <div style={{ fontFamily: 'Arial, sans-serif' }} className="space-y-12">
            <header className="mb-12">
                <h4 className="text-accent font-mono text-[10px] tracking-[0.3em] uppercase mb-2">
                    System Intelligence
                </h4>
                <h1 className="text-4xl uppercase tracking-wider">
                    Dashboard Overview
                </h1>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 border border-white/10 p-6 brutalist-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 bg-white/5 ${stat.color}`}>
                                    <Icon size={20} />
                                </div>
                                <ArrowUpRight size={14} className="text-white/20" />
                            </div>
                            <h3 className="text-white/40 text-[10px] font-mono tracking-wider uppercase mb-1">
                                {stat.label}
                            </h3>
                            <p className="text-3xl font-bold tracking-wider mb-2">
                                {stat.value}
                            </p>
                            <p className="text-[10px] font-mono text-white/20 uppercase">
                                {stat.trend}
                            </p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity / Low Stock */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/5 border border-white/10 p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3">
                                <TrendingUp size={20} className="text-accent" />
                                Inventory Status
                            </h2>
                            <Link href="/admin/products" className="text-[10px] font-mono text-white/40 uppercase hover:text-accent transition-all">
                                View Full List
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {products.length === 0 ? (
                                <p className="text-xs uppercase text-white/40 text-center py-4">No products in archive.</p>
                            ) : (
                                products.slice(0, 5).map((product) => (
                                    <div key={product.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-black border border-white/10 overflow-hidden relative">
                                                {product.img ? (
                                                    <img src={product.img} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center opacity-20"><Package size={16} /></div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-mono text-white/40 uppercase">{product.category}</p>
                                                <h4 className="text-sm font-bold uppercase tracking-tight px-1">{product.name}</h4>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-mono text-white/40 uppercase">Stock</p>
                                            <p className={`text-sm font-bold ${product.stock < 5 ? 'text-red-500' : 'text-white'}`}>
                                                {product.stock} UNITS
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Notifications / Alerts */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 p-8">
                        <h2 className="text-xl font-bold uppercase tracking-tight mb-8">
                            Critical Alerts
                        </h2>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                            {lowStockProducts.length > 0 ? (
                                lowStockProducts.map(p => (
                                    <div key={p.id} className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-4">
                                        <AlertTriangle size={18} className="shrink-0 mt-1" />
                                        <div>
                                            <p className="text-[10px] font-mono font-bold uppercase tracking-wider mb-1">Low Stock Warning</p>
                                            <p className="text-[10px] opacity-80 uppercase leading-relaxed">
                                                {p.name} is down to <span className="font-bold border-b border-red-500/50">{p.stock} units</span>.
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] text-white/40 uppercase text-center py-8">
                                    No immediate alerts detected. Optimal stock levels.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="bg-accent p-8 text-black">
                        <h2 className="text-xl font-bold uppercase tracking-tight mb-4">
                            Archive Status
                        </h2>
                        <p className="text-[10px] uppercase mb-6 leading-relaxed opacity-80 whitespace-pre-line font-medium text-black">
                            {pendingOrders > 0
                                ? `System is active.\n\nThere are ${pendingOrders} new transmission(s) pending review and processing.`
                                : `System is operating at optimal capacity.\n\nNo pending transmissions require immediate action.`}
                        </p>
                        <Link href="/admin/orders">
                            <button className="w-full bg-black text-white py-4 text-[10px] font-mono uppercase tracking-[0.2em] font-bold hover:bg-white hover:text-black transition-all border border-black hover:border-transparent">
                                Review Transmissions
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
