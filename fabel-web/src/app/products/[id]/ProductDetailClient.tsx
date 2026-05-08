"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useProductStore } from "@/store/productStore";
import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

const ProductDetailPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { products, fetchProducts, isLoading, updateProduct } = useProductStore();

    useEffect(() => {
        if (products.length === 0) fetchProducts();
    }, [products.length, fetchProducts]);

    const product = products.find((p) => p.id === id);
    const addItem = useCartStore((state) => state.addItem);
    const { isAuthenticated, user } = useAuthStore();

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isLoading && !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center font-mono text-xs tracking-wider uppercase animate-pulse opacity-40">
                    Retrieving Archive Entry...
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="text-4xl font-black uppercase mb-4">Product Not Found</h1>
                    <Link href="/products" className="text-accent underline font-mono tracking-wider uppercase text-xs">
                        Return to Archive
                    </Link>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (product.category === "T-SHIRT" && !selectedSize) {
            alert("PLEASE SELECT A SIZE");
            return;
        }
        // Add multiple if quantity > 1
        for (let i = 0; i < quantity; i++) {
            addItem(product);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim() || !product) return;
        setIsSubmitting(true);

        const newReview = {
            id: `r_${Date.now()}`,
            user: user?.name || user?.email?.split('@')[0] || "OPERATOR",
            rating,
            comment,
            date: new Date().toISOString().split('T')[0]
        };

        const updatedReviews = [...(product.reviews || []), newReview];
        await updateProduct(product.id, { reviews: updatedReviews });

        setComment("");
        setRating(5);
        setIsSubmitting(false);
    };

    return (
        <main className="min-h-screen pt-32 pb-24 bg-background">
            <div className="container mx-auto px-6">
                {/* Breadcrumbs / Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-foreground/40 uppercase mb-12 hover:text-accent transition-colors"
                >
                    <ChevronLeft className="w-3 h-3" /> Back to Collective
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Image Gallery */}
                    <div className="lg:col-span-7 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative aspect-square overflow-hidden bg-card border border-border"
                        >
                            <img
                                src={product.images[selectedImage] || product.img}
                                alt={product.name}
                                className="w-full h-full object-cover transition-all duration-1000"
                            />
                            {product.tag && (
                                <div className="absolute top-6 left-6 bg-accent text-black px-4 py-1.5 text-xs font-mono tracking-wider uppercase">
                                    {product.tag}
                                </div>
                            )}
                        </motion.div>

                        <div className="grid grid-cols-4 gap-4">
                            {product.images?.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`aspect-square border transition-all bg-muted ${selectedImage === idx ? "border-accent" : "border-border opacity-60 hover:opacity-100"
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover md:grayscale md:brightness-75 hover:grayscale-0 active:scale-95 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="lg:col-span-5 flex flex-col pt-4">
                        <div className="mb-10 border-b border-border pb-8">
                            <h2 className="text-[10px] font-mono tracking-[0.3em] text-accent uppercase mb-3">
                                {product.category}
                            </h2>
                            <h1 className="text-5xl font-black tracking-wider uppercase mb-6 leading-none">
                                {product.name}
                            </h1>
                            <p className="text-xl font-mono text-foreground font-bold italic">
                                ₹{product.price.toLocaleString("en-IN")}
                            </p>
                        </div>

                        <div className="space-y-12">
                            {/* Description */}
                            <div>
                                <h3 className="text-[10px] font-mono tracking-wider text-foreground/40 uppercase mb-4">Inventory Info</h3>
                                <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                    {product.description}
                                </p>
                            </div>

                            {/* Size Selection */}
                            {product.category === "T-SHIRT" && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-[10px] font-mono tracking-wider text-foreground/40 uppercase">Dimensions / Size</h3>
                                        <button className="text-[10px] font-mono underline opacity-40 hover:opacity-100">Size Chart</button>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {product.sizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`min-w-[50px] h-12 flex items-center justify-center border text-xs font-mono transition-all ${selectedSize === size
                                                    ? "bg-accent border-accent text-black"
                                                    : "border-border hover:border-accent"
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity & Add to Bag */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center border border-border h-14 bg-muted">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-14 h-full flex items-center justify-center hover:bg-accent hover:text-black transition-colors border-r border-border"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-14 h-full flex items-center justify-center font-mono text-sm">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-14 h-full flex items-center justify-center hover:bg-accent hover:text-black transition-colors border-l border-border"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-grow h-14 bg-accent text-black font-black tracking-wider uppercase text-xs flex items-center justify-center gap-3 group hover:bg-white hover:text-black transition-all border border-accent"
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        Add to Collective
                                        <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-2 transition-transform" />
                                    </button>
                                </div>

                                <div className="pt-8 border-t border-border mt-12">
                                    <h3 className="text-[10px] font-mono tracking-wider text-foreground/40 uppercase mb-4">Specifications</h3>
                                    {product.details?.length > 0 ? (
                                        <ul className="space-y-3">
                                            {product.details.map((detail, i) => (
                                                <li key={i} className="flex items-center gap-3 text-xs font-medium">
                                                    <div className="w-1.5 h-1.5 bg-accent" />
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs font-mono text-foreground/20 italic uppercase tracking-wider">No detailed specifications.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Technical Reviews Section */}
                <div className="mt-32 border-t border-border pt-16">
                    <div className="flex flex-col lg:flex-row gap-16">
                        <div className="lg:w-1/3">
                            <h2 className="text-4xl font-black uppercase tracking-wider mb-4">Product<br />Feedback</h2>
                            <p className="font-mono text-[10px] text-foreground/40 uppercase tracking-wider leading-relaxed">
                                Collective verification of structural integrity and aesthetic performance.
                            </p>

                            <div className="mt-8 p-6 bg-muted border border-border">
                                <div className="text-4xl font-black italic mb-2">
                                    {product.reviews.length > 0
                                        ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
                                        : "0.0"}
                                </div>
                                <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/40">Collective Score</p>
                            </div>
                        </div>

                        <div className="lg:w-2/3 space-y-12">
                            {/* Review Form (Authenticated Only) */}
                            {isAuthenticated ? (
                                <div className="p-8 border border-accent/20 bg-accent/5">
                                    <h3 className="font-mono text-[10px] uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-accent" />
                                        Log New Feedback
                                    </h3>
                                    <form className="space-y-4" onSubmit={handleSubmitReview}>
                                        <div className="flex gap-4 mb-4">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setRating(s)}
                                                    className={`w-10 h-10 border font-mono text-xs flex items-center justify-center transition-all ${s <= rating ? "border-accent text-accent" : "border-border text-foreground/20"
                                                        } hover:bg-accent hover:text-black`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="YOUR FEEDBACK..."
                                            className="w-full bg-background border border-border p-4 font-mono text-xs uppercase tracking-wider h-32 outline-none focus:border-accent"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="h-12 bg-accent text-black font-black px-8 uppercase text-[10px] tracking-wider hover:bg-white hover:text-black transition-all border border-accent disabled:opacity-50"
                                        >
                                            {isSubmitting ? "SUBMITTING..." : "Submit Feedback"}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="p-8 border border-border border-dashed text-center">
                                    <p className="font-mono text-[10px] text-foreground/40 uppercase tracking-wider mb-4">
                                        Authentication Required to provide Feedback
                                    </p>
                                    <Link href="/auth/login" className="text-xs font-black uppercase tracking-wider underline underline-offset-4 hover:text-accent">
                                        Initialise Operator Session
                                    </Link>
                                </div>
                            )}

                            {/* Reviews List */}
                            <div className="space-y-8">
                                {product.reviews?.length > 0 ? (
                                    product.reviews.map((review) => (
                                        <div key={review.id} className="border-b border-border pb-8 last:border-0">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="font-mono text-[10px] text-accent uppercase tracking-[0.2em]">ID: {review.user}</span>
                                                    <div className="flex gap-1 mt-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`w-2 h-2 ${i < review.rating ? "bg-accent" : "bg-foreground/10"}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="font-mono text-[8px] text-foreground/20 tracking-wider">{review.date}</span>
                                            </div>
                                            <p className="text-xs font-mono uppercase tracking-wider leading-relaxed text-foreground/80 italic">
                                                &quot;{review.comment}&quot;
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="font-mono text-[10px] text-foreground/20 uppercase tracking-wider">
                                        No feedback recorded for this unit.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProductDetailPage;
