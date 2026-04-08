import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - Metal Detector",
  description: "Privacy Policy for Metal Detector - AI-Powered Metal Price Predictions",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-amber-700 hover:text-amber-800 text-sm">&larr; Back to Dashboard</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-8">Privacy Policy</h1>
        <p className="text-xs text-[var(--text-secondary)] mb-6">Last updated: April 2026</p>

        <div className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">1. Information We Collect</h2>
            <p>Metal Detector does not collect any personal information directly. However, we use third-party services that may collect certain data:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Google AdSense:</strong> Serves personalized or non-personalized ads and may use cookies to tailor ads based on browsing behavior.</li>
              <li><strong>Log Data:</strong> Our hosting provider (Vercel) may collect standard server logs including IP addresses, browser type, and pages visited.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">2. Use of Cookies</h2>
            <p>We use cookies through Google AdSense to serve ads. Google uses cookies to serve ads based on your prior visits to this website or other websites. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline">Google Ads Settings</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">3. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Google AdSense</strong> for advertising. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline">Google Privacy Policy</a></li>
              <li><strong>MetalMetric API</strong> for live metal spot prices.</li>
              <li><strong>ExchangeRate API</strong> for live currency exchange rates.</li>
              <li><strong>NewsAPI</strong> for financial news data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">4. Data Retention</h2>
            <p>We do not store personal user data. News articles fetched from third-party sources are cached temporarily in our database for performance and are refreshed periodically.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">5. Your Rights</h2>
            <p>You may disable cookies in your browser settings at any time. You can opt out of Google&apos;s use of cookies for ad personalization at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline">adssettings.google.com</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">6. Children&apos;s Privacy</h2>
            <p>This website is not intended for children under 13. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">7. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">8. Contact</h2>
            <p>If you have questions about this Privacy Policy, please contact us through our <Link href="/about" className="text-amber-700 hover:underline">About page</Link>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
