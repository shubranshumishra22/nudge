-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  business_type TEXT,
  message       TEXT NOT NULL,
  status        TEXT DEFAULT 'unread'
                CHECK (status IN ('unread', 'read', 'replied', 'archived')),
  admin_notes   TEXT,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_users table (if profiles exists, references profiles)
CREATE TABLE IF NOT EXISTS admin_users (
  user_id     UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_admin    BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO admin_settings (key, value) VALUES
  ('ai_generation_enabled', 'true'),
  ('new_signups_enabled', 'true'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- RLS: only admin can access these tables
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- contact_messages policies
CREATE POLICY "admin_only_contact_select" ON contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "admin_only_contact_update" ON contact_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "admin_only_contact_delete" ON contact_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "public_insert_contact" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- admin_users policies
CREATE POLICY "admin_only_admin_users" ON admin_users
  USING (user_id = auth.uid());

CREATE POLICY "admin_all_admin_users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- admin_settings policies
CREATE POLICY "admin_only_settings" ON admin_settings
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "public_read_settings" ON admin_settings
  FOR SELECT USING (true);

-- Platform metrics snapshot view
CREATE OR REPLACE VIEW admin_platform_stats AS
SELECT
  (SELECT COUNT(*) FROM stores)                                    AS total_stores,
  (SELECT COUNT(*) FROM stores WHERE status = 'live')             AS live_stores,
  (SELECT COUNT(*) FROM stores WHERE status = 'draft')            AS draft_stores,
  (SELECT COUNT(*) FROM stores
   WHERE created_at > NOW() - INTERVAL '7 days')                  AS stores_this_week,
  (SELECT COUNT(*) FROM stores
   WHERE created_at > NOW() - INTERVAL '1 day')                   AS stores_today,
  (SELECT COUNT(*) FROM profiles)                                  AS total_users,
  (SELECT COUNT(*) FROM profiles
   WHERE created_at > NOW() - INTERVAL '7 days')                  AS users_this_week,
  (SELECT COUNT(*) FROM profiles WHERE plan = 'free')             AS free_users,
  (SELECT COUNT(*) FROM profiles WHERE plan = 'pro')              AS pro_users,
  (SELECT COUNT(*) FROM profiles WHERE plan = 'agency')           AS agency_users,
  (SELECT COUNT(*) FROM orders)                                    AS total_orders,
  (SELECT COALESCE(SUM(total), 0) FROM orders
   WHERE status != 'cancelled')                                    AS total_gmv,
  (SELECT COALESCE(SUM(total), 0) FROM orders
   WHERE created_at > NOW() - INTERVAL '30 days'
   AND status != 'cancelled')                                      AS gmv_this_month,
  (SELECT COUNT(*) FROM orders
   WHERE created_at > NOW() - INTERVAL '1 day')                   AS orders_today,
  (SELECT COUNT(*) FROM contact_messages
   WHERE status = 'unread')                                        AS unread_messages,
  (SELECT COUNT(*) FROM ai_generation_logs
   WHERE created_at > NOW() - INTERVAL '1 day')                   AS ai_calls_today,
  (SELECT COUNT(*) FROM ai_generation_logs
   WHERE success = false
   AND created_at > NOW() - INTERVAL '1 day')                     AS ai_errors_today,
  (SELECT ROUND(AVG(duration_ms))
   FROM ai_generation_logs
   WHERE created_at > NOW() - INTERVAL '1 day')                   AS avg_generation_ms;
