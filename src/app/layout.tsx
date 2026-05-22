import type { Metadata } from "next";
import { Nunito, Fredoka } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
        className={`${nunito.variable} ${fredoka.variable} antialiased bg-background text-foreground`}
      >
        {/* Background depth layers */}
        <div className="bg-blobs" aria-hidden="true">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Blob 1 — top-left region */}
            <ellipse className="blob-1" cx="20" cy="25" rx="30" ry="25" fill="var(--blob-color-1, #fb923c)" />
            {/* Blob 2 — bottom-right region */}
            <ellipse className="blob-2" cx="75" cy="70" rx="28" ry="22" fill="var(--blob-color-2, #fdba74)" />
            {/* Blob 3 — center-left */}
            <ellipse className="blob-3" cx="40" cy="60" rx="22" ry="18" fill="var(--blob-color-3, #f97316)" />
            {/* Blob 4 — top-right */}
            <ellipse className="blob-4" cx="80" cy="20" rx="18" ry="22" fill="var(--blob-color-4, #fbbf24)" />
          </svg>
        </div>
        <div className="bg-texture" aria-hidden="true" />
        {/* Main content layer */}
        <div className="bg-content min-h-screen">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
