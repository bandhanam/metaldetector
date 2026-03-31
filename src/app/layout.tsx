import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metal Detector - Precious Metal Price Predictions",
  description:
    "AI-powered Gold, Silver & Copper price predictions based on global news sentiment analysis",
  keywords: ["gold price", "silver price", "copper price", "prediction", "metal market"],
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
      </head>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
