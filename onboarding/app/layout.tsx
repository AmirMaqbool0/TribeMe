import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Head from "next/head";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TRIBE ME Onboarding",
  description: "Onboarding web app",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <Head>
        <title>TRIBE ME Onboarding </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
