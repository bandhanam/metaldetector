"use client";

import { NewsArticle } from "@/types";

interface NewsFeedProps {
  articles: NewsArticle[];
}

export default function NewsFeed({ articles }: NewsFeedProps) {
  return (
    <div className="glass-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Market News & Sentiment</h3>
        <span className="text-xs text-[var(--text-secondary)]">{articles.length} articles</span>
      </div>
      <div className="space-y-0.5 max-h-[600px] overflow-y-auto scrollbar-thin pr-1">
        {articles.slice(0, 100).map((article, i) => {
          const sentimentColor =
            article.sentiment > 0.05
              ? "text-emerald-700"
              : article.sentiment < -0.05
                ? "text-red-700"
                : "text-blue-700";
          const sentimentDot =
            article.sentiment > 0.05
              ? "bg-emerald-600"
              : article.sentiment < -0.05
                ? "bg-red-600"
                : "bg-blue-600";

          return (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-all group"
            >
              <span className={`${sentimentDot} w-1.5 h-1.5 rounded-full shrink-0`} />
              <span className="text-sm leading-tight truncate flex-1 group-hover:text-[var(--text-primary)] transition-colors">
                {article.title}
              </span>
              <span className={`${sentimentColor} text-[10px] font-mono shrink-0`}>
                {article.sentiment > 0 ? "+" : ""}{(article.sentiment * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] shrink-0 hidden sm:inline">
                {formatTimeAgo(article.publishedAt)}
              </span>
            </a>
          );
        })}
        {articles.length === 0 && (
          <p className="text-center text-[var(--text-secondary)] py-8">
            Loading news...
          </p>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
