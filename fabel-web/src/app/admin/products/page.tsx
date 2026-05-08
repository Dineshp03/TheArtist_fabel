"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package,
    Edit2,
    Trash2,
    Plus,
    Search,
    Filter,
    ArrowUpRight,
    Eye,
    AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useProductStore } from "@/store/productStore";
import { useEffect } from "react";

const AdminProductsPage = () => {
    const { products, fetchProducts, deleteProduct, isLoading } = useProductStore();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (confirm("CRITICAL: THIS ACTION WILL PERMANENTLY DELETE THIS ARCHIVE ENTRY. CONTINUE?")) {
            await deleteProduct(id);
        }
    };

    const lowStockProducts = products.filter(p => p.stock < 5);

    return (
        <div className="space-y-12">
            <header className="flex justify-between items-end">
                <div>
                    <h4 className="text-accent font-mono text-[10px] tracking-[0.3em] uppercase mb-2">
                        Inventory Control
                    </h4>
                    <h1 className="text-4xl font-black uppercase tracking-wider">
                        Product Archive
                    </h1>
                </div>
                <Link
                    href="/admin/products/add"
                    className="flex items-center gap-3 bg-accent text-black px-8 py-4 text-xs font-mono font-bold tracking-[0.2em] uppercase hover:bg-white transition-all shadow-xl"
                >
                    <Plus size={16} />
                    New Archive Entry
                </Link>
            </header>

            {/* Low Stock Intimation */}
            {lowStockProducts.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-red-500">
                        <AlertTriangle size={20} className="animate-pulse" />
                        <h3 className="font-bold tracking-wider uppercase">CRITICAL SYSTEM ALERT: LOW INVENTORY</h3>
                    </div>
                    <div className="text-xs uppercase leading-relaxed text-red-500/80">
                        Immediate action required. The following entries have fallen beneath the minimum operational threshold (5 UNITS):
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {lowStockProducts.map(p => (
                            <span key={p.id} className="bg-red-500/20 border border-red-500/30 text-red-500 px-3 py-1 text-xs font-bold">
                                {p.name} ({p.stock} LEFT)
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters Bar */}
            <div className="flex border-b border-white/10 pb-8 gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input
                        type="text"
                        placeholder="FILTER BY NAME, CATEGORY, OR ID..."
                        className="w-full bg-white/5 border border-white/10 py-4 pl-12 pr-4 text-[10px] font-mono tracking-[0.2em] focus:border-accent focus:outline-none transition-all uppercase"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-6 border border-white/10 hover:border-white/40 text-xs font-mono tracking-wider uppercase flex items-center gap-2 transition-all">
                    <Filter size={14} />
                    Filters
                </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-white/40 uppercase font-mono text-[10px] tracking-wider">
                            <th className="px-6 py-4 font-normal">Product Archve</th>
                            <th className="px-6 py-4 font-normal">Category</th>
                            <th className="px-6 py-4 font-normal text-right">Price (INR)</th>
                            <th className="px-6 py-4 font-normal text-center">Stock</th>
                            <th className="px-6 py-4 font-normal text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-white/40 font-mono text-xs uppercase">
                                    Fetching Archives...
                                </td>
                            </tr>
                        ) : (
                            <AnimatePresence>
                                {filteredProducts.map((product, i) => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td className="px-6 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 border border-white/10 overflow-hidden bg-black shrink-0 relative">
                                                    {product.img ? (
                                                        <img
                                                            src={product.img}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                                                            <Package size={20} className="text-white/10" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold tracking-tight uppercase group-hover:text-accent transition-colors">{product.name}</h4>
                                                    <p className="text-[8px] font-mono text-white/20">UID: {product.id.toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-[10px] font-mono bg-white/5 px-3 py-1 border border-white/10 uppercase tracking-wider">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <p className="font-mono text-sm text-accent">₹{product.price.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`text-sm font-black ${product.stock < 5 ? 'text-red-500 animate-pulse' : ''}`}>
                                                    {product.stock}
                                                </span>
                                                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${product.stock < 5 ? 'bg-red-500' : 'bg-accent'}`}
                                                        style={{ width: `${Math.min(product.stock * 5, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <Link
                                                    href={`/products/${product.id}`}
                                                    target="_blank"
                                                    className="p-3 bg-white/5 border border-white/10 hover:border-white/40 hover:text-accent transition-all"
                                                    title="View Transmision"
                                                >
                                                    <Eye size={14} />
                                                </Link>
                                                <Link
                                                    href={`/admin/products/${product.id}`}
                                                    className="p-3 bg-white/5 border border-white/10 hover:border-white/40 hover:text-white transition-all"
                                                    title="Modify entry"
                                                >
                                                    <Edit2 size={14} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                    title="Purge archive"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        )}
                    </tbody>
                </table>

                {!isLoading && filteredProducts.length === 0 && (
                    <div className="py-20 text-center">
                        <Package className="mx-auto text-white/10 mb-4" size={48} />
                        <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em]">
                            NO ENTRIES MATCHING SYSTEM SEARCH
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProductsPage;
