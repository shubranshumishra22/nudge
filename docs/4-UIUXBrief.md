# UI/UX Design Brief
## Nudge Commerce AI — v1.0

Inspired by: Emil Kowalski's design philosophy — purposeful restraint, exceptional motion craft, micro-interactions that feel inevitable rather than decorative.

---

## 1. Design philosophy

**One sentence:** Build the simplest tool that a non-technical business owner in Bengaluru trusts immediately.

Emil Kowalski's fingerprint: interactions feel tactile. Every hover, click, and transition has weight. Nothing decorates; everything signals. The product earns trust through precision, not through marketing copy.

**Three principles for Nudge:**

1. **Reduce, then reduce again.** Every element earns its place. The dashboard should feel like a physical object — purposeful, no wasted surfaces.
2. **Motion as communication.** Animations are not delight features. They communicate state: generating, saving, publishing. A 200ms ease-out on a button press means "received." A skeleton pulse means "working."
3. **Trust through density control.** The onboarding is sparse (one question per beat). The dashboard gets denser as the user gains fluency. The system calibrates to expertise.

---

## 2. Design tokens

### Color system

```
Background:
  --bg-base:       #FAFAF8   (warm off-white, not clinical white)
  --bg-surface:    #FFFFFF   (cards, panels)
  --bg-subtle:     #F4F3F0   (input backgrounds, table rows)
  --bg-inverse:    #0F0F0E   (dark surfaces, code blocks)

Text:
  --text-primary:  #0F0F0E   (headings, labels)
  --text-secondary:#6B6B67   (supporting text, captions)
  --text-tertiary: #9B9B96   (placeholders, disabled)
  --text-inverse:  #FAFAF8

Brand:
  --brand:         #1A1A1A   (primary CTA, nav active)
  --brand-hover:   #2D2D2D
  --accent:        #F97316   (nudge orange — used sparingly)
  --accent-subtle: #FFF4ED

Semantic:
  --success:       #16A34A
  --success-bg:    #F0FDF4
  --warning:       #D97706
  --warning-bg:    #FFFBEB
  --error:         #DC2626
  --error-bg:      #FEF2F2
  --info:          #2563EB
  --info-bg:       #EFF6FF

Border:
  --border-default: rgba(0,0,0,0.08)
  --border-hover:   rgba(0,0,0,0.16)
  --border-focus:   #0F0F0E
```

**Note on the orange accent:** --accent (#F97316) appears only in 3 places: the logo mark, the "Publish" primary CTA button, and the progress dot during AI generation. Everywhere else is monochrome. This scarcity makes the orange feel precious.

### Typography

```
Display (page titles, hero):
  Font: "Instrument Serif" (Google Fonts)
  Sizes: 48px / 36px / 28px
  Weight: 400 (the elegance is in the weight, not bold)
  Letter-spacing: -0.02em

UI (labels, buttons, nav, body):
  Font: "Inter" or system-ui fallback
  Sizes: 14px (label), 15px (body), 13px (caption)
  Weight: 400 regular, 500 medium
  Letter-spacing: 0 (never space UI text)

Mono (order IDs, prices, codes):
  Font: "JetBrains Mono" or "Courier New"
  Size: 13px
  Use: Order IDs, prices in tables, API keys

Scale:
  h1: 36px / Instrument Serif / -0.02em
  h2: 24px / Instrument Serif / -0.01em
  h3: 18px / Inter 500
  h4: 15px / Inter 500
  body: 15px / Inter 400 / 1.6 line-height
  label: 13px / Inter 500 / uppercase 0.04em (use sparingly)
  caption: 12px / Inter 400 / --text-secondary
```

### Spacing

8px base unit. Use multiples: 4, 8, 12, 16, 24, 32, 48, 64, 96.

Never use odd numbers or 5px gaps. Spacing communicates relationships — tighter = related, looser = separate.

### Border radius

```
sm: 6px    (badges, chips, small inputs)
md: 10px   (buttons, cards)
lg: 16px   (modal dialogs, large cards)
xl: 24px   (store preview iframe, hero image containers)
full: 9999px (pill buttons, avatar circles)
```

### Shadows

Only two shadows in the system. Emil's rule: shadows should feel physical.

```
--shadow-sm: 0 1px 2px rgba(0,0,0,0.06), 0 1px 1px rgba(0,0,0,0.04)
  → Cards at rest

--shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)
  → Cards on hover, modals, dropdowns
```

No colored shadows. No large blur spreads.

---

## 3. Motion system

**Principle:** Duration is short, easing is natural. No bounciness.

```
Micro (button press, checkbox):    100ms  ease-out
Standard (panel slide, fade):      180ms  cubic-bezier(0.4, 0, 0.2, 1)
Emphasis (modal, sheet open):      240ms  cubic-bezier(0.22, 1, 0.36, 1)
Page transition:                   160ms  ease-in-out
```

**Key animated moments:**

1. **Button press:** Scale 0.97 on active, returns 100ms ease-out. Provides tactile feedback.
2. **Form step advance:** Card slides left 24px + fades out; next card slides in from right 24px. Communicates progress.
3. **AI generating:** The store preview skeleton pulses (not a spinner). Each section skeleton appears sequentially with 80ms stagger — communicates that the store is being built section by section.
4. **Publish:** The "Publish store" button transforms into a URL chip with a check icon. Duration: 400ms. The URL text types in character by character at 20ms intervals. This is the most memorable moment in the product.
5. **Product added to cart (storefront):** Cart icon jiggles (rotate ±8deg, 2 oscillations, 300ms). Item count badge scales up from 0.5 to 1.0 with spring.
6. **Order notification (dashboard):** New order row slides in from top of table, highlighted with --success-bg for 3 seconds, then normalizes.

**Reduced motion:** All animations collapse to instant opacity fades when `prefers-reduced-motion: reduce` is set.

---

## 4. Component specifications

### Primary button (CTA)

```
Background: #0F0F0E
Text: #FAFAF8, 14px Inter 500
Padding: 10px 20px
Border-radius: 10px
Border: none

Hover: background → #2D2D2D, transition 100ms
Active: scale(0.97), 80ms
Focus: outline 2px #0F0F0E, offset 2px
Disabled: opacity 0.4, cursor not-allowed

The "Publish" CTA variant:
Background: #F97316 (accent orange)
Same dimensions and behavior
```

### Ghost / secondary button

```
Background: transparent
Border: 1px solid var(--border-default)
Text: --text-primary, 14px Inter 500
Padding: 10px 20px

Hover: background → --bg-subtle, border-color → --border-hover
```

### Input field

```
Background: --bg-surface
Border: 1px solid var(--border-default)
Border-radius: 10px
Padding: 10px 14px
Font: 15px Inter 400, --text-primary
Placeholder: --text-tertiary

Focus: border-color → --text-primary (1.5px), ring: 3px rgba(0,0,0,0.06)
Error: border-color → --error, ring: 3px rgba(220,38,38,0.08)
```

**Floating label pattern (onboarding only):** Label sits inside the field, moves up on focus/fill. Only use in the 3-step generator — not in the dashboard (use explicit labels above the field instead).

### Card

```
Background: --bg-surface
Border: 1px solid var(--border-default)
Border-radius: 16px
Padding: 24px

Hover state (if interactive):
  border-color → --border-hover
  box-shadow → --shadow-md
  transition: 120ms
```

### Badge / status chip

```
Font: 12px Inter 500
Padding: 3px 10px
Border-radius: full (9999px)
No border

Variants:
  Live:       bg #F0FDF4, text #16A34A
  Draft:      bg #F4F3F0, text #6B6B67
  New order:  bg #EFF6FF, text #2563EB
  Processing: bg #FFFBEB, text #D97706
  Delivered:  bg #F0FDF4, text #16A34A
  Cancelled:  bg #FEF2F2, text #DC2626
```

### Navigation sidebar (dashboard)

```
Width: 220px (fixed)
Background: --bg-base (same as page — blends in)
Border-right: 1px solid var(--border-default)

Logo area: 20px height, nudge wordmark + orange dot
Nav items: 14px Inter 400, --text-secondary
  Hover: background --bg-subtle, text --text-primary
  Active: background --bg-subtle, text --text-primary, 500 weight
  Active indicator: 2px left border, color --text-primary

Bottom section: avatar + email + plan badge
```

---

## 5. Key screen specifications

### Onboarding generator (screens 2.0–2.2)

**Layout:** Centered, max-width 480px, vertically centered on page.

**Background:** Full page --bg-base, no sidebar, no nav — pure focus.

**Progress indicator:** 3 dots at top. Active dot is filled (#0F0F0E), completed dots have a checkmark, pending are outlined. No progress bar (too much pressure).

**Tone of copy:**
- Step 1 heading: "Tell us about your business"
- Step 2 heading: "What do you sell?"
- Step 3 (generating): "Building your store..."

No exclamation marks in UI copy. Calm confidence.

### Dashboard home

**Layout:** 3-column stats strip at top (orders, revenue, products) then 2-column below (recent orders left, quick actions right).

**Stats strip:** Numbers in Instrument Serif 32px, labels in 12px Inter uppercase 0.04em tracking. Very minimal.

**Quick actions:** 2×2 grid of ghost cards with Lucide icons. "Add product", "Share store", "View live", "Invite team". Hover: card lifts (--shadow-md).

### Store preview (screen 2.3)

**Layout:** Full-bleed split. Left 60%: iframe showing live store preview. Right 40%: edit panel with white surface.

**Edit panel header:** "Your store" in 18px Instrument Serif + subdomain URL in 13px mono.

**The iframe border:** 8px --bg-base frame, 16px radius, --shadow-md. Feels like holding a phone/screen.

**Device toggle:** Three icons (monitor, tablet, phone) in a segmented control at top of iframe. Switching resizes the iframe with a smooth width transition.

---

## 6. Storefront design system

Storefronts inherit none of the builder's design system. Each storefront has its own design based on the selected template + business colors.

**Template 1 — Minimal (cafe, beauty):**
- Full-bleed hero photo
- Instrument Serif product names, Inter prices
- Grid: 2-col mobile, 3-col desktop
- White background, black text, accent from owner's brand color
- "Add to cart" button uses owner's brand color

**Template 2 — Warm (bakery, handmade):**
- Cream background (#FDFAF6)
- Large rounded product cards
- Slightly playful (Lato or DM Sans)
- Section dividers: subtle wavy SVG line

**Template 3 — Bold (clothing, streetwear):**
- Full-bleed dark hero (#0F0F0E background)
- Product names in large Inter 700
- High-contrast product cards
- Cart icon in accent color

**Template 4 — Energetic (fitness):**
- Split-screen hero
- Strong type scale
- Progress-bar style section separators

**Common storefront rules:**
- Mobile-first: all templates tested at 375px first
- Cart is always accessible via sticky header icon
- Checkout always 1-page (no multi-step checkout on mobile)
- Product images: always square (1:1 crop) in catalog, 4:3 on detail page

---

## 7. Accessibility

- All interactive elements reachable by keyboard
- Focus rings visible in both light and dark modes (2px, --text-primary or equivalent)
- Color is never the sole indicator of state
- All images have alt text (AI-generated from product name if not provided)
- Form errors announced via aria-live
- Minimum tap target: 44×44px on all touch elements
- Color contrast: AA minimum (4.5:1 for body text, 3:1 for large text)
- `prefers-reduced-motion` respected

---

## 8. Empty states

Each empty state has: an icon (Lucide, 40px, --text-tertiary), a headline (Inter 500 16px), a single sentence of direction, and a primary action button.

| Screen | Headline | Direction |
|---|---|---|
| Products (empty) | "No products yet" | "Add your first product to start selling." |
| Orders (empty) | "No orders yet" | "Share your store link to start getting orders." |
| Dashboard (draft store) | "Your store is a draft" | "Publish it to make it live for customers." |

---

## 9. Mobile (builder)

The builder dashboard is primarily desktop-first. On mobile:

- Sidebar collapses to bottom tab bar (4 icons: Home, Products, Orders, Settings)
- Product form opens full-screen sheet
- Stats strip becomes horizontal scrollable
- Dashboard home shows a "best on desktop" soft prompt (not a blocker)
- Storefront editing: mobile owners can add products and view orders. Full appearance editing is desktop only.

---

## 10. Signature design element

**The publish moment** is the single most memorable interaction in Nudge.

When the owner clicks "Publish store":
1. Button text changes to "Publishing..." with a spinning ring (100ms)
2. The spinner resolves to a checkmark with a satisfying "pop" scale animation
3. The button morphs (300ms width transition) into a URL chip: `brew-haven.nudge.store`
4. A confetti burst fires from the button position (12 particles, brand orange + black)
5. A toast appears at top: "Your store is live. Share it →"

This moment should feel like a product launch, because for the owner, it is.
