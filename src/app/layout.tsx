import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "sonner";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Henco",
  description: "Plataforma profesional de dietética y nutrición para el cuidado de la salud",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${fontSans.className} antialiased`}
      >
        <TRPCProvider>
          {children}
          <Toaster position="top-right" />
        </TRPCProvider>
      </body>
    </html>
  );
}
