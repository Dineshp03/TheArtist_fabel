import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-muted border-t border-border mt-20">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="relative w-32 h-10 mb-4">
                            <Image
                                src="/fabel.png"
                                alt="FABEL"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <p className="text-foreground/60 max-w-xs font-sans text-sm leading-relaxed">
                            Premium aesthetics for the modern minimalist. High-quality tote
                            bags designed for the bold.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-xs font-mono tracking-wider uppercase mb-6 text-accent">
                            Important Links
                        </h3>
                        <ul className="space-y-3 text-sm font-sans text-foreground/80">
                            <li>
                                <Link href="/products" className="hover:text-accent transition-colors">
                                    Shop All
                                </Link>
                            </li>
                            <li>
                                <Link href="/info/privacy" className="hover:text-accent transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/info/terms" className="hover:text-accent transition-colors">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="/info/shipping" className="hover:text-accent transition-colors">
                                    Shipping Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/info/returns" className="hover:text-accent transition-colors">
                                    Returns & Refund Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/info/contact" className="hover:text-accent transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="text-xs font-mono tracking-wider uppercase mb-6 text-accent">
                            Follow Us
                        </h3>
                        <div className="flex space-x-4">
                            <Link href="https://www.instagram.com/fabel.clothing?igsh=endocjh4cWY2bmNq" target="_blank" className="hover:text-accent transition-colors">
                                <Instagram className="w-5 h-5" />
                            </Link>
                            <Link href="https://www.facebook.com/share/15z8t9q9P1/?mibextid=wwXIfr" target="_blank" className="hover:text-accent transition-colors">
                                <Facebook className="w-5 h-5" />
                            </Link>
                            <Link href="https://wa.me/919488173847" target="_blank" className="hover:text-accent transition-colors">
                                <svg xmlns="http://www.svgrepo.com/show/349564/whatsapp.svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle w-5 h-5"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono tracking-wider uppercase text-foreground/40">
                    <p>© 2026 FABEL. ALL RIGHTS RESERVED.</p>
                    <div className="flex space-x-8 mt-4 md:mt-0">
                        <Link href="/info/privacy" className="hover:text-foreground transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/info/terms" className="hover:text-foreground transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
