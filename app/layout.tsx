import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "block",
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "馒头 | 猫咪个人主页",
  description: "一只调皮狸花猫的可爱主页，包含数字分身聊天区。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={spaceGrotesk.variable}>{children}</body>
    </html>
  );
}
