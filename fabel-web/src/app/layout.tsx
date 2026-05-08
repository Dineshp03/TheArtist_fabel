import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";



export const metadata: Metadata = {
  title: "FABEL | Industrial Minimalism",
  description: "High-quality tote bags for the modern minimalist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased overflow-x-hidden print:bg-white print:text-black">
        <div className="print:hidden">
          <Navbar />
          <CartDrawer />
        </div>
        <main className="min-h-screen pt-20 print:min-h-0 print:pt-0">
          {children}
        </main>
        <div className="print:hidden">
          <Footer />
        </div>
      </body>
    </html>
  );
}
