import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@stream-io/video-react-sdk/dist/css/styles.css"
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from "@/components/Navbar";
import ClientProvider from "./ClientProvider";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Video Calling App",
  description: "Video calling app built with nextjs ,tailwindcss,stream",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body>
        <ClientProvider>

        <Navbar/>
        <main className="max-w-5xl mx-auto px-3 py-6">
        {children}
        </main>
        </ClientProvider>
        </body>
    </html>
  </ClerkProvider>
  );
}
