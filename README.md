# Nudge Commerce AI

An AI-powered e-commerce website builder for Indian small businesses. Describe your store in plain language and get a fully functional, live e-commerce website in under five minutes.

## Monorepo structure

```
nudge-commerce/
├── apps/
│   ├── builder/          # Owner dashboard (Next.js 14, App Router)
│   └── storefront/       # Customer-facing stores (Next.js 14)
├── packages/
│   ├── ui/               # Shared component library (shadcn/ui based)
│   ├── db/               # Supabase client + generated types
│   └── ai/               # AI prompt templates + Zod schemas
├── turbo.json            # Turborepo pipeline config
├── pnpm-workspace.yaml   # pnpm workspace config
└── package.json          # Root package.json
```

## Getting started

### Prerequisites

- Node.js >= 18
- pnpm >= 10

### Install

```bash
pnpm install
```

### Environment variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

### Development

Start both apps simultaneously:

```bash
pnpm dev
```

- **Builder** → http://localhost:3000
- **Storefront** → http://localhost:3001

### Build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Language | TypeScript (strict) |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini 2.0 Flash + Groq fallback |
| Payments | Razorpay |
| Email | Resend |
| WhatsApp | WATI |
| Hosting | Vercel |
| Monorepo | Turborepo |
| Auth | Supabase Auth |

## Packages

### `@nudge/ui` — Shared component library

Contains all shadcn/ui components, the Tailwind CSS preset, and utility functions. Both apps consume this package.

### `@nudge/db` — Database client

Supabase client setup with typed interfaces matching the PostgreSQL schema. Includes all table types for `profiles`, `stores`, `products`, `orders`, `order_items`, `payments`, `store_themes`, and `store_domains`.

### `@nudge/ai` — AI pipeline

Zod-validated `StoreConfig` schema, Gemini prompt templates, and response parsers. Used by the builder to generate store configurations from user descriptions.
