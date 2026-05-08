"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, LogOut, Loader2, Upload, MessageSquare } from "lucide-react";

interface Testimonial {
    id: string;
    name: string;
    role: string;
    text: string;
    image: string;
    created_at: string;
}

export default function AdminTestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formDataState, setFormData] = useState({
        name: "",
        role: "",
        text: "",
        image: ""
    });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await fetch("/api/testimonials");
            if (res.ok) {
                const data = await res.json();
                setTestimonials(data);
            }
        } catch (error) {
            console.error("Failed to fetch testimonials:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("CRITICAL: DELETE THIS TESTIMONIAL?")) {
            try {
                const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
                if (res.ok) {
                    setTestimonials(testimonials.filter((t) => t.id !== id));
                }
            } catch (error) {
                console.error("Failed to delete testimonial:", error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/testimonials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formDataState)
            });
            if (res.ok) {
                const { testimonial } = await res.json();
                setTestimonials([testimonial, ...testimonials]);
                setFormData({ name: "", role: "", text: "", image: "" });
            }
        } catch (error) {
            console.error("Failed to add testimonial:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-12 max-w-6xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <h4 className="text-accent font-mono text-[10px] tracking-[0.3em] uppercase mb-2">
                        Content Management
                    </h4>
                    <h1 className="text-4xl font-black uppercase tracking-wider">
                        Testimonials
                    </h1>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Testimonial Form */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-white/5 border border-white/10 p-8 space-y-6">
                        <h3 className="text-xs font-mono text-accent tracking-[0.2em] uppercase border-b border-white/10 pb-4 flex items-center gap-2">
                            <Plus size={14} /> Add Testimonial
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4 text-white">
                            <div className="grid grid-cols-1 gap-4">
                                <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-black border border-white/10 p-4 text-xs font-mono focus:border-accent outline-none"
                                    placeholder="JANE DOE"
                                    value={formDataState.name}
                                    onChange={e => setFormData({ ...formDataState, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Role (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-black border border-white/10 p-4 text-xs font-mono focus:border-accent outline-none"
                                    placeholder="CEO, COMPANY"
                                    value={formDataState.role}
                                    onChange={e => setFormData({ ...formDataState, role: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Profile Image URL</label>
                                {formDataState.image ? (
                                    <div className="relative w-20 h-20 border border-white/10 bg-black overflow-hidden group">
                                        <img src={formDataState.image} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formDataState, image: "" })}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <LogOut size={12} className="rotate-45" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-full py-4 border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-white/20 hover:border-accent hover:text-accent transition-all cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/webp"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                try {
                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    formData.append('bucket', 'testimonials');
                                                    formData.append('path', `${Date.now()}-${file.name}`);

                                                    const res = await fetch('/api/upload', {
                                                        method: 'POST',
                                                        body: formData
                                                    });

                                                    if (!res.ok) throw new Error("Upload failed on server");
                                                    const { url } = await res.json();
                                                    setFormData({ ...formDataState, image: url });
                                                } catch (error) {
                                                    console.error("Upload failed", error);
                                                    alert("Upload failed. Make sure the file is valid and server is running.");
                                                }
                                            }}
                                        />
                                        <Upload size={20} />
                                        <span className="text-[8px] font-mono uppercase text-center px-2">Click to Upload Image</span>
                                    </label>
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Testimonial Text</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full bg-black border border-white/10 p-4 text-xs font-mono focus:border-accent outline-none resize-none"
                                    placeholder="Enter what they said..."
                                    value={formDataState.text}
                                    onChange={e => setFormData({ ...formDataState, text: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 bg-accent text-black px-4 py-4 text-xs font-mono font-bold tracking-[0.2em] uppercase hover:bg-white transition-all disabled:opacity-50 mt-4"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={16} />}
                                Add Entry
                            </button>
                        </form>
                    </section>
                </div>

                {/* Testimonials List */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-white/40 uppercase font-mono text-[10px] tracking-wider">
                                    <th className="px-6 py-4 font-normal">Reviewer</th>
                                    <th className="px-6 py-4 font-normal">Testimonial</th>
                                    <th className="px-6 py-4 font-normal text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={3} className="py-20 text-center text-white/40 font-mono text-xs uppercase">
                                            Fetching Testimonials...
                                        </td>
                                    </tr>
                                ) : testimonials.length === 0 ? (
                                    <tr>
                                        <td colSpan={3}>
                                            <div className="py-20 text-center flex flex-col items-center justify-center">
                                                <MessageSquare className="mx-auto text-white/10 mb-4" size={48} />
                                                <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em]">
                                                    NO TESTIMONIALS FOUND
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <AnimatePresence>
                                        {testimonials.map((t, i) => (
                                            <motion.tr
                                                key={t.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <td className="px-6 py-6 min-w-[200px]">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 border border-white/10 overflow-hidden bg-black shrink-0 relative rounded-full">
                                                            {t.image ? (
                                                                <img src={t.image} alt={t.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/20 font-bold text-lg">
                                                                    {t.name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold tracking-tight uppercase group-hover:text-accent transition-colors">{t.name}</h4>
                                                            <p className="text-[8px] font-mono text-white/40 uppercase">{t.role}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-sm text-white/70 italic max-w-sm">
                                                    "{t.text}"
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <button
                                                            onClick={() => handleDelete(t.id)}
                                                            className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                            title="Delete testimonial"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
