"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        const res = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.error || "Something went wrong. Please try again.");
        } else {
            setMessage("Password reset link sent. Check your inbox.");
        }
        setLoading(false);
    };


    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12 translate-x-1/2 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <Link href="/auth/login" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider hover:text-accent transition-colors mb-12">
                    <ArrowLeft className="w-3 h-3" />
                    Return to Login
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div>
                        <h1 className="text-6xl font-black tracking-wider uppercase leading-[0.8]">Reset<br />Access</h1>
                        <p className="font-mono text-xs text-foreground/40 uppercase tracking-wider mt-4">
                            Enter operator email to request a secure reset link.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="group relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-accent transition-colors" />
                            <input
                                type="email"
                                required
                                placeholder="OPERATOR EMAIL"
                                className="w-full bg-muted border border-border p-4 pl-12 font-mono text-xs lowercase placeholder:uppercase tracking-wider focus:border-accent outline-none transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 font-mono text-xs uppercase tracking-wider text-center">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="p-3 bg-green-500/10 border border-green-500/50 text-green-500 font-mono text-xs uppercase tracking-wider text-center">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || Boolean(message)}
                            className="w-full h-14 bg-accent text-black font-black tracking-wider uppercase text-xs flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all border border-accent group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Transmitting..." : "Send Reset Link"}
                            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </motion.div>

                <div className="mt-24 p-4 border border-border/30 text-center">
                    <p className="font-mono text-[8px] text-foreground/20 uppercase tracking-[0.4em]">
                        Fabel Security Protocol V4.2 // Password Recovery
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
