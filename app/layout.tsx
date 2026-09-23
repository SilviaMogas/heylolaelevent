import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LangProvider } from "@/components/lang-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_TITLE = "HeyLola — adopt a dog in Dubai (challenge demo)";
const SITE_DESCRIPTION =
  "Your dog's lifestyle concierge. Ask Lola, a voice AI, how to adopt a dog in Dubai and how Dubai Municipality registration works.";

export const metadata: Metadata = {
  metadataBase: new URL("https://eleven.heylola.co"),
  applicationName: "HeyLola",
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "https://eleven.heylola.co",
    siteName: "HeyLola",
    type: "website",
  },
  twitter: { card: "summary" },
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
