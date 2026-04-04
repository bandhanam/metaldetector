import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metal Detector - Live Gold, Silver & Copper Prices India",
  description:
    "Live gold price today in India per 10 gram. AI-powered Gold, Silver & Copper price predictions with real-time rates and market analysis.",
  keywords: [
    "gold price today",
    "gold rate today India",
    "silver price today",
    "copper price",
    "gold prediction",
    "silver rate India",
    "metal price live",
    "24 karat gold rate",
    "MCX gold",
    "gold price per 10 gram",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Metal Detector",
  },
  icons: {
    icon: "/icons/favicon.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFD700",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5999335789424982"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
