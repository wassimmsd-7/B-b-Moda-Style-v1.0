-- Notifications table for admin alerts
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('new_order','new_sale','low_stock','out_of_stock','custom')),
  title_fr text NOT NULL,
  title_ar text,
  title_en text,
  title_dz text,
  message_fr text,
  message_ar text,
  message_en text,
  message_dz text,
  ref_id uuid,
  ref_type text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_notifications" ON notifications;
CREATE POLICY "public_read_notifications" ON notifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_notifications" ON notifications;
CREATE POLICY "public_insert_notifications" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_notifications" ON notifications;
CREATE POLICY "public_update_notifications" ON notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_notifications" ON notifications;
CREATE POLICY "public_delete_notifications" ON notifications FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
