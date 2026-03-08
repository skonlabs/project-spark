# GAEO — Generative AI Engine Optimization Platform

> Understand, measure, and improve your visibility in LLM-generated answers across ChatGPT, Claude, Gemini, Grok, Perplexity, and every emerging AI search engine.

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **State**: TanStack React Query
- **Routing**: React Router DOM

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── components/       # Shared UI components
│   ├── dashboard/    # Score rings, bars
│   ├── layout/       # Dashboard shell
│   └── ui/           # shadcn/ui primitives
├── pages/
│   ├── auth/         # Login, Register
│   ├── dashboard/    # All dashboard modules
│   ├── Landing.tsx
│   └── NotFound.tsx
├── types/            # TypeScript interfaces
└── lib/              # Utilities
```
