# Metal Detector - AI-Powered Metal Price Predictions

Real-time Gold, Silver & Copper price prediction dashboard powered by AI, news sentiment analysis, and neural network forecasting.

## Features

- **Multi-Country Prices**: Real market prices for India (INR), China (CNY), USA (USD), EU (EUR), Japan (JPY)
- **AI Predictions**: Neural network + sentiment-driven forecasts for 1 day to 3 months
- **100+ News Sources**: Global news analysis covering conflicts, trade, monetary policy, inflation
- **Daily Auto-Refresh**: Prices and predictions refresh automatically via Vercel Cron
- **Responsive UI**: Beautiful dark-themed dashboard with Recharts visualizations

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Recharts
- **AI/ML**: Custom neural network, sentiment analysis (FinBERT via HuggingFace), GPT-4o for pricing
- **Database**: PostgreSQL (CockroachDB)
- **APIs**: NewsAPI, OpenAI GPT-4o, HuggingFace Inference
- **Deployment**: Vercel (single deploy for API + frontend)

## Setup

1. Clone the repo
2. Copy `.env.example` to `.env.local` and fill in your API keys
3. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
4. Run locally:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEWS_API_KEY` | NewsAPI.org API key |
| `OPENAI_API_KEY` | OpenAI API key (GPT-4o for daily prices) |
| `HUGGINGFACE_API_KEY` | HuggingFace API key (optional, for FinBERT sentiment) |
| `CRON_SECRET` | Secret for Vercel Cron job authentication |

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy — Vercel auto-detects Next.js and handles everything

## Units

- Gold: per 10 grams (24K)
- Silver: per 1 kilogram
- Copper: per 1 kilogram

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run test` — Run unit tests
- `npm run refresh` — Clear cached data (forces fresh fetch on next load)
