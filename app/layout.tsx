import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const bebas = localFont({
  src: "../public/fonts/BebasNeue-Regular.ttf",
  variable: "--font-display",
  weight: "400",
  display: "swap",
});

const inter = localFont({
  src: "../public/fonts/Inter-Variable.ttf",
  variable: "--font-body",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "La Picá Del Nacho | Food Truck",
  description:
    "Sandwichería food truck abierta 24/7. Completos, sándwiches, hamburguesas, papas y más. Pide por delivery o retiro en local.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bebas.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-truck-black text-truck-cream">
        {children}
      </body>
    </html>
  );
}
