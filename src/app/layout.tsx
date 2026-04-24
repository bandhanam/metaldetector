import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metal Detector - Live Gold, Silver & Platinum Prices India",
  description:
    "Live gold price today in India per 10 gram. AI-powered Gold, Silver & Platinum price predictions with real-time rates and market analysis.",
  keywords: [
    "gold price today",
    "gold rate today India",
    "silver price today",
    "platinum price",
    "gold prediction",
    "silver rate India",
    "platinum rate India",
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
  other: {
    "google-adsense-account": "ca-pub-5999335789424982",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,300;0,6..12,400;0,6..12,500;0,6..12,600;0,6..12,700;0,6..12,800;0,6..12,900;1,6..12,400&display=swap"
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Metal Detector",
              url: "https://metaldetector-digger.vercel.app",
              description: "AI-powered live gold, silver & platinum price predictions with real-time rates for India and global markets.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
              creator: {
                "@type": "Organization",
                name: "Metal Detector",
                url: "https://metaldetector-digger.vercel.app/about",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "How often are the gold, silver, and platinum prices updated?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Prices are updated in real-time, refreshing every 60 seconds from COMEX/LBMA spot markets with live INR exchange rates.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Why is the Indian gold price different from international price?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Indian gold prices include 6% import duty, 3% GST, AIDC surcharges, and local market premiums — adding approximately 7-8% to international prices.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the gold rate per 10 grams today?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Metal Detector shows live gold rate per 10 grams in Indian Rupees (INR), updated every 60 seconds including all applicable import duties, GST, and market premiums.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How accurate are the AI price predictions?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Our ensemble model achieves 70-80% accuracy for next-day predictions and 55-65% for 3-month forecasts. Confidence scores are always displayed.",
                  },
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
