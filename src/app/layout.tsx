import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "What's This? - AI Object Learning for Kids",
  description: "A fun, interactive app for kids to learn about objects using their device camera with AI-powered image recognition and voice feedback.",
  keywords: ["kids", "learning", "AI", "object recognition", "camera", "education", "children"],
  authors: [{ name: "STAR Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "What's This? - AI Object Learning for Kids",
    description: "Point, Snap & Learn! AI-powered object recognition for kids.",
    siteName: "What's This?",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "What's This? - AI Object Learning for Kids",
    description: "Point, Snap & Learn! AI-powered object recognition for kids.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
