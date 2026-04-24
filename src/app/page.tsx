import DashboardClient from "@/components/DashboardClient";
import SEOContent from "@/components/SEOContent";
import AdBanner from "@/components/AdBanner";

export default function Page() {
  return (
    <div className="min-h-screen pb-8">
      <DashboardClient />

      {/* Server-rendered SEO content — visible to Google crawler */}
      <SEOContent />

      {/* Ad: Before disclaimer */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <AdBanner slot="3456789012" format="horizontal" className="rounded-xl overflow-hidden" />
      </div>

      {/* Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 mt-8 md:mt-10">
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 md:p-5">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1.5">Important Disclaimer</p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                This is an AI-powered forecast system. Predictions are generated using machine learning models, 
                news sentiment analysis, and historical patterns. Metal prices can change suddenly due to 
                unexpected global events — wars, policy shifts, natural disasters, or market crashes — which 
                no model can fully anticipate. <span className="text-amber-700 font-medium">Use your own wisdom, 
                research, and financial judgment before making any investment or purchase decisions in metals.</span> 
                This tool is for informational purposes only and does not constitute financial advice.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 mt-4 md:mt-6 pb-8 pt-4 border-t border-[var(--border)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
          <p>
            Metal Detector — AI-Powered Intelligent Metal Price Forecast System
          </p>
          <p>
            Units: Gold per 10g · Silver per kg · Platinum per 10g · Realtime live prices
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-[var(--text-secondary)]">
          <a href="/privacy" className="hover:text-amber-700 transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-amber-700 transition-colors">Terms of Service</a>
          <span>·</span>
          <a href="/about" className="hover:text-amber-700 transition-colors">About</a>
          <span>·</span>
          <a href="/gold-investment-guide" className="hover:text-amber-700 transition-colors">Gold Guide</a>
          <span>·</span>
          <a href="/silver-investment-guide" className="hover:text-amber-700 transition-colors">Silver Guide</a>
        </div>
      </footer>
    </div>
  );
}
