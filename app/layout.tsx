import type { Metadata } from "next";
import { Inter, Newsreader, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Indrani — Markets, News & Terminal",
    template: "%s | Indrani",
  },
  description:
    "Real-time market data, financial news, and a keyboard-first terminal. English + Hindi.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${newsreader.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
