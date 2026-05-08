"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const SignupPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name.toUpperCase()
                }
            }
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            setSuccess("Credentials registered. Redirecting to access terminal...");

            // Redirect to login after a short delay so they can see the success message
            setTimeout(() => {
                router.push("/auth/login");
            }, 2500);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-1/2 h-full bg-accent/5 skew-x-12 -translate-x-1/2 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <Link href="/auth/login" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider hover:text-accent transition-colors mb-12">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Authentication
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div>
                        <h1 className="text-6xl font-black tracking-wider uppercase leading-[0.8]">New<br />Entity</h1>
                        <p className="font-mono text-xs text-foreground/40 uppercase tracking-wider mt-4">
                            Registration required for collective participation.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="group relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-accent transition-colors" />
                            <input
                                type="text"
                                required
                                placeholder="OPERATOR NAME"
                                className="w-full bg-muted border border-border p-4 pl-12 font-mono text-xs uppercase tracking-wider focus:border-accent outline-none transition-all"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="group relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-accent transition-colors" />
                            <input
                                type="email"
                                required
                                placeholder="IDENTIFICATION (EMAIL)"
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

                        {success && (
                            <div className="p-3 bg-green-500/10 border border-green-500/50 text-green-500 font-mono text-xs uppercase tracking-wider text-center">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-accent text-black font-black tracking-wider uppercase text-xs flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all border border-accent group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Registering..." : "Register Credentials"}
                            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-border flex flex-col items-center gap-4 text-center">
                        <p className="font-mono text-[10px] text-foreground/40 uppercase tracking-wider">
                            Already in the Collective?
                        </p>
                        <Link
                            href="/auth/login"
                            className="text-xs font-black uppercase tracking-wider hover:text-accent transition-colors underline underline-offset-8"
                        >
                            Access Terminal
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SignupPage;
