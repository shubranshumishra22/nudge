# Implementation Plan
## Nudge Commerce AI — v1.0

---

## Approach

Solo founder or 2-person team. 8-week MVP sprint, building in public. Every week ends with something real to show or test. No sprint planning overhead — weekly goals with daily standup via a Notion checklist.

---

## Phase 0 — Setup (Days 1–3)

### Goal: One command gets the app running locally

**Tasks:**

1. Initialize Turborepo monorepo
   ```bash
   npx create-turbo@latest nudge-commerce
   ```
2. Create apps: `builder` (Next.js 14), `storefront` (Next.js 14)
3. Create packages: `ui`, `db`, `ai`
4. Set up Supabase project (free tier)
   - Enable Google Auth + OTP
   - Create initial schema (profiles, stores tables)
5. Configure Vercel project, link GitHub repo
6. Set up environment variables (all services)
7. Deploy empty apps to Vercel — verify CI/CD pipeline works
8. Add Sentry to both apps (error tracking from day 1)

**Deliverable:** `pnpm dev` spins up builder at :3000 and storefront at :3001. Deploys succeed on push to main.

---

## Week 1 — Auth & Onboarding shell (Days 4–10)

### Goal: User can sign up and reach the generator

**Tasks:**

**Auth:**
- [ ] Supabase Auth integration in builder app
- [ ] Google OAuth sign-in button
- [ ] Phone OTP flow (for users without Google)
- [ ] Auth middleware: protect `/dashboard/*` routes
- [ ] Post-auth redirect logic (new user → /onboard, returning → /dashboard)
- [ ] Profile creation trigger (auto-create profiles row on auth.users insert)

**Onboarding UI:**
- [ ] `/onboard` route — 3-step form
- [ ] Step 1: Business name + type + description + color picker
- [ ] Step 2: Product seed form (up to 5 products, with image upload)
- [ ] Step 3: "Generating..." loading screen with skeleton animation
- [ ] Form validation (Zod + React Hook Form)
- [ ] Step transition animations (slide + fade per design brief)
- [ ] Progress indicator (3 dots)
- [ ] "Skip product step" option

**Design:**
- [ ] Design tokens configured (CSS variables in globals.css)
- [ ] Instrument Serif + Inter fonts loaded
- [ ] Primary button, ghost button, input, badge components in `packages/ui`

**Deliverable:** User signs up, completes all 3 onboarding steps, sees the generating screen. No AI yet — mock a 3-second delay and show a static preview.

---

## Week 2 — AI generation pipeline (Days 11–17)

### Goal: Describe a business, get a real store config

**Tasks:**

**AI integration:**
- [ ] Set up `packages/ai` with Gemini 2.0 Flash client
- [ ] Write system + user prompt templates (per TRD)
- [ ] Implement Zod schema for StoreConfig validation
- [ ] `POST /api/stores/generate` route handler
- [ ] Parse + validate AI response; handle malformed JSON gracefully
- [ ] Retry logic: if validation fails, retry once with error context
- [ ] Fallback: if AI fails entirely, use business_type defaults
- [ ] Rate limiting via Upstash Redis (3 generations/hour for free)
- [ ] Log every generation to `ai_generation_logs` table
- [ ] Store generated config in stores.ai_config (JSONB)

**Template engine:**
- [ ] Define 6 template IDs and their default section orders
- [ ] Template selector: maps business_type → template_id
- [ ] Template config (colors, fonts, sections) seeded from StoreConfig

**Store preview:**
- [ ] `/onboard/preview` route — split pane layout
- [ ] Live iframe pointing to `/s/preview/[store_id]`
- [ ] Quick edit panel: name, tagline, color picker
- [ ] Real-time preview update on edit (debounced 500ms)
- [ ] "Publish" CTA + "Save draft" link

**Deliverable:** User describes "I own a coffee shop called Brew Haven", sees a real generated preview with their name, colors, and suggested products populated.

---

## Week 3 — Storefront rendering (Days 18–24)

### Goal: A real URL shows a real store

**Tasks:**

**Storefront routes:**
- [ ] `/s/[slug]` dynamic route
- [ ] Fetch store + theme + products from Supabase
- [ ] Render Template 1 (Minimal) — the only template in MVP
- [ ] ISR with 60-second revalidation
- [ ] Mobile-responsive layout (test at 375px, 768px, 1280px)
- [ ] Product grid with image, name, price, "Add to cart" button
- [ ] About section (if enabled)
- [ ] Contact section with WhatsApp button
- [ ] Footer with "Powered by Nudge" (free plan)

**Cart (client-side):**
- [ ] Cart state management (Zustand or React Context)
- [ ] Add to cart, remove, update quantity
- [ ] Cart persists in localStorage
- [ ] Cart icon with item count badge in header
- [ ] Cart slide-over (right side sheet on desktop, full screen on mobile)

**Subdomain setup:**
- [ ] Vercel domain API: programmatically add `{slug}.nudge.store` subdomain on publish
- [ ] Middleware: detect subdomain and route to appropriate store slug

**Publish flow:**
- [ ] `POST /api/stores/[id]/publish` route
- [ ] Sets status = 'live', published_at = NOW()
- [ ] Calls Vercel API to register subdomain
- [ ] The publish animation (see design brief) — the signature moment
- [ ] `revalidatePath('/s/[slug]')` to bust ISR cache

**Deliverable:** After publish, `brew-haven.nudge.store` loads a real, mobile-responsive storefront. Demo-able to users.

---

## Week 4 — Checkout & payments (Days 25–31)

### Goal: Real customers can place and pay for orders

**Tasks:**

**Checkout page:**
- [ ] `/s/[slug]/checkout` route
- [ ] Order summary (items, subtotal, delivery, total)
- [ ] Customer form: name, phone, email, address (with pincode lookup for city/state)
- [ ] Client-side form validation

**Razorpay integration:**
- [ ] Razorpay test account setup
- [ ] `POST /api/checkout/create` — creates Razorpay order server-side
- [ ] Client: opens Razorpay checkout modal with pre-filled customer details
- [ ] `POST /api/checkout/verify` webhook — HMAC verification
- [ ] On success: create `orders` + `order_items` + `payments` records
- [ ] Order confirmation page `/s/[slug]/order/[id]`
- [ ] Edge case handling: payment timeout, network failure, duplicate webhooks

**Notifications:**
- [ ] Resend: order confirmation email to customer
- [ ] WATI/Twilio: WhatsApp message to store owner on new order
  - Template: "🛍️ New order on Brew Haven! ₹480 from Meera S. View: {link}"
- [ ] WhatsApp message to customer with order summary (if phone provided)

**Deliverable:** End-to-end: customer visits store, adds to cart, pays ₹100 in Razorpay test mode, owner gets WhatsApp ping, order appears in DB.

---

## Week 5 — Dashboard (Days 32–38)

### Goal: Owner can manage their store without touching the generator again

**Tasks:**

**Dashboard shell:**
- [ ] `/dashboard` layout with sidebar navigation
- [ ] Sidebar: Home, Products, Orders, Appearance, Settings
- [ ] Route protection (auth middleware)
- [ ] Responsive: bottom tab bar on mobile

**Dashboard home:**
- [ ] Stats cards: total orders, revenue (MTD), products listed
- [ ] Recent orders table (last 5, with status badges)
- [ ] Quick action cards
- [ ] Store status badge + URL chip + copy link

**Products management:**
- [ ] Products table with search
- [ ] Add product slide-over: name, price, description, category, stock, images
- [ ] Image upload → Cloudinary pipeline
- [ ] Edit product (pre-filled slide-over)
- [ ] Delete product (confirmation dialog)
- [ ] Toggle stock status
- [ ] `revalidatePath` on every product change

**Orders management:**
- [ ] Orders table with filters (All / New / Processing / Delivered / Cancelled)
- [ ] Order detail view: customer info, items, payment, address
- [ ] Update order status (select dropdown)
- [ ] Print receipt button

**Appearance editor:**
- [ ] Color pickers (primary, accent, background)
- [ ] Logo upload
- [ ] Section toggle + drag-to-reorder
- [ ] Social links form
- [ ] Live preview pane (iframe, same as onboarding preview)

**Settings:**
- [ ] Store info edit (name, description, business type)
- [ ] Contact info (WhatsApp, email, address)
- [ ] Delivery settings (flat fee, free above threshold)
- [ ] Notification preferences

**Deliverable:** A fully functional owner dashboard. No feature gaps that would prevent daily use.

---

## Week 6 — Pro plan & billing (Days 39–45)

### Goal: Monetization is live

**Tasks:**

**Upgrade flow:**
- [ ] Upgrade prompt triggers: product limit, domain connect, branding removal
- [ ] `/dashboard/upgrade` page with plan comparison
- [ ] Razorpay Subscriptions integration (₹499/month Pro)
- [ ] Webhook: handle subscription.activated, subscription.charged, subscription.cancelled
- [ ] Update profiles.plan + plan_expires_at on payment events
- [ ] Downgrade logic: if subscription lapses, store reverts gracefully (keeps products, adds branding back)

**Pro features unlock:**
- [ ] Custom domain: `/dashboard/settings/domain` — enter domain, show DNS instructions (CNAME), verify via DNS lookup, call Vercel API to add
- [ ] Remove "Powered by Nudge" from footer when plan = pro
- [ ] Unlimited products (remove DB trigger limit)

**Deliverable:** User can upgrade to Pro with Razorpay, connect their domain, and remove Nudge branding. Revenue comes in.

---

## Week 7 — Polish, performance, QA (Days 46–52)

### Goal: Ready for real users. No embarrassing bugs.

**Tasks:**

**Performance:**
- [ ] Run Lighthouse on 5 generated storefronts, target LCP < 2s
- [ ] Audit image sizes — ensure all product images served as WebP via Cloudinary
- [ ] Bundle analyzer: cut any unnecessary client-side JS
- [ ] Add `<Image>` with `priority` on hero images
- [ ] Test on Airtel 4G throttling (Chrome DevTools)

**Error handling:**
- [ ] Global error boundary in builder
- [ ] Storefront 404 page (store not found / unpublished)
- [ ] Form error states (all forms, all fields)
- [ ] Empty states (no products, no orders)
- [ ] Razorpay payment failure handling
- [ ] AI generation failure fallback

**QA checklist:**
- [ ] Full onboarding flow: sign up → generate → publish (5 business types)
- [ ] Mobile: iPhone SE, iPhone 14, Samsung Galaxy A series
- [ ] Checkout: UPI, card, net banking (all Razorpay test cases)
- [ ] Order status updates and notifications
- [ ] Custom domain flow (end-to-end)
- [ ] Upgrade and downgrade

**Accessibility:**
- [ ] Keyboard navigation on all interactive elements
- [ ] Screen reader test (VoiceOver on iOS)
- [ ] Focus rings visible

**Security:**
- [ ] Test RLS policies: verify user A cannot access user B's store data
- [ ] Verify Razorpay webhook signature validation
- [ ] Image upload: test file type bypass attempt

**Deliverable:** Zero P0 bugs. Product is ready to share with first 10 users.

---

## Week 8 — Launch prep (Days 53–60)

### Goal: Ship it. Get first 100 stores created.

**Tasks:**

**Landing page:**
- [ ] Final landing page (real screenshots from generated stores)
- [ ] How it works section (use real video recording of the flow)
- [ ] Testimonials section (placeholder — fill after first users)
- [ ] Pricing section (live Razorpay checkout integration)
- [ ] SEO: meta tags, og:image, sitemap.xml, robots.txt
- [ ] Google Analytics / Vercel Analytics

**Onboarding optimization:**
- [ ] Add "See a demo store" link on landing for skeptical visitors
- [ ] WhatsApp-based onboarding option for non-Google users
- [ ] First-order celebration: email + dashboard toast "🎉 You got your first order!"

**Distribution:**
- [ ] Post demo video on Twitter/X and LinkedIn
- [ ] Post in IndieHackers, BengaluruStartups, SaaS communities
- [ ] Direct outreach: 20 local businesses with a free "we built your store" offer
- [ ] Instagram Reels showing 5-minute store creation

**Monitoring:**
- [ ] Set up Sentry alerts (error rate > 1%)
- [ ] Supabase usage dashboard monitored daily
- [ ] Vercel function logs checked morning/evening

**Deliverable:** Product is live at nudge.store. First 10 real stores created on launch day.

---

## Milestones summary

| Week | Milestone |
|---|---|
| 0 (Days 1–3) | Monorepo + CI/CD deployed |
| 1 | User can sign up and complete onboarding |
| 2 | AI generates real store config |
| 3 | First live URL: brew-haven.nudge.store |
| 4 | Real payment taken end-to-end |
| 5 | Full dashboard functional |
| 6 | First ₹499 subscription payment |
| 7 | QA complete, no P0 bugs |
| 8 | Public launch |

---

## Stack decisions log

| Decision | Choice | Reasoning |
|---|---|---|
| Monorepo tool | Turborepo | Native Vercel integration, fast caching |
| State management | Zustand (cart only) | Simple, no Redux overhead for this scale |
| Form library | React Hook Form + Zod | Best-in-class, shared schema with backend |
| UI components | shadcn/ui + custom | Accessible primitives, easy to theme |
| Animations | Framer Motion | Emil-style spring animations, production-ready |
| Testing | Vitest + Playwright | Unit (logic) + E2E (checkout flow) |
| Image uploads | Supabase → Cloudinary | Cloudinary handles resize/optimize/CDN |
| AI model | Gemini 2.0 Flash | Free tier for MVP; swap to Claude Haiku at scale |

---

## Post-MVP backlog (v1.1 onwards)

Prioritized by user value:

1. AI-generated product descriptions from photo
2. Coupon codes
3. COD (cash on delivery) option
4. AI marketing copy generator (Instagram captions)
5. Abandoned cart WhatsApp recovery
6. Basic analytics (revenue chart, top products)
7. Agency plan: multi-store dashboard
8. Template 2 (Warm) + Template 3 (Bold)
9. Product variants (size, color)
10. International shipping + Stripe (v2)
