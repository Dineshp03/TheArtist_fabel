"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/lib/data";
import NotifyModal from "../common/NotifyModal";
import { useState } from "react";

interface ProductCardProps {
    product: Product;
    index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
    const addItem = useCartStore((state) => state.addItem);
    const [isNotifyOpen, setIsNotifyOpen] = useState(false);

    const isComingSoon = product.category === "T-SHIRT";

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group"
        >
            <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-card border border-border mb-3 rounded-2xl">
                {product.tag && (
                    <div className="absolute top-3 left-3 z-10 bg-accent text-black px-3 py-1 text-[10px] font-mono tracking-wider uppercase rounded-full">
                        {product.tag}
                    </div>
                )}

                {isComingSoon && (
                    <div className="absolute top-3 right-3 z-10 bg-black text-white border border-white/20 px-2 py-1 text-[8px] font-mono tracking-[0.2em] uppercase rounded-full">
                        Coming Soon
                    </div>
                )}

                <Link href={`/products/${product.id}`} className="block w-full h-full relative">
                    {product.img ? (
                        <img
                            src={product.img}
                            alt={product.name}
                            className="w-full h-full object-cover md:grayscale md:brightness-90 group-hover:grayscale-0 group-hover:scale-105 active:scale-95 active:brightness-110 transition-all duration-700"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-card-foreground/5 opacity-40">
                            <span className="text-[10px] font-mono tracking-wider uppercase">No Image</span>
                            <span className="text-[8px] font-mono opacity-50 uppercase mt-2">Archive Missing</span>
                        </div>
                    )}
                </Link>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        if (isComingSoon) {
                            setIsNotifyOpen(true);
                        } else {
                            addItem(product);
                        }
                    }}
                    className={`absolute bottom-4 right-4 p-4 translate-y-20 group-hover:translate-y-0 transition-transform duration-500 z-20 ${isComingSoon
                        ? "bg-black text-accent border border-accent hover:bg-accent hover:text-black"
                        : "bg-white text-black hover:bg-accent hover:text-black"
                        }`}
                >
                    {isComingSoon ? (
                        <span className="text-[10px] font-mono font-bold tracking-wider">NOTIFY</span>
                    ) : (
                        <Plus className="w-5 h-5" />
                    )}
                </button>
            </div>

            <div className="mt-1 px-0.5">
                <Link href={`/products/${product.id}`} className="block">
                    <h2 className="font-medium text-[13px] sm:text-[16px] md:text-[18px] tracking-tight group-hover:text-accent transition-colors leading-snug line-clamp-2">
                        {product.name}
                    </h2>
                </Link>
                <div className="text-[12px] sm:text-[14px] md:text-[15px] text-foreground/70 font-medium tracking-wide mt-0.5">
                    ₹{product.price.toLocaleString("en-IN")}
                </div>
            </div>
            <NotifyModal
                isOpen={isNotifyOpen}
                onClose={() => setIsNotifyOpen(false)}
                category={`T-SHIRT: ${product.name}`}
            />
        </motion.div>
    );
};

export default ProductCard;
