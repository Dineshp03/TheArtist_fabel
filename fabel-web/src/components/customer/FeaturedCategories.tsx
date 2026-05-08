"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import NotifyModal from "../common/NotifyModal";
import { useState } from "react";

const categories = [
    // {
    //     title: "HEAVYWEIGHT TEES",
    //     desc: "Premium cotton, oversized fit.",
    //     href: "/products?category=T-SHIRT",
    //     img: "/images/tshirt-hero.png",
    //     grid: "md:col-span-2",
    // },
    {
        title: "CANVAS TOTES",
        desc: "Built for the daily grind.",
        href: "/products?category=TOTE BAG",
        img: "/images/tote-hero.jpg",
        grid: "md:col-span-3", // md:col-span-1 changed to span-3 since T-Shirts are hidden
    },
];

const FeaturedCategories = () => {
    const [isNotifyOpen, setIsNotifyOpen] = useState(false);

    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <h4 className="text-accent font-mono text-xs tracking-[0.3em] uppercase mb-4">
                            Categories
                        </h4>
                        <h2 className="text-5xl md:text-7xl font-black tracking-wider uppercase leading-none">
                            The Collection
                        </h2>
                    </div>
                    <p className="text-foreground/40 font-mono text-xs tracking-wider uppercase">
                        [ Browse our curated selection ]
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`${cat.grid} relative h-[450px] overflow-hidden group border border-border`}
                        >
                            <img
                                src={cat.img}
                                alt={cat.title}
                                className="w-full h-full object-cover md:grayscale group-hover:grayscale-0 md:group-hover:scale-110 active:scale-95 active:brightness-110 transition-all duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-60 group-hover:opacity-40 transition-opacity" />

                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <h3 className="text-3xl font-black tracking-wider text-white mb-2">
                                    {cat.title}
                                </h3>
                                <p className="text-white/60 text-sm font-sans mb-6">
                                    {cat.desc}
                                </p>
                                {cat.href.includes("T-SHIRT") ? (
                                    <button
                                        onClick={() => setIsNotifyOpen(true)}
                                        className="w-fit text-xs font-mono tracking-wider uppercase text-accent border-b border-accent pb-1 group-hover:text-white group-hover:border-white transition-all"
                                    >
                                        Coming Soon / Notify Me
                                    </button>
                                ) : (
                                    <Link
                                        href={cat.href}
                                        className="w-fit text-xs font-mono tracking-wider uppercase text-accent border-b border-accent pb-1 group-hover:text-white group-hover:border-white transition-all"
                                    >
                                        Explore Drop
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
            <NotifyModal
                isOpen={isNotifyOpen}
                onClose={() => setIsNotifyOpen(false)}
                category="T-SHIRTS"
            />
        </section>
    );
};

export default FeaturedCategories;
