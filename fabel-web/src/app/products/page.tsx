"use client";

import React, { useState, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProductStore } from "@/store/productStore";
import { useEffect } from "react";
import ProductCard from "@/components/customer/ProductCard";

const CATEGORIES = ["ALL", "TOTE BAG"];
const PRICE_RANGES = [
    { label: "ALL", min: 0, max: Infinity },
    { label: "UNDER ₹1500", min: 0, max: 1500 },
    { label: "₹1500 - ₹3000", min: 1500, max: 3000 },
    { label: "OVER ₹3000", min: 3000, max: Infinity },
];
const SIZES = ["S", "M", "L", "XL", "ONE SIZE"];

const ProductsFilter = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const categoryParam = searchParams.get("category");

    const activeCategory = useMemo(() => {
        if (!categoryParam) return "ALL";
        const normalized = categoryParam.toUpperCase().replace("-", " ");
        return CATEGORIES.includes(normalized) ? normalized : "ALL";
    }, [categoryParam]);

    const setActiveCategory = (cat: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (cat === "ALL") {
            params.delete("category");
        } else {
            params.set("category", cat.toLowerCase().replace(" ", "-"));
        }
        router.push(`/products?${params.toString()}`, { scroll: false });
    };

    const [activePrice, setActivePrice] = useState(PRICE_RANGES[0]);
    const [activeSize, setActiveSize] = useState("ALL");
    const [sortBy, setSortBy] = useState("NEWEST");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { products, fetchProducts, isLoading } = useProductStore();

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filteredProducts = useMemo(() => {
        const result = products.filter((p) => {
            const matchCategory = activeCategory === "ALL" || p.category === activeCategory;
            const matchPrice = p.price >= activePrice.min && p.price <= activePrice.max;
            const matchSize = activeSize === "ALL" || p.sizes.includes(activeSize);
            return matchCategory && matchPrice && matchSize;
        });

        if (sortBy === "PRICE_LOW") result.sort((a, b) => a.price - b.price);
        if (sortBy === "PRICE_HIGH") result.sort((a, b) => b.price - a.price);

        return result;
    }, [activeCategory, activePrice, activeSize, sortBy, products]);

    return (
        <main className="min-h-screen pt-32 pb-24 bg-background">
            <div className="container mx-auto px-3 sm:px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-border pb-8">
                    <div>
                        <h1 className="text-6xl font-black tracking-wider uppercase mb-2">
                            The <span className="text-accent">Archive</span>
                        </h1>
                        <p className="font-mono text-xs text-foreground/40 tracking-wider uppercase">
                            Industrial Utility & Minimalist Apparel / {filteredProducts.length} ITEMS
                        </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="flex items-center gap-2 bg-muted border border-border px-4 py-2 text-xs font-mono tracking-wider uppercase md:hidden"
                        >
                            <Filter className="w-4 h-4" /> Filters
                        </button>

                        <div className="relative group ml-auto md:ml-0">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-muted border border-border px-6 py-2 pr-10 text-xs font-mono tracking-wider uppercase focus:outline-none focus:border-accent cursor-pointer"
                            >
                                <option value="NEWEST">Newest Arrivals</option>
                                <option value="PRICE_LOW">Price: Low to High</option>
                                <option value="PRICE_HIGH">Price: High to Low</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-40" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-12">
                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block w-64 shrink-0">
                        <div className="sticky top-32 space-y-10">
                            {/* Category Filter */}
                            <div>
                                <h3 className="text-[10px] font-mono tracking-[0.2em] text-foreground/40 uppercase mb-4">Category</h3>
                                <div className="space-y-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`block w-full text-left text-sm font-bold tracking-tight transition-colors ${activeCategory === cat ? "text-accent" : "hover:text-accent/60"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div>
                                <h3 className="text-[10px] font-mono tracking-[0.2em] text-foreground/40 uppercase mb-4">Price</h3>
                                <div className="space-y-2">
                                    {PRICE_RANGES.map((range) => (
                                        <button
                                            key={range.label}
                                            onClick={() => setActivePrice(range)}
                                            className={`block w-full text-left text-sm font-bold tracking-tight transition-colors ${activePrice.label === range.label ? "text-accent" : "hover:text-accent/60"
                                                }`}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Size Filter */}
                            <div>
                                <h3 className="text-[10px] font-mono tracking-[0.2em] text-foreground/40 uppercase mb-4">Size</h3>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setActiveSize("ALL")}
                                        className={`border px-3 py-1 text-[10px] font-mono tracking-wider transition-all ${activeSize === "ALL"
                                            ? "bg-accent border-accent text-black"
                                            : "border-border hover:border-accent"
                                            }`}
                                    >
                                        ALL
                                    </button>
                                    {SIZES.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setActiveSize(size)}
                                            className={`border px-3 py-1 text-[10px] font-mono tracking-wider transition-all ${activeSize === size
                                                ? "bg-accent border-accent text-black"
                                                : "border-border hover:border-accent"
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="flex-grow">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-8 sm:gap-x-8 sm:gap-y-12">
                            {isLoading && filteredProducts.length === 0 ? (
                                <div className="col-span-full py-24 text-center">
                                    <p className="font-mono text-xs uppercase tracking-wider opacity-40 animate-pulse">
                                        Loading Archive...
                                    </p>
                                </div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredProducts.map((product, i) => (
                                        <ProductCard key={product.id} product={product} index={i} />
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {!isLoading && filteredProducts.length === 0 && (
                            <div className="py-24 text-center border border-dashed border-border">
                                <p className="font-mono text-xs uppercase tracking-wider opacity-40">
                                    No products matched your criteria
                                </p>
                                <button
                                    onClick={() => {
                                        setActiveCategory("ALL");
                                        setActivePrice(PRICE_RANGES[0]);
                                        setActiveSize("ALL");
                                    }}
                                    className="mt-4 text-xs font-bold underline underline-offset-4 hover:text-accent transition-colors"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-xs bg-muted border-l border-border z-50 p-8 md:hidden overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <h2 className="font-black text-2xl tracking-wider uppercase">Filters</h2>
                                <button onClick={() => setIsSidebarOpen(false)}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Replicate Sidebar Content here for Mobile */}
                            <div className="space-y-12">
                                <div>
                                    <h3 className="text-[10px] font-mono tracking-[0.2em] text-foreground/40 uppercase mb-6 border-b border-border pb-2">Category</h3>
                                    <div className="flex flex-col gap-4">
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => { setActiveCategory(cat); setIsSidebarOpen(false); }}
                                                className={`text-left text-xl font-black tracking-tight ${activeCategory === cat ? "text-accent" : ""}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-mono tracking-[0.2em] text-foreground/40 uppercase mb-6 border-b border-border pb-2">Price</h3>
                                    <div className="flex flex-col gap-4">
                                        {PRICE_RANGES.map((range) => (
                                            <button
                                                key={range.label}
                                                onClick={() => { setActivePrice(range); setIsSidebarOpen(false); }}
                                                className={`text-left text-xl font-black tracking-tight ${activePrice.label === range.label ? "text-accent" : ""}`}
                                            >
                                                {range.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </main>
    );
};

const ProductsPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center font-mono text-[10px] uppercase tracking-wider opacity-20">
                Initializing Archive...
            </div>
        }>
            <ProductsFilter />
        </Suspense>
    );
};

export default ProductsPage;
