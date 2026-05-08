"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Specific Admin Credential Override
        if (email.toLowerCase() === "admin@fabel.com" && password === "fabel1234admin") {
            login({
                id: "admin-bypass",
                name: "MASTER ADMIN",
                email: email,
                role: "admin"
            });
            router.push("/admin");
            setLoading(false);
            return;
        }

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            setError(signInError.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            const isAdmin = email.toLowerCase() === "admin@fabel.com";
            login({
                id: data.user.id,
                name: data.user.user_metadata?.name || email.split("@")[0].toUpperCase(),
                email: email,
                role: isAdmin ? "admin" : "customer"
            });

            if (isAdmin) {
                router.push("/admin");
            } else {
                router.push("/products");
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12 translate-x-1/2 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider hover:text-accent transition-colors mb-12">
                    <ArrowLeft className="w-3 h-3" />
                    Return to Surface
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div>
                        <h1 className="text-6xl font-black tracking-wider uppercase leading-[0.8]">Access<br />Collective</h1>
                        <p className="font-mono text-xs text-foreground/40 uppercase tracking-wider mt-4">
                            Unauthorized access is strictly monitored.
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
                        <div className="group relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-accent transition-colors" />
                            <input
                                type="password"
                                required
                                placeholder="PASSWORD"
                                className="w-full bg-muted border border-border p-4 pl-12 font-mono text-xs uppercase tracking-wider focus:border-accent outline-none transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 font-mono text-xs uppercase tracking-wider text-center">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Link href="/auth/forgot-password" className="font-mono text-[11px] font-black text-accent uppercase tracking-wider bg-accent/10 py-2 px-4 border border-accent/30 hover:bg-accent hover:text-black transition-all flex items-center gap-2">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-accent text-black font-black tracking-wider uppercase text-xs flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all border border-accent group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Authorizing..." : "Initialize Session"}
                            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-border flex flex-col items-center gap-4 text-center">
                        <p className="font-mono text-[10px] text-foreground/40 uppercase tracking-wider">
                            New Archive Member?
                        </p>
                        <Link
                            href="/auth/signup"
                            className="w-full text-center py-4 border-2 border-accent text-accent font-black uppercase tracking-wider text-sm hover:bg-accent hover:text-black transition-all brutalist-shadow"
                        >
                            Create New Credentials
                        </Link>
                    </div>
                </motion.div>

                <div className="mt-24 p-4 border border-border/30 text-center">
                    <p className="font-mono text-[8px] text-foreground/20 uppercase tracking-[0.4em]">
                        Fabel Security Protocol V4.2 // Encrypted Node
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
