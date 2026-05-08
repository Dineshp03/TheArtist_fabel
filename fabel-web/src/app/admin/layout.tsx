"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    PlusCircle,
    LogOut,
    ChevronRight,
    Search,
    MessageSquare
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();

    useEffect(() => {
        // Simple security check
        if (!isAuthenticated || user?.role !== "admin") {
            router.push("/auth/login");
        }
    }, [isAuthenticated, user, router]);

    const menuItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Products", href: "/admin/products", icon: Package },
        { name: "Add Product", href: "/admin/products/add", icon: PlusCircle },
        { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
        { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
    ];

    if (!isAuthenticated || user?.role !== "admin") return null;

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col fixed h-screen bg-black z-50">
                <div className="p-8 border-b border-white/10">
                    <Link href="/">
                        <img src="/fabel.png" alt="FABEL" className="h-6 object-contain" />
                    </Link>
                    <p className="text-[10px] font-mono text-accent mt-2 tracking-[0.2em] uppercase">
                        Admin Terminal v1.0
                    </p>
                </div>

                <nav className="flex-grow p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center space-x-3 px-4 py-3 text-xs font-mono tracking-wider uppercase transition-all group ${isActive
                                        ? "bg-accent text-black"
                                        : "text-white/40 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Icon size={16} />
                                <span>{item.name}</span>
                                {isActive && <ChevronRight size={14} className="ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center space-x-3 px-4 py-4 mb-2">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-bold text-xs">
                            {user?.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-mono truncate">{user?.name}</p>
                            <p className="text-[8px] font-mono text-white/40 uppercase">System Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-xs font-mono tracking-wider uppercase text-red-500 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut size={16} />
                        <span>Disconnect</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow ml-64 min-h-screen">
                <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 sticky top-0 bg-black/80 backdrop-blur-md z-40">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH ARCHIVE / COMMANDS..."
                            className="w-full bg-white/5 border border-white/10 py-2 pl-10 pr-4 text-[10px] font-mono tracking-wider focus:border-accent focus:outline-none transition-all uppercase"
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-[10px] font-mono text-white/40 uppercase">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span>Server: Orbital-Node-01</span>
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
