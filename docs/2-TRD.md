# Technical Requirements Document
## Nudge Commerce AI — v1.0

---

## 1. Architecture overview

Nudge Commerce AI uses a monorepo with two distinct surfaces:

1. **Builder app** — where business owners create and manage their store (Next.js)
2. **Storefront runtime** — the generated customer-facing store (Next.js dynamic routes or static export)

Both surfaces share a component library and are deployed on Vercel.

```
nudge-commerce/
├── apps/
│   ├── builder/          # Owner dashboard (Next.js 14, App Router)
│   └── storefront/       # Customer-facing stores (Next.js 14, dynamic)
├── packages/
│   ├── ui/               # Shared component library
│   ├── db/               # Supabase client + schema types
│   └── ai/               # AI prompt templates + parsers
```

---

## 2. Tech stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend framework | Next.js 14 (App Router) | Server components, edge rendering, Vercel-native |
| Styling | Tailwind CSS + shadcn/ui | Speed, consistency, accessible primitives |
| Language | TypeScript | Type safety across monorepo |
| Database | Supabase (PostgreSQL) | Auth + DB + Storage in one, generous free tier |
| ORM | Prisma | Type-safe queries, migrations |
| AI model | Google Gemini 2.0 Flash | Free tier (1M tokens/day), fast, structured output |
| AI fallback | Groq (Llama 3.1) | Cost backup |
| File storage | Supabase Storage + Cloudinary | Images optimized via Cloudinary CDN |
| Payments | Razorpay | India-first, UPI + cards + net banking |
| Email | Resend | Developer-friendly, free 3K/mo |
| WhatsApp | WATI or Twilio | Order notifications to business owner |
| Hosting | Vercel | Zero-config, edge network, preview deploys |
| Monorepo | Turborepo | Caching, parallel builds |
| Auth | Supabase Auth | Built-in, supports Google OAuth + OTP |

---

## 3. AI pipeline

### 3.1 Input → structured config

```
User input (free text + form fields)
        ↓
Prompt template (system + user)
        ↓
Gemini 2.0 Flash (JSON mode)
        ↓
StoreConfig JSON (validated with Zod)
        ↓
Template selector
        ↓
Rendered storefront
```

### 3.2 StoreConfig schema (AI output)

```typescript
const StoreConfigSchema = z.object({
  business_name: z.string(),
  business_type: z.enum([
    'cafe', 'bakery', 'clothing', 'fitness',
    'handmade', 'restaurant', 'beauty', 'generic'
  ]),
  tagline: z.string().max(80),
  description: z.string().max(300),
  theme: z.object({
    primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    font_style: z.enum(['modern', 'classic', 'playful', 'minimal']),
  }),
  sections: z.array(z.enum([
    'hero', 'products', 'about', 'contact',
    'testimonials', 'instagram_feed', 'faq'
  ])),
  suggested_products: z.array(z.object({
    name: z.string(),
    price: z.number(),
    description: z.string(),
    category: z.string(),
  })).max(5),
  seo: z.object({
    title: z.string(),
    description: z.string(),
  }),
});
```

### 3.3 Prompt structure

```
System: You are a store configuration engine for Indian small businesses.
Given a business description, return ONLY a valid JSON object matching
the StoreConfig schema. No markdown, no preamble.

User: Business name: {name}
Type: {type}
Description: {description}
Brand colors mentioned: {colors}
Products they sell: {products}
```

### 3.4 Generation time targets

| Step | Target |
|---|---|
| Gemini API call | < 5 seconds |
| Template rendering | < 3 seconds |
| Total to live preview | < 10 seconds |

---

## 4. Storefront architecture

### 4.1 Routing

Each store is served from a dynamic route:

```
/s/[slug]           → Storefront homepage
/s/[slug]/products  → Full catalog
/s/[slug]/p/[id]    → Product detail
/s/[slug]/cart      → Cart
/s/[slug]/checkout  → Checkout
/s/[slug]/order/[id]→ Order confirmation
```

Custom domains are handled via Vercel's `domains` API and DNS CNAME pointing.

### 4.2 Rendering strategy

- Storefront pages: ISR (Incremental Static Regeneration) with 60-second revalidation
- Product updates trigger `revalidatePath` via API route
- Cart and checkout: client-side only (no SSR needed)

### 4.3 Performance targets

| Metric | Target |
|---|---|
| LCP | < 2.0s on 4G |
| FID | < 100ms |
| CLS | < 0.1 |
| Bundle size (JS) | < 120KB gzipped |
| Image format | WebP via Cloudinary |

---

## 5. API design

### 5.1 Builder API routes (Next.js Route Handlers)

```
POST   /api/stores/generate          → AI generation pipeline
GET    /api/stores/[id]              → Get store config
PATCH  /api/stores/[id]              → Update store config
POST   /api/stores/[id]/publish      → Publish store
DELETE /api/stores/[id]              → Delete store

GET    /api/stores/[id]/products     → List products
POST   /api/stores/[id]/products     → Create product
PATCH  /api/products/[id]            → Update product
DELETE /api/products/[id]            → Delete product

GET    /api/stores/[id]/orders       → List orders
PATCH  /api/orders/[id]              → Update order status

POST   /api/checkout/create          → Create Razorpay order
POST   /api/checkout/verify          → Verify payment signature
POST   /api/upload/image             → Upload to Supabase/Cloudinary
```

### 5.2 Authentication

- All `/api/*` routes require a valid Supabase JWT in `Authorization: Bearer <token>`
- Store-scoped routes validate that the authenticated user owns the store
- Storefront routes (`/s/[slug]/*`) are public

### 5.3 Rate limiting

- AI generation: 3 requests/hour per user (free), 20/hour (pro)
- Implemented via Upstash Redis (free tier: 10K req/day)

---

## 6. Payment flow

```
Customer clicks "Place order"
        ↓
POST /api/checkout/create
→ Creates Razorpay order (server-side)
→ Returns order_id + key
        ↓
Client opens Razorpay modal
        ↓
Customer pays (UPI / card / NB)
        ↓
Razorpay calls POST /api/checkout/verify (webhook)
→ Verifies HMAC signature
→ Creates Order record in DB
→ Sends WhatsApp to business owner
→ Sends email confirmation to customer
        ↓
Client redirected to /order/[id] (success page)
```

### 6.1 Razorpay split payments (future)

For the agency/marketplace model: Razorpay Route splits each payment — platform fee (2%) deducted, remainder to seller's linked account. This enables Nudge to charge a transaction fee at scale.

---

## 7. Image handling

```
Upload flow:
1. Client picks image
2. POST /api/upload/image
3. Server uploads to Supabase Storage (raw)
4. Server calls Cloudinary upload API with Supabase URL as source
5. Returns Cloudinary CDN URL
6. URL stored in DB
7. Storefront uses Cloudinary transformations:
   /w_400,h_400,c_fill,f_webp/...
```

---

## 8. Infrastructure & deployment

### 8.1 Environments

| Env | Branch | URL | Notes |
|---|---|---|---|
| Production | main | nudge.store | Vercel prod |
| Staging | staging | staging.nudge.store | Vercel preview |
| Local | — | localhost:3000 | .env.local |

### 8.2 Environment variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
GOOGLE_AI_API_KEY=
GROQ_API_KEY=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Resend
RESEND_API_KEY=

# WATI (WhatsApp)
WATI_API_KEY=
WATI_ENDPOINT=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 9. Security requirements

| Requirement | Implementation |
|---|---|
| Auth on all builder routes | Supabase JWT middleware |
| Store ownership validation | RLS policies in Supabase |
| Payment signature verification | HMAC-SHA256 on webhook |
| Image upload validation | MIME type check + 5MB limit |
| AI output validation | Zod schema parse before use |
| XSS prevention | Next.js default escaping + CSP headers |
| Rate limiting | Upstash Redis sliding window |
| Sensitive env vars | Vercel encrypted env, never in client bundle |

---

## 10. Observability

| Tool | Purpose | Cost |
|---|---|---|
| Vercel Analytics | Web vitals, traffic | Free |
| Sentry | Error tracking (builder + storefront) | Free 5K errors/mo |
| Supabase Logs | DB query monitoring | Free |
| Custom events | Store created, published, first order | Logged to DB |
