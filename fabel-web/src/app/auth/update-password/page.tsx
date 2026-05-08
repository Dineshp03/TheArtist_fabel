"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const UpdatePasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // We can listen to auth state change to confirm they are recovering
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event == "PASSWORD_RECOVERY") {
                // User is verified to recover password
            }
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        // Call Supabase update user method
        const { error: updateError } = await supabase.auth.updateUser({
            password: password
        });

        if (updateError) {
            setError(updateError.message);
        } else {
            setMessage("Password updated successfully.");
            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12 translate-x-1/2 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div>
                        <h1 className="text-6xl font-black tracking-wider uppercase leading-[0.8]">New<br />Credentials</h1>
                        <p className="font-mono text-xs text-foreground/40 uppercase tracking-wider mt-4">
                            Update your security clearance password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="group relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-accent transition-colors" />
                            <input
                                type="password"
                                required
                                placeholder="NEW PASSWORD"
                                className="w-full bg-muted border border-border p-4 pl-12 font-mono text-xs uppercase tracking-wider focus:border-accent outline-none transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="group relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-accent transition-colors" />
                            <input
                                type="password"
                                required
                                placeholder="CONFIRM NEW PASSWORD"
                                className="w-full bg-muted border border-border p-4 pl-12 font-mono text-xs uppercase tracking-wider focus:border-accent outline-none transition-all"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {loading ? "Updating..." : "Update Password"}
                            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </motion.div>

                <div className="mt-24 p-4 border border-border/30 text-center">
                    <p className="font-mono text-[8px] text-foreground/20 uppercase tracking-[0.4em]">
                        Fabel Security Protocol V4.2 // Update Protocol
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpdatePasswordPage;
