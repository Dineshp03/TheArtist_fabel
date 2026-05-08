"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";

const CartDrawer = () => {
    const { items, isCartOpen, toggleCart, updateQuantity, removeItem, totalPrice } = useCartStore();

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => toggleCart(false)}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-muted border-l border-border z-[101] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-border flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black tracking-wider uppercase">Your Collective</h2>
                                <p className="font-mono text-[10px] text-foreground/40 tracking-wider uppercase mt-1">
                                    {items.length} Unique Items
                                </p>
                            </div>
                            <button
                                onClick={() => toggleCart(false)}
                                className="p-2 hover:bg-accent hover:text-black transition-all border border-border"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                    <ShoppingBag className="w-12 h-12 stroke-[1px]" />
                                    <p className="font-mono text-xs uppercase tracking-wider">Archive is empty</p>
                                    <button
                                        onClick={() => toggleCart(false)}
                                        className="text-[10px] font-bold underline underline-offset-4 hover:text-accent transition-colors"
                                    >
                                        Continue Browsing
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="flex gap-6 group">
                                        <div className="w-24 aspect-[4/5] bg-card border border-border overflow-hidden shrink-0">
                                            <img src={item.img} alt={item.name} className="w-full h-full object-cover md:grayscale md:brightness-75 group-hover:grayscale-0 active:scale-95 transition-all duration-500" />
                                        </div>
                                        <div className="flex-grow flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start mb-1 text-accent">
                                                    <span className="font-mono text-[10px] tracking-wider uppercase">{item.category}</span>
                                                    <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <h3 className="font-bold tracking-tight text-xs md:text-sm uppercase truncate w-32 md:w-48">{item.name}</h3>
                                                <p className="font-mono text-[10px] md:text-xs mt-1 md:mt-2">₹{item.price.toLocaleString("en-IN")}</p>
                                            </div>

                                            <div className="flex items-center border border-border w-fit h-8">
                                                <button
                                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                    className="w-8 h-full flex items-center justify-center hover:bg-accent hover:text-black transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center font-mono text-xs">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-full flex items-center justify-center hover:bg-accent hover:text-black transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-8 bg-card border-t border-border space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between font-mono text-[10px] text-foreground/40 uppercase tracking-wider">
                                        <span>Subtotal</span>
                                        <span>₹{totalPrice().toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="flex justify-between font-black text-xl tracking-wider uppercase">
                                        <span>Total Est.</span>
                                        <span className="text-accent">₹{totalPrice().toLocaleString("en-IN")}</span>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    onClick={() => toggleCart(false)}
                                    className="w-full h-14 bg-accent text-black font-black tracking-wider uppercase text-xs flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all border border-accent group"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-2 transition-transform" />
                                </Link>

                                <p className="text-[9px] font-mono text-center text-foreground/30 uppercase tracking-[0.2em]">
                                    Industrial Secure Transaction Protocol V1.0
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
