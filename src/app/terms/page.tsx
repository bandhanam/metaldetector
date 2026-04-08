import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - Metal Detector",
  description: "Terms of Service for Metal Detector - AI-Powered Metal Price Predictions",
};

export default function Terms() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-amber-700 hover:text-amber-800 text-sm">&larr; Back to Dashboard</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-8">Terms of Service</h1>
        <p className="text-xs text-[var(--text-secondary)] mb-6">Last updated: April 2026</p>

        <div className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using Metal Detector (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">2. Nature of the Service</h2>
            <p>Metal Detector provides AI-powered metal price data and predictions for <strong>informational purposes only</strong>. The Service displays live gold, silver, and copper prices along with market forecasts generated using machine learning models and news sentiment analysis.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">3. Not Financial Advice</h2>
            <p className="text-amber-700 font-medium">The information provided by Metal Detector does NOT constitute financial, investment, or trading advice. Predictions are algorithmic forecasts and may be inaccurate. You should consult a qualified financial advisor before making any investment decisions. We are not responsible for any financial losses resulting from decisions made based on information provided by this Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">4. Accuracy of Data</h2>
            <p>While we strive to provide accurate and timely metal prices, we do not guarantee the accuracy, completeness, or timeliness of any data displayed. Prices are sourced from third-party APIs and may have slight delays or variations from actual market rates.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">5. Intellectual Property</h2>
            <p>All content, design, code, and branding of Metal Detector are protected by intellectual property laws. You may not copy, modify, or distribute any part of the Service without prior written consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">6. Third-Party Content</h2>
            <p>The Service displays news articles and data from third-party sources. We are not responsible for the accuracy or content of third-party information. Links to external websites are provided for convenience and do not imply endorsement.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">7. Advertising</h2>
            <p>The Service displays advertisements through Google AdSense. These ads are served by Google and are subject to Google&apos;s advertising policies. We are not responsible for the content of advertisements.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">8. Limitation of Liability</h2>
            <p>Metal Detector is provided &quot;as is&quot; without warranties of any kind. In no event shall we be liable for any damages arising from the use of this Service, including but not limited to financial losses, data loss, or business interruption.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">9. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">10. Contact</h2>
            <p>For questions about these Terms, please visit our <Link href="/about" className="text-amber-700 hover:underline">About page</Link>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
