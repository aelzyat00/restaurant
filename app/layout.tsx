import type React from "react";
import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { CartProvider } from "@/contexts/cart-context";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "منصة المطاعم - طلب وتوصيل الطعام",
  description: "منصة شاملة لطلب وتوصيل الطعام من المطاعم المحلية",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <style>{`
html {
  font-family: ${cairo.style.fontFamily};
  --font-sans: ${cairo.variable};
}
        `}</style>
      </head>
      <body className={cairo.className}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
