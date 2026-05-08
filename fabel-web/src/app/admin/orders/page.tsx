"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    ShoppingBag,
    Loader2,
    User,
    MapPin,
    Package,
    Calendar,
    Search,
    Filter,
    X,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    product_id: string;
    // We'll fetch images from the products store or a mock mapping
}

interface Order {
    id: string;
    user_email: string;
    phone?: string;
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    pincode: string;
    total_price: number;
    status: string;
    created_at: string;
    order_items: OrderItem[];
    shiprocket_order_id?: string | number | null;
}

interface ProductImageMap {
    [key: string]: string;
}

const OrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [productImages, setProductImages] = useState<ProductImageMap>({});

    // Search and Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("CURRENT");
    const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isResetting, setIsResetting] = useState(false);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
    const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch Orders
            const ordersResp = await fetch("/api/orders");
            const ordersData = await ordersResp.json();

            // Fetch Products to get images
            const productsResp = await fetch("/api/products");
            const productsData = await productsResp.json();

            // Create lookup map for images
            const imageMap: ProductImageMap = {};
            productsData.forEach((p: any) => {
                imageMap[p.id] = p.img;
                imageMap[p.name] = p.img; // Fallback for name matching
            });

            if (ordersResp.ok) setOrders(ordersData);
            setProductImages(imageMap);
        } catch (error) {
            console.error("Failed to fetch manifest data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePrintInvoice = async (order: Order) => {
        setPrintingOrderId(order.id);
        const invoiceUrl = `/invoice/${order.id}`;
        window.open(invoiceUrl, "_blank");
        setTimeout(() => setPrintingOrderId(null), 1000);
    };



    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const searchStr = `${order.first_name} ${order.last_name} ${order.user_email} ${order.phone} ${order.id}`.toLowerCase();
            const matchesSearch = searchStr.includes(searchTerm.toLowerCase());

            const normalizedStatus = order.status.replace(/ - COD/i, '').toUpperCase();

            // Date filtering
            let matchesDate = true;
            if (dateFilter) {
                const orderDate = new Date(order.created_at).toISOString().split('T')[0];
                matchesDate = orderDate === dateFilter;
            }

            if (statusFilter === "CURRENT") {
                return matchesSearch && matchesDate && normalizedStatus !== "ARCHIVED" && normalizedStatus !== "PENDING";
            }
            if (statusFilter === "ALL") {
                return matchesSearch && matchesDate && normalizedStatus !== "PENDING";
            }
            return matchesSearch && matchesDate && normalizedStatus === statusFilter;
        });
    }, [orders, searchTerm, statusFilter, dateFilter]);

    if (isLoading) {
        return (
            <div style={{ fontFamily: 'Arial, sans-serif' }} className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    return (
        <div style={{ fontFamily: 'Arial, sans-serif' }} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl uppercase tracking-wider">Order Manifest</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">
                            Monitoring {filteredOrders.length} / {orders.length} Transmissions
                        </p>
                        <div className="h-1 w-1 rounded-full bg-white/20" />
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${statusFilter === 'CURRENT' ? 'text-accent' : 'text-white/40'}`}>
                            Mode: {statusFilter === 'CURRENT' ? 'Active Manifest' : statusFilter === 'ARCHIVED' ? 'Past Orders History' : statusFilter}
                        </span>
                    </div>
                </div>


            </header>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white/5 p-4 border border-white/10">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, email, phone or ID..."
                        className="w-full bg-black border border-white/10 py-3 pl-10 pr-4 text-xs uppercase tracking-wider focus:border-accent outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {/* Date Filter */}
                    <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                        <input
                            type="date"
                            className="bg-black border border-white/10 py-3 pl-9 pr-4 text-xs uppercase tracking-wider focus:border-accent outline-none cursor-pointer text-white/60 [color-scheme:dark]"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                        {dateFilter && (
                            <button
                                onClick={() => setDateFilter("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-accent transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                        <select
                            className="bg-black border border-white/10 py-3 pl-9 pr-8 text-xs uppercase tracking-wider focus:border-accent outline-none appearance-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="CURRENT">Active Manifest</option>
                            <option value="ALL">All orders</option>
                            <option value="PROCESSING">Processing only</option>
                            <option value="SHIPPED">Shipped only</option>
                            <option value="DELIVERED">Completed only</option>
                            <option value="ARCHIVED">Archived orders</option>
                            <option value="PENDING">Abandoned (Pending)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={14} />
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredOrders.map((order) => {
                        const isExpanded = expandedOrder === order.id;
                        const isCOD = order.status.toLowerCase().includes('cod');
                        const displayStatus = order.status.replace(/ - COD/i, '');

                        return (
                            <motion.div
                                layout
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className={`bg-white/5 border transition-all overflow-hidden ${isExpanded ? 'border-accent/60 ring-1 ring-accent/20' : 'border-white/10 hover:border-white/30'}`}
                            >
                                {/* Compact Row / Header */}
                                <div
                                    className="p-6 cursor-pointer flex flex-wrap justify-between items-center gap-4 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] bg-accent text-black px-2 py-0.5 font-bold uppercase">
                                                    FB-{order.id.split('-')[0].toUpperCase()}
                                                </span>
                                                <span className="text-[10px] text-white/40 uppercase flex items-center gap-2">
                                                    <Calendar size={12} /> {new Date(order.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold uppercase tracking-tight flex items-center gap-2">
                                                {order.first_name} {order.last_name}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-[10px] text-white/40 uppercase mb-1">Status & Payment</div>
                                            <div className="flex gap-2 justify-end">
                                                <div className="text-[10px] uppercase bg-white/10 px-3 py-1 inline-block tracking-wider text-white/60">
                                                    {displayStatus}
                                                </div>
                                                <div className={`text-[10px] uppercase px-3 py-1 inline-block tracking-wider font-bold ${isCOD ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-accent/20 text-accent border border-accent/30'}`}>
                                                    {isCOD ? 'COD' : 'PREPAID'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-white/40 uppercase mb-1">Total Amount</div>
                                            <div className="text-xl font-bold tracking-wider text-accent">₹{order.total_price.toLocaleString("en-IN")}</div>
                                        </div>
                                        <div className="text-white/20">
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-white/10"
                                        >
                                            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12 bg-black/40">
                                                {/* Contact & Address */}
                                                <div className="space-y-6">
                                                    <div>
                                                        <h4 className="text-[10px] text-accent font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
                                                            <User size={14} /> Customer Profile
                                                        </h4>
                                                        <div className="space-y-2">
                                                            <p className="text-xs uppercase font-bold">{order.first_name} {order.last_name}</p>
                                                            <p className="text-xs text-white/60 lowercase">{order.user_email}</p>
                                                            <p className="text-xs text-white/60">{order.phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="pt-4 border-t border-white/5">
                                                        <h4 className="text-[10px] text-accent font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
                                                            <MapPin size={14} /> Logistics Point
                                                        </h4>
                                                        <div className="text-xs text-white/60 uppercase leading-relaxed">
                                                            {order.address}<br />
                                                            {order.city} - {order.pincode}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Manifest & Images */}
                                                <div className="lg:col-span-2">
                                                    <h4 className="text-[10px] text-accent font-bold uppercase tracking-wider flex items-center gap-2 mb-6">
                                                        <Package size={14} /> Hardware Manifest (Items)
                                                    </h4>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {order.order_items?.map((item, i) => {
                                                            const imgUrl = productImages[item.product_id] || productImages[item.product_name] || null;
                                                            return (
                                                                <div key={i} className="flex items-center gap-6 p-4 bg-white/5 border border-white/5 group/item">
                                                                    <div
                                                                        className="w-16 h-20 bg-black border border-white/10 shrink-0 overflow-hidden relative cursor-zoom-in"
                                                                        onClick={() => imgUrl && setSelectedImage(imgUrl)}
                                                                    >
                                                                        {imgUrl ? (
                                                                            <img src={imgUrl} alt="" className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center opacity-20">
                                                                                <Package size={20} />
                                                                            </div>
                                                                        )}
                                                                        <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <Search size={16} className="text-white" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-grow">
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <h5 className="text-sm font-bold uppercase tracking-tight">{item.product_name}</h5>
                                                                            <span className="text-accent font-bold">₹{item.price.toLocaleString("en-IN")}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center text-[10px] text-white/40 uppercase tracking-wider">
                                                                            <span>Quantity: {item.quantity} units</span>
                                                                            <span>Subtotal: ₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-8 py-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
                                                {confirmingDeleteId === order.id ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(null); }}
                                                            className="px-6 py-2 border border-white/20 text-white/60 text-[10px] uppercase font-bold tracking-wider hover:bg-white/10 transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                setConfirmingDeleteId(null);
                                                                setDeletingOrderId(order.id);
                                                                try {
                                                                    const resp = await fetch(`/api/orders/${order.id}`, { method: "DELETE" });
                                                                    if (resp.ok) {
                                                                        await fetchData();
                                                                    } else {
                                                                        alert("Failed to delete order.");
                                                                    }
                                                                } catch (err) {
                                                                    console.error("Deletion request error:", err);
                                                                } finally {
                                                                    setDeletingOrderId(null);
                                                                }
                                                            }}
                                                            disabled={deletingOrderId === order.id}
                                                            className="px-6 py-2 border border-red-500/30 bg-red-500/10 text-red-500 text-[10px] uppercase font-bold tracking-wider hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                                                        >
                                                            {deletingOrderId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 size={14} />}
                                                            Confirm Delete
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setConfirmingDeleteId(order.id);
                                                        }}
                                                        disabled={deletingOrderId === order.id}
                                                        className="px-6 py-2 border border-red-500/30 text-red-500 text-[10px] uppercase font-bold tracking-wider hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                                                    >
                                                        {deletingOrderId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 size={14} />}
                                                        Delete
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handlePrintInvoice(order)}
                                                    disabled={printingOrderId === order.id}
                                                    className="px-6 py-2 border border-white/10 text-[10px] uppercase font-bold tracking-wider hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                                                >
                                                    {printingOrderId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Print Invoice"}
                                                </button>

                                                <div className="relative">
                                                    <select
                                                        value={order.status.replace(/ - COD/i, '').toUpperCase()}
                                                        disabled={updatingOrderId === order.id}
                                                        onChange={async (e) => {
                                                            const nextStatus = e.target.value;
                                                            setUpdatingOrderId(order.id);
                                                            try {
                                                                const resp = await fetch(`/api/orders/${order.id}`, {
                                                                    method: "PATCH",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({ status: nextStatus })
                                                                });
                                                                if (resp.ok) await fetchData();
                                                            } catch (err) {
                                                                console.error("Update failed:", err);
                                                            } finally {
                                                                setUpdatingOrderId(null);
                                                            }
                                                        }}
                                                        className="px-6 py-2 bg-accent text-black text-[10px] uppercase font-bold tracking-wider hover:bg-white transition-all appearance-none cursor-pointer outline-none min-w-[160px] text-center disabled:opacity-50"
                                                    >
                                                        <option value="PROCESSING">Status: Processing</option>
                                                        <option value="SHIPPED">Status: Shipped</option>
                                                        <option value="DELIVERED">Status: Delivered</option>
                                                        <option value="ARCHIVED">Status: Archived</option>
                                                    </select>
                                                    {updatingOrderId === order.id && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-accent pointer-events-none">
                                                            <Loader2 className="w-3 h-3 animate-spin text-black" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredOrders.length === 0 && (
                    <div className="py-20 text-center border border-dashed border-white/10 opacity-40">
                        <Search size={32} className="mx-auto mb-4" />
                        <p className="text-xs uppercase tracking-wider">No orders matching your search parameters</p>
                        <button
                            onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }}
                            className="mt-4 text-[10px] underline uppercase tracking-wider hover:text-accent"
                        >
                            Reset System Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Image Modal Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 cursor-zoom-out"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={32} />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={selectedImage}
                            alt="Archive Enlargement"
                            className="max-w-full max-h-full object-contain border border-white/10 shadow-2xl"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrdersPage;
