"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, CheckCircle2, Loader2 } from "lucide-react";

interface NotifyModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: string;
}

const NotifyModal = ({ isOpen, onClose, category }: NotifyModalProps) => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const response = await fetch("/api/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, category }),
            });

            if (response.ok) {
                setStatus("success");
                setTimeout(() => {
                    onClose();
                    setStatus("idle");
                    setEmail("");
                }, 3000);
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-card border border-border p-8 brutalist-shadow bg-black"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-foreground/40 hover:text-accent transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-8">
                            <h4 className="text-accent font-mono text-[10px] tracking-[0.3em] uppercase mb-2">
                                System Status: Incoming
                            </h4>
                            <h2 className="text-3xl font-black tracking-wider uppercase leading-none mb-4">
                                {category} COMING SOON
                            </h2>
                            <p className="text-foreground/60 text-sm font-sans">
                                The next drop is currently in production. Register your interest to be notified when the archive opens.
                            </p>
                        </div>

                        {status === "success" ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center py-8 text-center"
                            >
                                <CheckCircle2 className="text-accent w-16 h-16 mb-4" />
                                <h3 className="text-xl font-bold uppercase tracking-tight">Transmission Received</h3>
                                <p className="text-foreground/40 text-xs font-mono mt-2 uppercase">You will be notified upon release.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="ENTER EMAIL ADDRESS"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                        className="w-full bg-muted border border-border py-4 pl-12 pr-4 text-xs lowercase placeholder:uppercase font-mono tracking-wider focus:border-accent focus:outline-none transition-colors"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="w-full bg-accent text-black py-4 font-mono text-xs tracking-[0.2em] uppercase font-bold hover:bg-white transition-colors flex items-center justify-center disabled:opacity-50"
                                >
                                    {status === "loading" ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "REGISTER INTEREST"
                                    )}
                                </button>

                                {status === "error" && (
                                    <p className="text-red-500 text-[10px] font-mono uppercase text-center mt-2">
                                        Error: Connection failed. Please try again.
                                    </p>
                                )}
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default NotifyModal;
