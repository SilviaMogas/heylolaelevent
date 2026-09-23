import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LangProvider } from "@/components/lang-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "HeyLola — adopt a dog in Dubai (challenge demo)",
  description:
    "Your dog's lifestyle concierge. Ask Lola, a voice AI, how to adopt a dog in Dubai and how Dubai Municipality registration works.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${inter.variable} font-sans`}>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
