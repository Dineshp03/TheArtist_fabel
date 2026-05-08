"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const Hero = () => {
    return (
        <section className="relative h-[100svh] md:h-[90vh] flex items-center overflow-hidden">
            {/* Background Decorative Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full select-none pointer-events-none opacity-[0.02] font-black text-[30vw] leading-none whitespace-nowrap z-0">
                FABEL
            </div>





            <div className="container mx-auto px-6 relative z-10 pointer-events-auto">
                <div className="max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h4 className="text-accent font-mono text-sm tracking-[0.3em] uppercase mb-6">
                            Establishment 2024
                        </h4>
                        <div className="relative w-full max-w-2xl h-32 md:h-48 lg:h-64 mb-8">
                            <img
                                src="/fabel.png"
                                alt="FABEL"
                                className="w-full h-full object-contain object-left relative z-10 block"
                            />
                        </div>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-foreground/60 text-lg md:text-xl max-w-xl mb-12 font-sans leading-relaxed"
                    >
                        Crafted from Emotion. Designed for Life.
                        Feel It. Wear It. FABEL.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <Link href="/products" className="bg-accent text-black px-10 py-5 font-mono text-xs tracking-wider uppercase hover:bg-white hover:text-black transition-all duration-500 accent-shadow flex items-center justify-center group relative z-20 w-full sm:w-auto">
                            Shop Collection
                            <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </Link>

                        <Link href="/info/process" className="bg-transparent border border-border text-foreground px-10 py-5 font-mono text-xs tracking-wider uppercase hover:border-accent transition-all duration-500 text-center relative z-20 w-full sm:w-auto mt-2 sm:mt-0">
                            Our Process
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Mobile Hero Image */}
            <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-0 h-full w-[55%] md:hidden pointer-events-none z-0"
            >
                {/* Gradient overlay so text on left is legible */}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-10" />
                <img
                    src="/hero-mobile-new.jpg"
                    alt="FABEL Experience"
                    className="w-full h-full object-cover object-top"
                />
            </motion.div>

            {/* Decorative Industrial Line */}
            <motion.div
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ delay: 1, duration: 1.5 }}
                className="absolute right-12 top-0 w-[1px] bg-border/30 hidden lg:block"
            />

            <style>{`
        .border-text {
          -webkit-text-stroke: 1px var(--foreground);
        }
      `}</style>
        </section>
    );
};

export default Hero;
