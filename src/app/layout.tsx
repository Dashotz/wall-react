import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "The Wall — Interactive Social Feed",
  description:
    "A nostalgic 2008 Facebook-style Wall reimagined with modern design engineering, Next.js, and Supabase Realtime.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} ${mono.variable}`}
    >
      <body className="font-sans antialiased selection:bg-blue-600/15 selection:text-blue-700">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className:
              "rounded-xl border border-slate-200/80 bg-white/95 backdrop-blur-md text-slate-900 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.18)] text-xs font-medium",
          }}
        />
      </body>
    </html>
  );
}
