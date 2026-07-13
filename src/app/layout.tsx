import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DebtClear: See your whole debt picture, and a plan out of it",
  description:
    "Track every debt, income source, and expense in one place, then get an automated Avalanche or Snowball payoff plan. Start solo, add anyone you share money with, any time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas-soft text-ink dark:bg-zinc-950 dark:text-zinc-50">
        {children}
      </body>
    </html>
  );
}
