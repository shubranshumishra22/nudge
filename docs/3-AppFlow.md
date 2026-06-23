# App Flow Document
## Nudge Commerce AI — v1.0

---

## Overview

This document maps every screen, state, and transition in the Nudge Commerce AI product. It covers two surfaces: the **Builder** (owner-facing) and the **Storefront** (customer-facing).

---

## Surface 1 — Builder (owner experience)

### Screen 1.0 — Landing page (nudge.store)

**Purpose:** Convert visitor into signed-up user  
**Entry points:** Direct URL, social ads, referral links

**Elements:**
- Hero: "Your store, live in 5 minutes" + CTA "Create my store"
- Social proof: "1,200+ stores live today"
- Template previews: carousel of 6 generated storefronts
- How it works: 3-step visual (Describe → Preview → Publish)
- Pricing section (Free / Pro / Agency)
- Footer: About, Blog, Twitter/X, Instagram

**Primary action:** "Create my store" → Screen 1.1

---

### Screen 1.1 — Sign up / Log in

**Purpose:** Authenticate user before generation  
**Options:**
- Continue with Google (primary)
- Continue with phone (OTP via Supabase Auth)
- Email + password (secondary)

**Post-auth:**
- New user → Screen 2.0 (Onboarding — store generator)
- Returning user → Screen 3.0 (Dashboard)

---

### Screen 2.0 — Store generator (Step 1 of 3: Business info)

**Purpose:** Collect core business details for AI  
**Fields:**
- Business name (required)
- Business type: dropdown (Cafe / Bakery / Clothing / Fitness / Handmade / Restaurant / Beauty / Other)
- Short description: textarea, max 200 chars, placeholder "I sell handmade soy candles from Pune..."
- Primary brand color: color picker (optional, defaults to type-appropriate)

**Validation:**
- Business name: required, 2–60 chars
- Description: required, 20–200 chars

**CTA:** "Next: Add products →"

---

### Screen 2.1 — Store generator (Step 2 of 3: Products)

**Purpose:** Seed initial product catalog  
**Layout:** Add up to 5 products (free plan)

**Per product:**
- Name (required)
- Price in ₹ (required)
- Short description (optional)
- Photo upload (optional, up to 5MB)

**UX notes:**
- "Add product" button adds a new card row
- Can skip this step — products can be added later from dashboard
- Sample products pre-filled based on business type (e.g., "Espresso – ₹80" for a cafe)

**CTA:** "Next: Preview your store →"

---

### Screen 2.2 — Store generator (Step 3 of 3: Generating)

**Purpose:** AI generation in progress  
**State:** Full-screen loading with animated store preview skeleton  
**Copy:** "Building your store..." then "Almost there..." then "Ready!"  
**Duration target:** < 10 seconds

**On success:** Transition to Screen 2.3  
**On error:** Show error state with "Try again" CTA and support link

---

### Screen 2.3 — Store preview

**Purpose:** Show generated store before publishing  
**Layout:** Split pane — left: live iframe preview; right: quick edit panel

**Quick edit panel:**
- Business name (editable)
- Tagline (editable)
- Primary color picker
- Toggle sections on/off (Hero / Products / About / Contact)
- "Regenerate" link (uses 1 AI credit)

**Preview modes:** Desktop / Tablet / Mobile toggle

**CTAs:**
- "Publish store" (primary) → publishes, assigns subdomain, goes to Screen 3.0
- "Save draft" → saves without publishing

**Subdomain preview:** "Your store will be live at: brew-haven.nudge.store"

---

### Screen 3.0 — Dashboard (Home)

**Purpose:** Owner's central hub  
**Layout:** Left sidebar nav + main content area

**Sidebar items:**
- Home (overview)
- Products
- Orders
- Appearance
- Settings
- Upgrade (if on free plan)

**Home content:**
- Store status badge: Live / Draft
- Store URL + copy link button + open in new tab
- Key stats: Total orders, Revenue (MTD), Products listed
- Recent orders table (last 5)
- Quick action cards: Add product, Share store, View live store

---

### Screen 3.1 — Products

**Purpose:** Manage product catalog  
**Layout:** Table with search + filters

**Columns:** Photo, Name, Price, Stock status, Category, Actions (Edit / Delete)

**Add product flow:**
1. Click "Add product" → slide-over panel
2. Fill: Name, Price, Description, Category, Photos (up to 5)
3. Toggle: Available / Out of stock
4. Save → product appears immediately on live store

**Edit product:** Same slide-over, pre-filled

**Bulk actions:** Select multiple → Delete

---

### Screen 3.2 — Orders

**Purpose:** View and manage customer orders  
**Layout:** Filterable table

**Columns:** Order ID, Customer name, Items, Total, Status, Date, Actions

**Order statuses:** New → Processing → Shipped → Delivered → Cancelled

**Order detail:** Click row → full order view with customer info, items, payment status, delivery address

**Actions per order:**
- Update status
- Send WhatsApp to customer (template message)
- Print receipt (opens print dialog)

---

### Screen 3.3 — Appearance

**Purpose:** Customize store look  
**Sections:**
- Logo: upload / remove
- Colors: primary, accent, background
- Typography: font style selector (4 options)
- Layout: which sections are enabled, section order (drag to reorder)
- Footer: social links, business hours, address

**Live preview:** Right pane updates in real-time  
**Save:** Changes go live immediately on published store

---

### Screen 3.4 — Settings

**Purpose:** Store and account configuration  
**Sections:**
- Store info: name, description, business type
- Domain: current subdomain; connect custom domain (Pro)
- Payments: Razorpay account link status
- Notifications: WhatsApp number, email for order alerts
- Plan: current plan, usage, upgrade/downgrade
- Danger zone: Delete store, Delete account

---

## Surface 2 — Storefront (customer experience)

### Screen S1 — Homepage

**Components visible (configurable per store):**
1. Navigation: logo, store name, Cart icon (with item count badge)
2. Hero section: headline, tagline, CTA button "Shop now"
3. Featured products: grid of up to 4 products
4. About section: business description + owner photo
5. Contact section: WhatsApp button, email, address
6. Footer: social links, "Powered by Nudge" (free plan only)

---

### Screen S2 — Product catalog (/products)

**Layout:** Responsive grid (2-col mobile, 3-col desktop)  
**Each card:** Photo, name, price, "Add to cart" button  
**Filters:** Category pills (if multiple categories)  
**Empty state:** "No products yet — check back soon!"

---

### Screen S3 — Product detail (/p/[id])

**Sections:**
- Image gallery (up to 5 images, swipeable on mobile)
- Product name + price
- Description
- Quantity selector
- "Add to cart" CTA
- "Buy now" CTA (skips to checkout with just this item)
- Back to catalog link

---

### Screen S4 — Cart

**Layout:** Item list + order summary  
**Per item:** Photo, name, quantity +/-, price, remove  
**Summary:** Subtotal, delivery (flat rate or free), Total  
**CTA:** "Proceed to checkout"  
**Empty cart:** "Nothing here yet" + "Start shopping" link

---

### Screen S5 — Checkout

**Form fields:**
- Full name (required)
- Phone number (required, for WhatsApp delivery updates)
- Email (optional)
- Delivery address: line 1, line 2, city, pincode, state
- Delivery option: standard / express (if configured by owner)
- Payment method: UPI / Card / Net Banking (via Razorpay modal)

**Order summary:** Visible on right (desktop) / above form (mobile)

**On payment success:** Redirect to Screen S6

---

### Screen S6 — Order confirmation (/order/[id])

**Content:**
- Success icon + "Order placed!"
- Order ID
- Items ordered + total
- Estimated delivery note (if owner has set one)
- "Track on WhatsApp" button (links to owner's WhatsApp)
- "Continue shopping" link

---

## State transitions summary

```
Landing
  └─► Auth
        ├─► Onboarding (new user)
        │     ├─► Step 1: Business info
        │     ├─► Step 2: Products
        │     ├─► Generating (AI)
        │     └─► Preview → Dashboard
        └─► Dashboard (returning user)
              ├─► Products
              ├─► Orders
              ├─► Appearance
              └─► Settings

Storefront (public)
  └─► Homepage
        ├─► Product catalog
        │     └─► Product detail
        │           └─► Cart
        │                 └─► Checkout
        │                       └─► Order confirmation
        └─► About / Contact
```

---

## Error states

| Scenario | Shown to | Message |
|---|---|---|
| AI generation fails | Owner | "Something went wrong. Try again or contact support." |
| Payment fails | Customer | "Payment unsuccessful. No money was charged. Try again." |
| Store not found | Customer | "This store doesn't exist or has been unpublished." |
| Product out of stock | Customer | "This item is currently unavailable." |
| Image upload fails | Owner | "Upload failed. File must be under 5MB and a JPG, PNG, or WebP." |
| Session expired | Owner | Redirect to login with "Your session expired. Please sign in again." |
