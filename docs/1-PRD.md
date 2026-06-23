# Product Requirements Document
## Nudge Commerce AI — v1.0

---

## 1. Overview

**Product name:** Nudge Commerce AI  
**Version:** 1.0 (MVP)  
**Author:** Founding team  
**Last updated:** June 2026  
**Status:** Draft

Nudge Commerce AI is an AI-powered e-commerce website builder for small businesses in India. A business owner describes their store in plain language and receives a fully functional, live e-commerce website within five minutes — no code, no design skills, no technical knowledge required.

---

## 2. Problem statement

Millions of small business owners in India — coffee shops, bakeries, clothing brands, home-based sellers — want to sell online but face real barriers:

- Developer costs range from ₹10,000 to ₹1,00,000+
- Existing platforms (Shopify, Wix) are complex and designed for larger businesses
- Most SMB owners lack technical knowledge and time
- The result: businesses stay on Instagram DMs and WhatsApp catalogs, limiting growth

**The market gap:** No product exists that takes an Indian SMB from zero to a live, branded e-commerce store in under five minutes, specifically built for their category.

---

## 3. Goals

### Business goals
- Reach 1,000 live stores within 3 months of launch
- Achieve 20% free-to-pro conversion within 6 months
- Establish Nudge as the default e-commerce tool for India's SMB segment

### Product goals (MVP)
- A business owner can generate a complete storefront in under 5 minutes
- The generated store works on mobile without any configuration
- Users can add, edit, and delete products without help
- Stores can accept real payments on day one

### Non-goals (v1)
- Native mobile app
- Multi-vendor marketplace
- Inventory management / POS integration
- AI-generated product images
- Multi-language support

---

## 4. Users

### Primary persona — Priya, home baker (Bengaluru)
- Sells through Instagram DMs and Swiggy Instamart
- No technical background; uses a smartphone primarily
- Wants a "real website" to look professional and take advance orders
- Budget-conscious; unwilling to pay upfront without seeing value

### Secondary persona — Arjun, streetwear founder (Mumbai)
- Runs a 200-follower Instagram brand
- Has some design sensibility; cares about aesthetics
- Wants something that looks premium without hiring a designer
- Willing to pay ₹499/month for custom domain + analytics

### Tertiary persona — Agency operator
- Manages 10–30 local business clients
- Needs a dashboard to create and manage multiple stores
- Will white-label for their clients

---

## 5. Core user flows

### Flow 1 — Onboarding & store generation
1. User lands on nudge.store
2. Enters business name, type, and a short description
3. Picks brand colors and uploads a logo (optional)
4. AI generates store configuration and selects appropriate template
5. Live preview renders in under 30 seconds
6. User reviews, makes light edits, and publishes

### Flow 2 — Product management
1. From dashboard, user taps "Add product"
2. Fills name, price, description, uploads photo
3. Product appears on live store immediately

### Flow 3 — Order management
1. Customer places order on storefront
2. Business owner receives WhatsApp notification + email
3. Owner marks order as fulfilled from dashboard

### Flow 4 — Upgrade to Pro
1. User hits free plan limit (5 products) or wants custom domain
2. Upgrade prompt appears with clear value prop
3. Payment via Razorpay; Pro features unlock instantly

---

## 6. Features

### Must-have (MVP — v1.0)

| Feature | Description |
|---|---|
| AI store generator | Natural language input → structured config → live storefront |
| Template engine | 6 industry templates: cafe, bakery, clothing, fitness, handmade, generic |
| Product catalog | Add, edit, delete products with image, price, description, stock |
| Shopping cart | Session-based cart with quantity controls |
| Checkout | Name, phone, address, UPI/card via Razorpay |
| Order notifications | WhatsApp (via Twilio/WATI) + email on new order |
| Mobile-responsive | All storefronts work on 375px screens |
| Free subdomain | store-name.nudge.store |
| Dashboard | Manage products, view orders, basic analytics |

### Should-have (v1.1)

| Feature | Description |
|---|---|
| Custom domain | Connect any .com/.in domain |
| AI product descriptions | Generate descriptions from product name + photo |
| Coupon codes | Flat or percentage discounts |
| COD option | Cash on delivery toggle |
| Social proof | Display order count, reviews |

### Nice-to-have (v2)

| Feature | Description |
|---|---|
| AI marketing copy | Instagram captions, WhatsApp broadcast messages |
| Analytics dashboard | Revenue, top products, traffic sources |
| Abandoned cart recovery | WhatsApp message after 1 hr |
| Multi-store (agency) | One login, N stores |
| White-label | Remove Nudge branding |

---

## 7. Constraints

- All stores must load under 2 seconds on a 4G connection
- Payment integration limited to India (Razorpay); global payments in v2
- AI generation must complete in under 30 seconds
- Free tier: max 5 products, Nudge branding in footer

---

## 8. Success metrics

| Metric | Target (3 months post-launch) |
|---|---|
| Stores created | 1,000 |
| Stores published (live) | 600 |
| Weekly active owners | 300 |
| Free → Pro conversion | 15% |
| Avg time to first published store | < 5 minutes |
| Store page load time (P95) | < 2 seconds |
| AI generation success rate | > 95% |

---

## 9. Pricing

### Free plan
- 1 store
- 5 products
- Nudge branding in footer
- nudge.store subdomain

### Pro — ₹499/month
- Unlimited products
- Custom domain
- No Nudge branding
- Order analytics
- Priority support

### Agency — ₹2,499/month
- Up to 30 stores
- Team access
- White-label
- Dedicated onboarding

---

## 10. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| AI generates poor quality stores | Medium | Curated templates + quality guardrails + manual review for first 100 stores |
| Payment KYC blocks small sellers | High | Partner with Razorpay Route for marketplace model |
| Low retention after store creation | Medium | WhatsApp onboarding sequence, first-order milestone notification |
| Free tier abuse | Low | Phone number verification, rate limiting per IP |
