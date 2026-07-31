/*
# Add expenses table and category icons

1. New Tables
- `expenses` — tracks all business expenses (personnel, employee salaries, rent, utilities, extra costs)
  - id, type (personnel/salary/rent/utility/supplies/marketing/other), category, description, amount, payment_date, created_at

2. Modified Tables
- `categories` — add `icon` column (lucide icon name) and `color` column if not present
- `products` — add `is_seasonal` boolean column for seasonal product tracking

3. Security
- RLS enabled on expenses, anon+authenticated CRUD (single-tenant app)
*/

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('personnel','salary','rent','utility','supplies','marketing','transport','tax','other')),
  category text,
  description text,
  amount numeric NOT NULL DEFAULT 0,
  payment_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_expenses" ON expenses;
CREATE POLICY "anon_select_expenses" ON expenses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_expenses" ON expenses;
CREATE POLICY "anon_insert_expenses" ON expenses FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_expenses" ON expenses;
CREATE POLICY "anon_update_expenses" ON expenses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_expenses" ON expenses;
CREATE POLICY "anon_delete_expenses" ON expenses FOR DELETE TO anon, authenticated USING (true);

-- Add is_seasonal to products if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_seasonal') THEN
    ALTER TABLE products ADD COLUMN is_seasonal boolean DEFAULT false;
  END IF;
END $$;

-- Add icon to categories if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'icon') THEN
    ALTER TABLE categories ADD COLUMN icon text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'color') THEN
    ALTER TABLE categories ADD COLUMN color text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
