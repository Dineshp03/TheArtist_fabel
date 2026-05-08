"use client";

import React, { useState, useEffect } from "react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

interface Testimonial {
    id: string;
    text: string;
    image: string;
    name: string;
    role: string;
}

export const Testimonials = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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
        fetchTestimonials();
    }, []);

    const splitIndex1 = Math.ceil(testimonials.length / 3);
    const splitIndex2 = Math.ceil((testimonials.length * 2) / 3);

    const firstColumn = testimonials.slice(0, splitIndex1);
    const secondColumn = testimonials.slice(splitIndex1, splitIndex2);
    const thirdColumn = testimonials.slice(splitIndex2);

    if (isLoading) {
        return (
            <section className="bg-background my-20 relative flex justify-center items-center h-48">
                <p className="text-white/40 font-mono text-xs uppercase animate-pulse">Loading Testimonials...</p>
            </section>
        );
    }

    if (testimonials.length === 0) {
        return null;
    }

    return (
        <section className="bg-background my-20 relative">
            <div className="container z-10 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
                >
                    <div className="flex justify-center">
                        <div className="border border-primary/20 bg-primary/5 py-1 px-4 rounded-full text-sm font-medium">Testimonials</div>
                    </div>

                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-6 text-center">
                        What our users say
                    </h2>
                    <p className="text-center mt-5 text-muted-foreground text-lg">
                        See what our customers have to say about us.
                    </p>
                </motion.div>

                <div className="flex justify-center gap-6 mt-14 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[740px] overflow-hidden">
                    {firstColumn.length > 0 && <TestimonialsColumn testimonials={firstColumn} duration={15} />}
                    {secondColumn.length > 0 && <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />}
                    {thirdColumn.length > 0 && <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
