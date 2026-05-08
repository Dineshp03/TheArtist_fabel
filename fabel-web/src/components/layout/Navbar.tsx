"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import NotifyModal from "../common/NotifyModal";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { totalItems, toggleCart } = useCartStore();
    const { isAuthenticated, user } = useAuthStore();
    const [isNotifyOpen, setIsNotifyOpen] = useState(false);
    const cartCount = totalItems();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks: { name: string; href: string; comingSoon?: boolean }[] = [
        { name: "SHOP ALL", href: "/products" },
        // { name: "T-SHIRTS", href: "/products?category=T-SHIRT", comingSoon: true },
        { name: "TOTE BAGS", href: "/products?category=TOTE BAG" },
        ...(user?.role === "admin" ? [{ name: "ADMIN TERMINAL", href: "/admin" }] : []),
    ];

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${scrolled
                ? "bg-background/80 backdrop-blur-md border-border py-4"
                : "bg-transparent border-transparent py-6"
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link href="/" className="group flex items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative w-24 h-8 md:w-32 md:h-10"
                    >
                        <Image
                            src="/fabel.png"
                            alt="FABEL"
                            fill
                            className="object-contain"
                            priority
                        />
                    </motion.div>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center space-x-10 text-sm font-mono tracking-wider uppercase">
                    {navLinks.map((link, i) => (
                        <motion.div
                            key={link.name}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                        >
                            {link.comingSoon ? (
                                <button
                                    onClick={() => setIsNotifyOpen(true)}
                                    className="hover:text-accent transition-colors duration-300 relative group uppercase"
                                >
                                    {link.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full" />
                                    <span className="absolute -top-3 -right-6 text-[6px] bg-accent text-black px-1 leading-none py-0.5 font-bold animate-pulse">SOON</span>
                                </button>
                            ) : (
                                <Link
                                    href={link.href}
                                    className="hover:text-accent transition-colors duration-300 relative group"
                                >
                                    {link.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full" />
                                </Link>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Icons */}
                <div className="flex items-center space-x-6">
                    <Link href={isAuthenticated ? "/profile" : "/auth/login"} className="group">
                        <User className={`w-5 h-5 transition-colors duration-300 ${isAuthenticated ? "text-accent" : "group-hover:text-accent"}`} />
                        {isAuthenticated && (
                            <span className="hidden md:block absolute -top-8 left-1/2 -translate-x-1/2 bg-muted border border-border px-2 py-1 text-[8px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                OPERATOR: {user?.name}
                            </span>
                        )}
                    </Link>
                    <button onClick={() => toggleCart(true)} className="relative group">
                        <ShoppingBag className="w-5 h-5 group-hover:text-accent transition-colors duration-300" />
                        <AnimatePresence>
                            {cartCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="absolute -top-2 -right-2 bg-accent text-[10px] font-bold text-black w-4 h-4 rounded-full flex items-center justify-center"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                    <button
                        className="md:hidden text-foreground"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-background border-b border-border"
                    >
                        <div className="flex flex-col space-y-4 p-6 font-mono text-sm tracking-wider uppercase">
                            {navLinks.map((link) => (
                                <React.Fragment key={link.name}>
                                    {link.comingSoon ? (
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                setIsNotifyOpen(true);
                                            }}
                                            className="text-2xl font-black uppercase tracking-wider hover:text-accent transition-colors text-left flex items-center"
                                        >
                                            {link.name}
                                            <span className="ml-3 text-[8px] bg-accent text-black px-2 py-1 font-bold">SOON</span>
                                        </button>
                                    ) : (
                                        <Link
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className="text-2xl font-black uppercase tracking-wider hover:text-accent transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    )}
                                </React.Fragment>
                            ))}
                            <Link
                                href={isAuthenticated ? "/profile" : "/auth/login"}
                                onClick={() => setIsOpen(false)}
                                className="text-2xl font-black uppercase tracking-wider text-accent transition-colors"
                            >
                                {isAuthenticated ? `OPERATOR: ${user?.name}` : "ACCESS COLLECTIVE"}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <NotifyModal
                isOpen={isNotifyOpen}
                onClose={() => setIsNotifyOpen(false)}
                category="T-SHIRTS"
            />
        </nav>
    );
};

export default Navbar;
