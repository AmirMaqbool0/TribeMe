import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientWrapper from '../src/redux-wrapper/ClientWrapper'; // Adjust the path based on where you created the file

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans", weight: "100 900" });

const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono", weight: "100 900" });

export const metadata: Metadata = {
  title: "Brands Admin",
  description: "Brands for business owners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Brands Admin</title>
        <meta name="description" content="Brands for business owners" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`antialiased ${geistSans.variable} ${geistMono.variable} bg-cultured`}>
        <ClientWrapper>
          <main>{children}</main>
        </ClientWrapper>
      </body>
    </html>
  );
}
