import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta"
});

export const metadata: Metadata = {
  title: "Studio Admin | thuangarchitect.com",
  description: "Admin panel untuk mengelola portfolio thuangarchitect.com"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300,0..1,0"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${plusJakartaSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
