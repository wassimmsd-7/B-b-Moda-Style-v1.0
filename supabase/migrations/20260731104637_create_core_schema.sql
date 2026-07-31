
/*
# Bebe Moda Style — Core Schema

1. Tables créées:
   - `app_users` : comptes internes (owner, cashier, superadmin) avec rôle et langue
   - `categories` : catégories de produits (vêtements, chaussures, jouets…)
   - `products` : catalogue produits avec stock, prix achat/vente, images
   - `suppliers` : fournisseurs avec contacts
   - `clients` : clients avec historique
   - `orders` : commandes en ligne des clients
   - `order_items` : lignes de chaque commande
   - `cash_sales` : ventes caisse (POS)
   - `cash_sale_items` : lignes des ventes caisse
   - `purchase_orders` : bons de commande fournisseurs
   - `purchase_order_items` : lignes bons commande
   - `promotions` : offres et réductions
   - `delivery_zones` : zones de livraison avec tarifs
   - `expert_tips` : conseils experts bébé/parents
   - `settings` : paramètres globaux de l'app

2. Sécurité: RLS activé, policies anon+authenticated (app sans login client obligatoire)
*/

-- ───────────── APP USERS (staff) ─────────────
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'cashier' CHECK (role IN ('superadmin','owner','cashier')),
  lang text NOT NULL DEFAULT 'fr' CHECK (lang IN ('fr','ar','en','dz')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_app_users" ON app_users;
CREATE POLICY "public_read_app_users" ON app_users FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_app_users" ON app_users;
CREATE POLICY "public_insert_app_users" ON app_users FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_app_users" ON app_users;
CREATE POLICY "public_update_app_users" ON app_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_app_users" ON app_users;
CREATE POLICY "public_delete_app_users" ON app_users FOR DELETE TO anon, authenticated USING (true);

-- ───────────── CATEGORIES ─────────────
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr text NOT NULL,
  name_ar text,
  name_en text,
  name_dz text,
  icon text,
  color text DEFAULT '#ec4899',
  sort_order integer DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_categories" ON categories;
CREATE POLICY "public_insert_categories" ON categories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_categories" ON categories;
CREATE POLICY "public_update_categories" ON categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_categories" ON categories;
CREATE POLICY "public_delete_categories" ON categories FOR DELETE TO anon, authenticated USING (true);

-- ───────────── SUPPLIERS ─────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_name text,
  phone text,
  phone2 text,
  email text,
  address text,
  city text,
  country text DEFAULT 'Algérie',
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_suppliers" ON suppliers;
CREATE POLICY "public_read_suppliers" ON suppliers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_suppliers" ON suppliers;
CREATE POLICY "public_insert_suppliers" ON suppliers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_suppliers" ON suppliers;
CREATE POLICY "public_update_suppliers" ON suppliers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_suppliers" ON suppliers;
CREATE POLICY "public_delete_suppliers" ON suppliers FOR DELETE TO anon, authenticated USING (true);

-- ───────────── PRODUCTS ─────────────
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE,
  barcode text,
  name_fr text NOT NULL,
  name_ar text,
  name_en text,
  name_dz text,
  description_fr text,
  description_ar text,
  description_en text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  age_min_months integer DEFAULT 0,
  age_max_months integer DEFAULT 36,
  gender text DEFAULT 'unisex' CHECK (gender IN ('boy','girl','unisex')),
  purchase_price numeric(10,2) NOT NULL DEFAULT 0,
  selling_price numeric(10,2) NOT NULL DEFAULT 0,
  promo_price numeric(10,2),
  promo_end_date date,
  stock integer NOT NULL DEFAULT 0,
  stock_min integer NOT NULL DEFAULT 5,
  images text[] DEFAULT '{}',
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  season text DEFAULT 'all' CHECK (season IN ('spring','summer','autumn','winter','all')),
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  weight_grams integer,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_products" ON products;
CREATE POLICY "public_insert_products" ON products FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_products" ON products;
CREATE POLICY "public_update_products" ON products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_products" ON products;
CREATE POLICY "public_delete_products" ON products FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- ───────────── CLIENTS ─────────────
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  phone2 text,
  email text,
  wilaya text,
  commune text,
  address text,
  notes text,
  total_orders integer DEFAULT 0,
  total_spent numeric(12,2) DEFAULT 0,
  last_order_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_clients" ON clients;
CREATE POLICY "public_read_clients" ON clients FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_clients" ON clients;
CREATE POLICY "public_insert_clients" ON clients FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_clients" ON clients;
CREATE POLICY "public_update_clients" ON clients FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_clients" ON clients;
CREATE POLICY "public_delete_clients" ON clients FOR DELETE TO anon, authenticated USING (true);

-- ───────────── DELIVERY ZONES ─────────────
CREATE TABLE IF NOT EXISTS delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wilaya_code text NOT NULL,
  wilaya_name text NOT NULL,
  home_price numeric(8,2) DEFAULT 0,
  desk_price numeric(8,2) DEFAULT 0,
  days_min integer DEFAULT 1,
  days_max integer DEFAULT 5,
  active boolean DEFAULT true
);
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_delivery_zones" ON delivery_zones;
CREATE POLICY "public_read_delivery_zones" ON delivery_zones FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_delivery_zones" ON delivery_zones;
CREATE POLICY "public_insert_delivery_zones" ON delivery_zones FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_delivery_zones" ON delivery_zones;
CREATE POLICY "public_update_delivery_zones" ON delivery_zones FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_delivery_zones" ON delivery_zones;
CREATE POLICY "public_delete_delivery_zones" ON delivery_zones FOR DELETE TO anon, authenticated USING (true);

-- ───────────── ORDERS (online) ─────────────
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT 'ORD-' || to_char(now(),'YYYYMMDD') || '-' || substr(gen_random_uuid()::text,1,6),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_phone2 text,
  client_wilaya text,
  client_commune text,
  client_address text,
  delivery_zone_id uuid REFERENCES delivery_zones(id) ON DELETE SET NULL,
  delivery_type text DEFAULT 'home' CHECK (delivery_type IN ('home','desk','pickup')),
  delivery_price numeric(8,2) DEFAULT 0,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  discount numeric(12,2) DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'cod' CHECK (payment_method IN ('cod','ccp','virement','autre')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','returned')),
  notes text,
  delivery_tracking text,
  delivery_company text,
  assigned_to uuid REFERENCES app_users(id) ON DELETE SET NULL,
  confirmed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  source text DEFAULT 'online' CHECK (source IN ('online','phone','instagram','facebook')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_orders" ON orders;
CREATE POLICY "public_read_orders" ON orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_orders" ON orders;
CREATE POLICY "public_insert_orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_orders" ON orders;
CREATE POLICY "public_update_orders" ON orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_orders" ON orders;
CREATE POLICY "public_delete_orders" ON orders FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ───────────── ORDER ITEMS ─────────────
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_sku text,
  size text,
  color text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_order_items" ON order_items;
CREATE POLICY "public_read_order_items" ON order_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_order_items" ON order_items;
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_order_items" ON order_items;
CREATE POLICY "public_update_order_items" ON order_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_order_items" ON order_items;
CREATE POLICY "public_delete_order_items" ON order_items FOR DELETE TO anon, authenticated USING (true);

-- ───────────── CASH SALES (POS) ─────────────
CREATE TABLE IF NOT EXISTS cash_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number text UNIQUE NOT NULL DEFAULT 'POS-' || to_char(now(),'YYYYMMDD') || '-' || substr(gen_random_uuid()::text,1,6),
  cashier_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  cashier_name text,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  client_name text,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  discount numeric(12,2) DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  amount_paid numeric(12,2) DEFAULT 0,
  amount_due numeric(12,2) DEFAULT 0,
  credit_deadline date,
  payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash','ccp','card','credit','mixed')),
  status text DEFAULT 'completed' CHECK (status IN ('completed','partial','credit','cancelled','returned')),
  notes text,
  return_reason text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE cash_sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_cash_sales" ON cash_sales;
CREATE POLICY "public_read_cash_sales" ON cash_sales FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_cash_sales" ON cash_sales;
CREATE POLICY "public_insert_cash_sales" ON cash_sales FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_cash_sales" ON cash_sales;
CREATE POLICY "public_update_cash_sales" ON cash_sales FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_cash_sales" ON cash_sales;
CREATE POLICY "public_delete_cash_sales" ON cash_sales FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_cash_sales_date ON cash_sales(created_at DESC);

-- ───────────── CASH SALE ITEMS ─────────────
CREATE TABLE IF NOT EXISTS cash_sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES cash_sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_sku text,
  barcode text,
  size text,
  color text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  purchase_price numeric(10,2) DEFAULT 0,
  discount_amount numeric(10,2) DEFAULT 0,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE cash_sale_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_cash_sale_items" ON cash_sale_items;
CREATE POLICY "public_read_cash_sale_items" ON cash_sale_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_cash_sale_items" ON cash_sale_items;
CREATE POLICY "public_insert_cash_sale_items" ON cash_sale_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_cash_sale_items" ON cash_sale_items;
CREATE POLICY "public_update_cash_sale_items" ON cash_sale_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_cash_sale_items" ON cash_sale_items;
CREATE POLICY "public_delete_cash_sale_items" ON cash_sale_items FOR DELETE TO anon, authenticated USING (true);

-- ───────────── PURCHASE ORDERS (fournisseurs) ─────────────
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number text UNIQUE NOT NULL DEFAULT 'PO-' || to_char(now(),'YYYYMMDD') || '-' || substr(gen_random_uuid()::text,1,6),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_name text,
  status text DEFAULT 'draft' CHECK (status IN ('draft','sent','received','cancelled')),
  total_amount numeric(12,2) DEFAULT 0,
  notes text,
  expected_date date,
  received_at timestamptz,
  created_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_purchase_orders" ON purchase_orders;
CREATE POLICY "public_read_purchase_orders" ON purchase_orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_purchase_orders" ON purchase_orders;
CREATE POLICY "public_insert_purchase_orders" ON purchase_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_purchase_orders" ON purchase_orders;
CREATE POLICY "public_update_purchase_orders" ON purchase_orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_purchase_orders" ON purchase_orders;
CREATE POLICY "public_delete_purchase_orders" ON purchase_orders FOR DELETE TO anon, authenticated USING (true);

-- ───────────── PURCHASE ORDER ITEMS ─────────────
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity_ordered integer NOT NULL DEFAULT 1,
  quantity_received integer DEFAULT 0,
  unit_price numeric(10,2) DEFAULT 0,
  total_price numeric(10,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_po_items" ON purchase_order_items;
CREATE POLICY "public_read_po_items" ON purchase_order_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_po_items" ON purchase_order_items;
CREATE POLICY "public_insert_po_items" ON purchase_order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_po_items" ON purchase_order_items;
CREATE POLICY "public_update_po_items" ON purchase_order_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_po_items" ON purchase_order_items;
CREATE POLICY "public_delete_po_items" ON purchase_order_items FOR DELETE TO anon, authenticated USING (true);

-- ───────────── PROMOTIONS ─────────────
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr text NOT NULL,
  name_ar text,
  name_en text,
  name_dz text,
  description_fr text,
  discount_type text DEFAULT 'percent' CHECK (discount_type IN ('percent','fixed')),
  discount_value numeric(8,2) NOT NULL DEFAULT 0,
  min_order_amount numeric(10,2) DEFAULT 0,
  applies_to text DEFAULT 'all' CHECK (applies_to IN ('all','category','product')),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  start_date date,
  end_date date,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_promotions" ON promotions;
CREATE POLICY "public_read_promotions" ON promotions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_promotions" ON promotions;
CREATE POLICY "public_insert_promotions" ON promotions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_promotions" ON promotions;
CREATE POLICY "public_update_promotions" ON promotions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_promotions" ON promotions;
CREATE POLICY "public_delete_promotions" ON promotions FOR DELETE TO anon, authenticated USING (true);

-- ───────────── EXPERT TIPS ─────────────
CREATE TABLE IF NOT EXISTS expert_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_fr text NOT NULL,
  title_ar text,
  title_en text,
  content_fr text,
  content_ar text,
  content_en text,
  category text DEFAULT 'general' CHECK (category IN ('nutrition','sante','developpement','vetements','securite','general')),
  age_min_months integer DEFAULT 0,
  age_max_months integer DEFAULT 36,
  icon text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE expert_tips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_expert_tips" ON expert_tips;
CREATE POLICY "public_read_expert_tips" ON expert_tips FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_expert_tips" ON expert_tips;
CREATE POLICY "public_insert_expert_tips" ON expert_tips FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_expert_tips" ON expert_tips;
CREATE POLICY "public_update_expert_tips" ON expert_tips FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_expert_tips" ON expert_tips;
CREATE POLICY "public_delete_expert_tips" ON expert_tips FOR DELETE TO anon, authenticated USING (true);

-- ───────────── SETTINGS ─────────────
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_settings" ON settings;
CREATE POLICY "public_read_settings" ON settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_settings" ON settings;
CREATE POLICY "public_insert_settings" ON settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_settings" ON settings;
CREATE POLICY "public_update_settings" ON settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_settings" ON settings;
CREATE POLICY "public_delete_settings" ON settings FOR DELETE TO anon, authenticated USING (true);

-- ───────────── SEED DATA ─────────────
INSERT INTO settings(key,value) VALUES
  ('store_name','Bèbè Moda Style'),
  ('store_phone',''),
  ('store_address','Algérie'),
  ('store_email',''),
  ('currency','DZD'),
  ('low_stock_threshold','5'),
  ('cod_enabled','true'),
  ('store_instagram',''),
  ('store_facebook','')
ON CONFLICT(key) DO NOTHING;

INSERT INTO app_users(email,name,role) VALUES
  ('admin@bebemodasyle.dz','Super Admin','superadmin'),
  ('owner@bebemoda.dz','Propriétaire','owner'),
  ('caisse@bebemoda.dz','Caissier','cashier')
ON CONFLICT(email) DO NOTHING;

INSERT INTO categories(name_fr,name_ar,name_en,name_dz,icon,color,sort_order) VALUES
  ('Vêtements','ملابس','Clothing','Habillement','shirt','#ec4899',1),
  ('Chaussures','أحذية','Shoes','Souliers','footprints','#f97316',2),
  ('Jouets','ألعاب','Toys','Jouets','gamepad-2','#8b5cf6',3),
  ('Accessoires','ملحقات','Accessories','Accessoires','star','#06b6d4',4),
  ('Hygiène & Soin','نظافة وعناية','Hygiene & Care','Hygiene','heart','#10b981',5),
  ('Nutrition','تغذية','Nutrition','Nutrition','apple','#f59e0b',6),
  ('Chambre & Mobilier','غرفة وأثاث','Bedroom & Furniture','Chambre','bed','#6366f1',7),
  ('Poussettes & Transport','عربات نقل','Strollers','Transport','baby','#14b8a6',8)
ON CONFLICT DO NOTHING;

INSERT INTO expert_tips(title_fr,content_fr,category,age_min_months,age_max_months,icon) VALUES
  ('Choisir la bonne taille','Les bébés grandissent vite. Préférez des vêtements 1 à 2 tailles au-dessus de l''âge réel.','vetements',0,36,'shirt'),
  ('Matières naturelles','Choisissez le coton 100% pour les nouveau-nés, il est doux et respirant.','vetements',0,12,'leaf'),
  ('Sécurité du sommeil','Évitez les coussins et couvertures lourdes avant 12 mois. Le gigoteuse est idéal.','securite',0,12,'moon'),
  ('Diversification alimentaire','Introduisez les aliments solides entre 4 et 6 mois, un aliment à la fois.','nutrition',4,12,'apple'),
  ('Stimulation sensorielle','Les jouets à contraste noir/blanc stimulent la vision dès la naissance.','developpement',0,6,'eye'),
  ('Soin de la peau','Utilisez des produits sans parfum pour les 3 premiers mois.','sante',0,3,'droplets')
ON CONFLICT DO NOTHING;
