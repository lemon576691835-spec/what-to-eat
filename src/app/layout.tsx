import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "今天吃什么",
  description: "帮你决定今天吃什么",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#f0eee8] text-gray-800 antialiased">
        {children}
      </body>
    </html>
  );
}
