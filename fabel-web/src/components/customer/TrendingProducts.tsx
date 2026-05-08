"use client";

import React from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { useProductStore } from "@/store/productStore";
import { useEffect } from "react";

const TrendingProducts = () => {
    const { products, fetchProducts, isLoading } = useProductStore();

    useEffect(() => {
        if (products.length === 0) fetchProducts();
    }, [products.length, fetchProducts]);

    // Only show first 4 for the trending section
    const trendingProducts = products.slice(0, 4);

    return (
        <section className="py-24 bg-muted border-y border-border">
            <div className="container mx-auto px-3 sm:px-6">
                <div className="flex justify-between items-center mb-16">
                    <h2 className="text-4xl font-black tracking-wider uppercase">
                        Trending <span className="text-accent">Now</span>
                    </h2>
                    <div className="h-[1px] flex-grow mx-8 bg-border hidden md:block" />
                    <Link
                        href="/products"
                        className="text-xs font-mono tracking-wider uppercase hover:text-accent transition-colors"
                    >
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
                    {isLoading && products.length === 0 ? (
                        <div className="col-span-4 py-12 text-center text-xs font-mono uppercase tracking-wider text-foreground/40 animate-pulse">
                            Loading Trending...
                        </div>
                    ) : (
                        trendingProducts.map((product, i) => (
                            <ProductCard key={product.id} product={product} index={i} />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default TrendingProducts;
