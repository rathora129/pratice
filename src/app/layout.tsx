import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Stark Packmate — Flexible packaging, labels and shrink sleeves",
    template: "%s | Stark Packmate",
  },
  description:
    "Custom pouches, labels and shrink sleeves for food, FMCG, pharma and e-commerce brands. Request a specification-led quotation from Stark Packmate, New Delhi.",
  keywords: [
    "flexible packaging",
    "stand-up pouches",
    "printed labels",
    "shrink sleeves",
    "courier bags",
    "packaging manufacturer Delhi",
  ],
  openGraph: {
    title: "Stark Packmate — Packaging that makes your brand impossible to ignore",
    description:
      "Custom flexible packaging, labels and sleeves engineered for shelf impact.",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1a2f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
