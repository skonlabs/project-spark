import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "GAEO — Generative AI Engine Optimization",
    template: "%s | GAEO",
  },
  description:
    "The industry standard for AI Engine Optimization. Measure, monitor, and improve your visibility in LLM-generated answers across ChatGPT, Claude, Gemini, and more.",
  keywords: [
    "AI Engine Optimization",
    "AEO",
    "LLM visibility",
    "AI SEO",
    "ChatGPT ranking",
    "Claude visibility",
    "AI content optimization",
  ],
  openGraph: {
    title: "GAEO — Generative AI Engine Optimization",
    description:
      "The industry standard for optimizing your brand visibility in AI-generated answers.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
