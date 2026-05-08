"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Upload,
    Plus,
    X,
    Save,
    ArrowLeft,
    Box,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useProductStore } from "@/store/productStore";

const AdminEditProductPage = () => {
    const router = useRouter();
    const { id } = useParams();
    const { products, updateProduct, isLoading, fetchProducts } = useProductStore();

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "TOTE BAG",
        description: "",
        stock: "",
        tag: "",
        sizes: [] as string[],
        details: [""] as string[],
    });

    const [images, setImages] = useState<string[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const loadProduct = async () => {
            if (products.length === 0) {
                await fetchProducts();
            }
            const product = products.find(p => p.id === id);
            if (product) {
                setFormData({
                    name: product.name,
                    price: product.price.toString(),
                    category: product.category,
                    description: product.description,
                    stock: product.stock.toString(),
                    tag: product.tag || "",
                    sizes: product.sizes || [],
                    details: product.details && product.details.length > 0 ? product.details : [""],
                });
                setImages(product.images || [product.img]);
                setIsFetching(false);
            } else if (!isLoading && products.length > 0) {
                // Product not found in list
                router.push("/admin/products");
            }
        };
        loadProduct();
    }, [id, products, fetchProducts, router, isLoading]);

    const sizes = ["S", "M", "L", "XL", "ONE SIZE"];

    const handleSizeToggle = (size: string) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size]
        }));
    };

    const handleAddDetail = () => {
        setFormData(prev => ({ ...prev, details: [...prev.details, ""] }));
    };

    const handleDetailChange = (index: number, value: string) => {
        const newDetails = [...formData.details];
        newDetails[index] = value;
        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await updateProduct(id as string, {
            name: formData.name,
            price: Number(formData.price),
            category: formData.category as "TOTE BAG" | "T-SHIRT",
            description: formData.description,
            stock: Number(formData.stock),
            tag: formData.tag,
            sizes: formData.sizes,
            details: formData.details.filter(d => d.trim() !== ""),
            img: images[0] || "",
            images: images,
        });

        router.push("/admin/products");
    };

    if (isFetching) {
        return (
            <div className="min-h-[400px] flex items-center justify-center font-mono text-xs uppercase tracking-wider opacity-40">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Synchronizing Archive...
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <header className="flex justify-between items-end">
                <div>
                    <Link href="/admin/products" className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase hover:text-accent transition-all mb-4">
                        <ArrowLeft size={12} />
                        Back to Products
                    </Link>
                    <h1 className="text-4xl font-black uppercase tracking-wider">
                        Modify Archive Entry
                    </h1>
                </div>
                <button
                    form="product-form"
                    type="submit"
                    className="flex items-center gap-3 bg-accent text-black px-8 py-4 text-xs font-mono font-bold tracking-[0.2em] uppercase hover:bg-white transition-all shadow-xl disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                    Update Transmission
                </button>
            </header>

            <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                {/* Left Side: Basic Info */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white/5 border border-white/10 p-8 space-y-6">
                        <h3 className="text-xs font-mono text-accent tracking-[0.2em] uppercase border-b border-white/10 pb-4 flex items-center gap-2">
                            <Box size={14} /> Basic Product Data
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Product Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-black border border-white/10 p-4 text-xs font-mono focus:border-accent outline-none"
                                    placeholder="E.G. CORE TOTE / MODULAR"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Category</label>
                                    <select
                                        className="w-full bg-black border border-white/10 p-4 text-xs font-mono focus:border-accent outline-none appearance-none cursor-pointer"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="TOTE BAG">TOTE BAG</option>
                                        <option value="T-SHIRT">T-SHIRT</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Tag (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black border border-white/10 p-4 text-xs font-mono focus:border-accent outline-none"
                                        placeholder="E.G. NEW DROP"
                                        value={formData.tag}
                                        onChange={e => setFormData({ ...formData, tag: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Price (INR)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-black border border-white/10 p-4 text-xs font-mono focus:border-accent outline-none"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Current Stock</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-black border border-white/10 p-4 text-xs font-mono focus:border-accent outline-none"
                                        placeholder="0"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 pt-4">
                                <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full bg-black border border-white/10 p-4 text-xs font-mono focus:border-accent outline-none resize-none"
                                    placeholder="Enter detailed industrial specifications..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/5 border border-white/10 p-8 space-y-6">
                        <h3 className="text-xs font-mono text-accent tracking-[0.2em] uppercase border-b border-white/10 pb-4">
                            Specifications & Details
                        </h3>
                        <div className="space-y-4">
                            {formData.details.map((detail, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-grow bg-black border border-white/10 p-4 text-xs font-mono focus:border-accent outline-none"
                                        placeholder={`Detail #${index + 1}`}
                                        value={detail}
                                        onChange={e => handleDetailChange(index, e.target.value)}
                                    />
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, details: prev.details.filter((_, i) => i !== index) }))}
                                            className="p-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddDetail}
                                className="w-full py-4 border border-dashed border-white/20 text-white/40 font-mono text-[10px] uppercase hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={14} /> Add Specification
                            </button>
                        </div>
                    </section>
                </div>

                {/* Right Side: Assets & Variants */}
                <div className="space-y-8">
                    <section className="bg-white/5 border border-white/10 p-8 space-y-6">
                        <h3 className="text-xs font-mono text-accent tracking-[0.2em] uppercase border-b border-white/10 pb-4 flex items-center gap-2">
                            Gallery Assets
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {images.map((img, i) => (
                                    <div key={i} className="relative aspect-square border border-white/10 bg-black group overflow-hidden">
                                        <img src={img} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                        <button
                                            type="button"
                                            onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}

                                <label className="aspect-square border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-white/20 hover:border-accent hover:text-accent transition-all group cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/webp"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            try {
                                                const { uploadProductImage } = await import('@/lib/supabase');
                                                const publicUrl = await uploadProductImage('products', `${Date.now()}-${file.name}`, file);
                                                setImages(prev => [...prev, publicUrl]);
                                            } catch (error) {
                                                console.error("Upload failed", error);
                                                alert("Upload failed. Make sure the 'products' bucket exists and is set to public in Supabase.");
                                            }
                                        }}
                                    />
                                    <Upload size={20} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[8px] font-mono uppercase text-center px-2">Click to Upload<br />(Supabase)</span>
                                </label>
                            </div>
                            <p className="text-[8px] font-mono text-white/20 uppercase text-center mt-2">
                                Supported formats: JPG, PNG, WEBP (Max 5MB)
                            </p>
                        </div>
                    </section>

                    <section className="bg-white/5 border border-white/10 p-8 space-y-6">
                        <h3 className="text-xs font-mono text-accent tracking-[0.2em] uppercase border-b border-white/10 pb-4">
                            Size Variants
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {sizes.map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => handleSizeToggle(size)}
                                    className={`px-4 py-3 text-[10px] font-mono border transition-all ${formData.sizes.includes(size)
                                        ? "bg-accent text-black border-accent"
                                        : "bg-black text-white/40 border-white/10 hover:border-white/40"
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </form>
        </div>
    );
};

export default AdminEditProductPage;
