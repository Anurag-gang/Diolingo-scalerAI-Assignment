import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Diolingo — Cognitive Spaced Language Learning",
  description:
    "Tactile, cognitive language learning platform featuring spaced repetition, dynamic audio engine, leagues, and real-time syntax mastery.",
  icons: {
    icon: "/mascot-dio.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans bg-[#090a0c] text-[#f4f4f5] antialiased selection:bg-emerald-500/20 selection:text-emerald-400`}>
        {children}
      </body>
    </html>
  );
}
