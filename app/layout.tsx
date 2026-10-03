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
  title: "CHAEVI — AI Work Router",
  description: "Route tasks to the right AI workflow — model, reasoning, tools, environment, and next actions.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "CHAEVI — AI Work Router",
    description: "Route tasks to the right AI workflow.",
  },
  twitter: {
    card: "summary",
    title: "CHAEVI — AI Work Router",
    description: "Route tasks to the right AI workflow.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
