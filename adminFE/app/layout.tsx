import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans", weight: "100 900", });

const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono", weight: "100 900", });

export const metadata: Metadata = { title: "Admin Panel", description: "Tribe Me Admin app", };

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&family=Proxima+Nova:wght@400;500;600&family=Inter:wght@400;500;600&family=Nunito+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} bg-[#E6E6E6] antialiased`}>

        <main>

          {children}

        </main>

      </body>

    </html>
  );
}
