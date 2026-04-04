"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { DashboardData } from "@/types";

const CountrySelector = dynamic(() => import("@/components/CountrySelector"), { ssr: false });
const CountryPriceCard = dynamic(() => import("@/components/CountryPriceCard"), { ssr: false });
const CurrentRateCard = dynamic(() => import("@/components/CurrentRateCard"), { ssr: false });
const QuickPredictions = dynamic(() => import("@/components/QuickPredictions"), { ssr: false });
const PredictionChart = dynamic(() => import("@/components/PredictionChart"), { ssr: false });
const PredictionTable = dynamic(() => import("@/components/PredictionTable"), { ssr: false });
const FactorsPanel = dynamic(() => import("@/components/FactorsPanel"), { ssr: false });
const MarketTable = dynamic(() => import("@/components/MarketTable"), { ssr: false });
const NewsFeed = dynamic(() => import("@/components/NewsFeed"), { ssr: false });
const SentimentChart = dynamic(() => import("@/components/SentimentChart"), { ssr: false });
const ComparisonChart = dynamic(() => import("@/components/ComparisonChart"), { ssr: false });
const AdBanner = dynamic(() => import("@/components/AdBanner"), { ssr: false });

interface AppState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

export default function Dashboard() {
  const [state, setState] = useState<AppState>({
    data: null,
    loading: true,
    error: null,
  });
  const [selectedMetal, setSelectedMetal] = useState<number>(0);
  const [selectedCountry, setSelectedCountry] = useState<string>("IN");
  const [activeTab, setActiveTab] = useState<"overview" | "markets" | "news">("overview");

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch");

      const result = await res.json();
      
      setState({
        data: result.data,
        loading: false,
        error: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load dashboard. Please try again.",
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedMarket = state.data?.markets.find(
    (m) => m.countryCode === selectedCountry
  ) || state.data?.markets[0];

  const selected = state.data?.predictions[selectedMetal];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg-primary)]/80 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 flex items-center justify-center text-lg md:text-xl">
                ⚡
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-extrabold gradient-text">
                  Metal Detector
                </h1>
                <p className="text-[10px] md:text-xs text-[var(--text-secondary)] hidden sm:block">
                  AI-Powered Metal Price Predictions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {state.data?.lastUpdated && (
                <div className="hidden md:flex flex-col items-end text-[10px] text-[var(--text-secondary)]">
                  <span>Updated: {new Date(state.data.lastUpdated).toLocaleTimeString()}</span>
                  <span className="text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Live prices
                  </span>
                </div>
              )}
              <button
                onClick={fetchData}
                disabled={state.loading}
                className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--border)] transition-all disabled:opacity-50"
              >
                {state.loading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading
                  </span>
                ) : (
                  "↻ Refresh"
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* AI Hero Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-b border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">🤖</span>
            <div>
              <p className="text-sm md:text-base font-semibold text-amber-300">
                AI-Powered Intelligent Forecast System
              </p>
              <p className="text-[11px] md:text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed max-w-3xl">
                Powered by advanced neural networks analyzing 100+ global news sources, sentiment analysis, technical indicators (RSI, MACD, Bollinger Bands), and historical price patterns to generate market forecasts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ad: Below Hero */}
      <div className="max-w-7xl mx-auto px-4 pt-3">
        <AdBanner slot="1234567890" format="horizontal" className="rounded-xl overflow-hidden" />
      </div>

      <main className="max-w-7xl mx-auto px-4 pt-4 md:pt-6">
        {/* Error Banner */}
        {state.error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {state.error}
          </div>
        )}

        {/* Loading Skeleton */}
        {state.loading && !state.data && (
          <div className="space-y-4">
            <div className="glass-card p-4 shimmer h-32" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6 shimmer h-40" />
              ))}
            </div>
            <div className="glass-card p-6 shimmer h-80" />
          </div>
        )}

        {/* Dashboard Content */}
        {state.data && selectedMarket && (
          <>
            {/* Country Selector */}
            <div className="mb-4 md:mb-6">
              <CountrySelector
                markets={state.data.markets}
                selectedCountry={selectedCountry}
                onSelectCountry={setSelectedCountry}
              />
            </div>

            {/* Price Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
              {state.data.predictions.map((pred, i) => (
                <CountryPriceCard
                  key={pred.metal}
                  prediction={pred}
                  market={selectedMarket}
                  isSelected={selectedMetal === i}
                  onClick={() => setSelectedMetal(i)}
                />
              ))}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-4 md:mb-6 p-1 bg-white/5 rounded-xl w-fit">
              {(["overview", "markets", "news"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                    activeTab === tab
                      ? "bg-white/10 text-white"
                      : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && selected && selectedMarket && (
              <div className="space-y-4 md:space-y-6">
                {/* Current Rate + Quick Predictions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <CurrentRateCard prediction={selected} market={selectedMarket} />
                  <QuickPredictions prediction={selected} market={selectedMarket} />
                </div>

                <PredictionChart prediction={selected} market={selectedMarket} />

                {/* Ad: Between chart and table */}
                <AdBanner slot="2345678901" format="horizontal" className="rounded-xl overflow-hidden" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <PredictionTable prediction={selected} market={selectedMarket} />
                  </div>
                  <FactorsPanel
                    factors={selected.factors}
                    metal={selected.metal}
                  />
                </div>

                <ComparisonChart predictions={state.data.predictions} />
                <SentimentChart predictions={state.data.predictions} />
              </div>
            )}

            {/* Markets Tab */}
            {activeTab === "markets" && (
              <div className="space-y-4 md:space-y-6">
                <MarketTable markets={state.data.markets} />
                <ComparisonChart predictions={state.data.predictions} />
              </div>
            )}

            {/* News Tab */}
            {activeTab === "news" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <NewsFeed articles={state.data.news} />
                <div className="space-y-4">
                  <SentimentChart predictions={state.data.predictions} />
                  {selected && (
                    <FactorsPanel
                      factors={selected.factors}
                      metal={selected.metal}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Ad: Before disclaimer */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <AdBanner slot="3456789012" format="horizontal" className="rounded-xl overflow-hidden" />
      </div>

      {/* Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 mt-8 md:mt-10">
        <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 md:p-5">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-amber-300 mb-1.5">Important Disclaimer</p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                This is an AI-powered forecast system. Predictions are generated using machine learning models, 
                news sentiment analysis, and historical patterns. Metal prices can change suddenly due to 
                unexpected global events — wars, policy shifts, natural disasters, or market crashes — which 
                no model can fully anticipate. <span className="text-amber-400/90 font-medium">Use your own wisdom, 
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
            Units: Gold per 10g · Silver per kg · Copper per kg · Realtime live prices
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-[var(--text-secondary)]">
          <a href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</a>
          <span>·</span>
          <a href="/about" className="hover:text-amber-400 transition-colors">About</a>
        </div>
      </footer>
    </div>
  );
}
