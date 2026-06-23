# Backend Schema
## Nudge Commerce AI — v1.0 (PostgreSQL / Supabase)

---

## Overview

All tables use UUIDs as primary keys. `created_at` and `updated_at` are on every table. Row-level security (RLS) is enabled on all tables. Supabase Auth manages the `auth.users` table; our schema extends it with a `profiles` table.

---

## Entity relationship summary

```
auth.users (Supabase managed)
    └─► profiles (1:1)
          └─► stores (1:N)
                ├─► products (1:N)
                │     └─► product_images (1:N)
                ├─► orders (1:N)
                │     ├─► order_items (1:N) ──► products
                │     └─► payments (1:1)
                ├─► store_themes (1:1)
                └─► store_domains (0:1)
```

---

## Table definitions

### `profiles`

Extends Supabase auth.users with product-specific data.

```sql
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  phone           TEXT UNIQUE,
  avatar_url      TEXT,
  plan            TEXT NOT NULL DEFAULT 'free'
                  CHECK (plan IN ('free', 'pro', 'agency')),
  plan_expires_at TIMESTAMPTZ,
  razorpay_customer_id TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only read/write their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

---

### `stores`

The core entity. Each user can have 1 store on free, unlimited on pro/agency.

```sql
CREATE TABLE stores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,  -- used for subdomain: {slug}.nudge.store
  description     TEXT,
  tagline         TEXT,
  business_type   TEXT NOT NULL
                  CHECK (business_type IN (
                    'cafe', 'bakery', 'clothing', 'fitness',
                    'handmade', 'restaurant', 'beauty', 'generic'
                  )),
  logo_url        TEXT,
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'live', 'suspended')),
  template_id     TEXT NOT NULL DEFAULT 'minimal',
  ai_config       JSONB,           -- raw AI-generated StoreConfig stored for reference
  whatsapp_number TEXT,
  contact_email   TEXT,
  contact_address TEXT,
  currency        TEXT DEFAULT 'INR',
  delivery_fee    INTEGER DEFAULT 0,  -- in paise (₹0 = free delivery)
  free_delivery_above INTEGER,        -- in paise, null = never
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX stores_owner_id_idx ON stores(owner_id);
CREATE INDEX stores_slug_idx ON stores(slug);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stores_owner" ON stores
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Public read for published stores (storefront)
CREATE POLICY "stores_public_read" ON stores
  FOR SELECT USING (status = 'live');
```

---

### `store_themes`

Visual customization separate from the store record (easier to version/rollback).

```sql
CREATE TABLE store_themes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  primary_color   TEXT DEFAULT '#0F0F0E',
  accent_color    TEXT DEFAULT '#F97316',
  background_color TEXT DEFAULT '#FFFFFF',
  font_style      TEXT DEFAULT 'modern'
                  CHECK (font_style IN ('modern', 'classic', 'playful', 'minimal')),
  sections_order  TEXT[] DEFAULT ARRAY['hero','products','about','contact'],
  sections_enabled JSONB DEFAULT '{"hero":true,"products":true,"about":true,"contact":true}',
  hero_image_url  TEXT,
  hero_headline   TEXT,
  hero_subheading TEXT,
  about_text      TEXT,
  social_links    JSONB DEFAULT '{}',  -- {instagram, facebook, twitter, youtube}
  custom_css      TEXT,               -- Pro only
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE store_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "themes_owner" ON store_themes
  USING (auth.uid() = (SELECT owner_id FROM stores WHERE id = store_id))
  WITH CHECK (auth.uid() = (SELECT owner_id FROM stores WHERE id = store_id));

CREATE POLICY "themes_public_read" ON store_themes
  FOR SELECT USING (
    (SELECT status FROM stores WHERE id = store_id) = 'live'
  );
```

---

### `store_domains`

Custom domain mapping for Pro users.

```sql
CREATE TABLE store_domains (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  domain          TEXT NOT NULL UNIQUE,  -- e.g. "brewhaven.in"
  verified        BOOLEAN DEFAULT FALSE,
  vercel_domain_id TEXT,                -- Vercel API domain ID for management
  ssl_provisioned BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE store_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "domains_owner" ON store_domains
  USING (auth.uid() = (SELECT owner_id FROM stores WHERE id = store_id));
```

---

### `products`

```sql
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,           -- unique within store
  description     TEXT,
  price           INTEGER NOT NULL,        -- in paise (₹100 = 10000)
  compare_at_price INTEGER,               -- original price for showing discount
  category        TEXT,
  sku             TEXT,
  stock_status    TEXT DEFAULT 'in_stock'
                  CHECK (stock_status IN ('in_stock', 'out_of_stock', 'limited')),
  stock_quantity  INTEGER,                -- null = unlimited
  is_featured     BOOLEAN DEFAULT FALSE,
  sort_order      INTEGER DEFAULT 0,
  seo_title       TEXT,
  seo_description TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, slug)
);

CREATE INDEX products_store_id_idx ON products(store_id);
CREATE INDEX products_store_featured_idx ON products(store_id, is_featured);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_owner" ON products
  USING (auth.uid() = (SELECT owner_id FROM stores WHERE id = store_id))
  WITH CHECK (auth.uid() = (SELECT owner_id FROM stores WHERE id = store_id));

CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (
    (SELECT status FROM stores WHERE id = store_id) = 'live'
  );
```

---

### `product_images`

```sql
CREATE TABLE product_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,           -- Cloudinary CDN URL
  cloudinary_id   TEXT,                   -- for deletion via Cloudinary API
  alt_text        TEXT,
  sort_order      INTEGER DEFAULT 0,
  is_primary      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX product_images_product_id_idx ON product_images(product_id);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_images_owner" ON product_images
  USING (
    auth.uid() = (
      SELECT s.owner_id FROM stores s
      JOIN products p ON p.store_id = s.id
      WHERE p.id = product_id
    )
  );

CREATE POLICY "product_images_public_read" ON product_images
  FOR SELECT USING (true);  -- images are always public once uploaded
```

---

### `orders`

```sql
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT NOT NULL UNIQUE,   -- human-readable, e.g. "NUD-2024-00142"
  store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  customer_email  TEXT,
  delivery_address JSONB NOT NULL,
  -- {line1, line2, city, state, pincode, country}
  subtotal        INTEGER NOT NULL,       -- in paise
  delivery_fee    INTEGER DEFAULT 0,      -- in paise
  discount_amount INTEGER DEFAULT 0,      -- in paise
  total           INTEGER NOT NULL,       -- in paise
  coupon_code     TEXT,
  payment_method  TEXT CHECK (payment_method IN ('online', 'cod')),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN (
                    'pending', 'confirmed', 'processing',
                    'shipped', 'delivered', 'cancelled', 'refunded'
                  )),
  notes           TEXT,                   -- customer notes
  owner_notes     TEXT,                   -- internal notes by store owner
  notified_at     TIMESTAMPTZ,           -- when WhatsApp notification sent
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate readable order numbers
CREATE SEQUENCE order_seq START 1000;
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'NUD-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                     LPAD(nextval('order_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

CREATE INDEX orders_store_id_idx ON orders(store_id);
CREATE INDEX orders_store_status_idx ON orders(store_id, status);
CREATE INDEX orders_created_at_idx ON orders(created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_owner" ON orders
  USING (auth.uid() = (SELECT owner_id FROM stores WHERE id = store_id));
```

---

### `order_items`

```sql
CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name    TEXT NOT NULL,    -- snapshot at time of order
  product_image   TEXT,             -- snapshot
  unit_price      INTEGER NOT NULL, -- snapshot in paise
  quantity        INTEGER NOT NULL DEFAULT 1,
  total_price     INTEGER NOT NULL, -- unit_price * quantity
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX order_items_order_id_idx ON order_items(order_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_owner" ON order_items
  USING (
    auth.uid() = (
      SELECT s.owner_id FROM stores s
      JOIN orders o ON o.store_id = s.id
      WHERE o.id = order_id
    )
  );
```

---

### `payments`

```sql
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_order_id   TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature  TEXT,
  amount              INTEGER NOT NULL,  -- in paise
  currency            TEXT DEFAULT 'INR',
  status              TEXT DEFAULT 'pending'
                      CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
  method              TEXT,              -- upi, card, netbanking, wallet
  error_code          TEXT,
  error_description   TEXT,
  captured_at         TIMESTAMPTZ,
  refunded_at         TIMESTAMPTZ,
  refund_id           TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_owner" ON payments
  USING (
    auth.uid() = (
      SELECT s.owner_id FROM stores s
      JOIN orders o ON o.store_id = s.id
      WHERE o.id = order_id
    )
  );
```

---

### `subscriptions`

```sql
CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id                UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan                    TEXT NOT NULL CHECK (plan IN ('pro', 'agency')),
  status                  TEXT DEFAULT 'active'
                          CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  razorpay_subscription_id TEXT UNIQUE,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancelled_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_owner" ON subscriptions
  USING (auth.uid() = owner_id);
```

---

### `ai_generation_logs`

For debugging, quality monitoring, and prompt improvement.

```sql
CREATE TABLE ai_generation_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  store_id        UUID REFERENCES stores(id) ON DELETE SET NULL,
  input_payload   JSONB NOT NULL,
  output_config   JSONB,
  model_used      TEXT,
  tokens_used     INTEGER,
  duration_ms     INTEGER,
  success         BOOLEAN DEFAULT TRUE,
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS on this table; only service role can insert
-- Owners cannot see other owners' logs
```

---

## Database functions & triggers

### Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- (repeat for stores, store_themes, products, orders, payments, subscriptions)
```

### Enforce free plan product limit

```sql
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
DECLARE
  owner_plan TEXT;
  product_count INTEGER;
BEGIN
  SELECT p.plan INTO owner_plan
  FROM profiles p
  JOIN stores s ON s.owner_id = p.id
  WHERE s.id = NEW.store_id;

  IF owner_plan = 'free' THEN
    SELECT COUNT(*) INTO product_count
    FROM products WHERE store_id = NEW.store_id;

    IF product_count >= 5 THEN
      RAISE EXCEPTION 'Free plan is limited to 5 products. Upgrade to Pro for unlimited products.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_product_limit
  BEFORE INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION check_product_limit();
```

### Enforce free plan store limit

```sql
CREATE OR REPLACE FUNCTION check_store_limit()
RETURNS TRIGGER AS $$
DECLARE
  owner_plan TEXT;
  store_count INTEGER;
BEGIN
  SELECT plan INTO owner_plan FROM profiles WHERE id = NEW.owner_id;

  IF owner_plan = 'free' THEN
    SELECT COUNT(*) INTO store_count
    FROM stores WHERE owner_id = NEW.owner_id;

    IF store_count >= 1 THEN
      RAISE EXCEPTION 'Free plan is limited to 1 store. Upgrade to Pro.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_store_limit
  BEFORE INSERT ON stores
  FOR EACH ROW EXECUTE FUNCTION check_store_limit();
```

---

## Indexes summary

```sql
-- Performance-critical reads
CREATE INDEX orders_store_created_idx ON orders(store_id, created_at DESC);
CREATE INDEX products_store_sort_idx ON products(store_id, sort_order ASC);
CREATE INDEX product_images_primary_idx ON product_images(product_id, is_primary);
```

---

## Storage buckets (Supabase Storage)

```
store-logos/
  {store_id}/logo.{ext}

product-images/
  {store_id}/{product_id}/{image_id}.{ext}

hero-images/
  {store_id}/hero.{ext}
```

All buckets: public read, authenticated write (owner only via RLS policy on bucket).
