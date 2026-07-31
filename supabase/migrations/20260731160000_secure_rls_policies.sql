/*
# Sécurisation des policies RLS

Contexte: toutes les tables avaient des policies "USING (true)" ouvertes à
`anon` pour SELECT/INSERT/UPDATE/DELETE. Comme la clé anon est publique
(elle est visible dans le code du site), cela permettait à n'importe qui
d'appeler directement l'API Supabase pour lire/modifier/supprimer TOUTES
les données (produits, commandes, clients, finances...), même sans passer
par le site.

Ce fichier resserre les policies :
- Tables catalogue public (categories, products, expert_tips,
  delivery_zones, promotions) : lecture (SELECT) ouverte à tous
  (anon + authenticated), écriture réservée aux comptes staff connectés
  (authenticated).
- Tables strictement internes (app_users, suppliers, purchase_orders,
  purchase_order_items, cash_sales, cash_sale_items, expenses, settings,
  notifications) : tout est réservé à authenticated (le staff doit être
  connecté via Supabase Auth).
- orders / order_items / clients : INSERT reste ouvert à anon car le
  client final passe commande sans créer de compte (checkout public).
  SELECT reste ouvert à anon car la page "Suivi de commande" recherche
  une commande par numéro/téléphone sans authentification.
  UPDATE / DELETE réservés à authenticated (le staff gère les statuts).

Limite connue : comme SELECT reste ouvert sur orders/clients pour
permettre le suivi de commande sans compte client, ces tables restent
techniquement lisibles en intégralité via l'API si quelqu'un interroge
directement Supabase avec la clé anon (pas seulement via l'app). Pour une
sécurité complète il faudrait déplacer le suivi de commande vers une
fonction Supabase Edge (RPC sécurisée) qui ne renvoie que la commande
correspondant exactement au numéro + téléphone fournis. Cette migration
retire déjà l'accès en écriture (UPDATE/DELETE), ce qui est le risque le
plus critique (falsification/suppression de commandes).
*/

-- ───────────── APP_USERS : staff uniquement ─────────────
DROP POLICY IF EXISTS "public_read_app_users" ON app_users;
DROP POLICY IF EXISTS "public_insert_app_users" ON app_users;
DROP POLICY IF EXISTS "public_update_app_users" ON app_users;
DROP POLICY IF EXISTS "public_delete_app_users" ON app_users;
CREATE POLICY "staff_select_app_users" ON app_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_insert_app_users" ON app_users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_update_app_users" ON app_users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_app_users" ON app_users FOR DELETE TO authenticated USING (true);

-- ───────────── CATEGORIES : lecture publique, écriture staff ─────────────
DROP POLICY IF EXISTS "public_insert_categories" ON categories;
DROP POLICY IF EXISTS "public_update_categories" ON categories;
DROP POLICY IF EXISTS "public_delete_categories" ON categories;
CREATE POLICY "staff_insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_update_categories" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_categories" ON categories FOR DELETE TO authenticated USING (true);

-- ───────────── SUPPLIERS : staff uniquement ─────────────
DROP POLICY IF EXISTS "public_read_suppliers" ON suppliers;
DROP POLICY IF EXISTS "public_insert_suppliers" ON suppliers;
DROP POLICY IF EXISTS "public_update_suppliers" ON suppliers;
DROP POLICY IF EXISTS "public_delete_suppliers" ON suppliers;
CREATE POLICY "staff_select_suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_insert_suppliers" ON suppliers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_update_suppliers" ON suppliers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_suppliers" ON suppliers FOR DELETE TO authenticated USING (true);

-- ───────────── PRODUCTS : lecture publique, écriture staff ─────────────
DROP POLICY IF EXISTS "public_insert_products" ON products;
DROP POLICY IF EXISTS "public_update_products" ON products;
DROP POLICY IF EXISTS "public_delete_products" ON products;
CREATE POLICY "staff_insert_products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_update_products" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_products" ON products FOR DELETE TO authenticated USING (true);

-- ───────────── CLIENTS : lecture/insertion publique (checkout), écriture staff ─────────────
DROP POLICY IF EXISTS "public_update_clients" ON clients;
DROP POLICY IF EXISTS "public_delete_clients" ON clients;
CREATE POLICY "staff_update_clients" ON clients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_clients" ON clients FOR DELETE TO authenticated USING (true);

-- ───────────── ORDERS : lecture/insertion publique (checkout + suivi), statut réservé au staff ─────────────
DROP POLICY IF EXISTS "public_update_orders" ON orders;
DROP POLICY IF EXISTS "public_delete_orders" ON orders;
CREATE POLICY "staff_update_orders" ON orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_orders" ON orders FOR DELETE TO authenticated USING (true);

-- ───────────── ORDER_ITEMS : idem ─────────────
DROP POLICY IF EXISTS "public_update_order_items" ON order_items;
DROP POLICY IF EXISTS "public_delete_order_items" ON order_items;
CREATE POLICY "staff_update_order_items" ON order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_order_items" ON order_items FOR DELETE TO authenticated USING (true);

-- ───────────── CASH_SALES / CASH_SALE_ITEMS : caisse = staff uniquement ─────────────
DROP POLICY IF EXISTS "public_read_cash_sales" ON cash_sales;
DROP POLICY IF EXISTS "public_insert_cash_sales" ON cash_sales;
DROP POLICY IF EXISTS "public_update_cash_sales" ON cash_sales;
DROP POLICY IF EXISTS "public_delete_cash_sales" ON cash_sales;
CREATE POLICY "staff_select_cash_sales" ON cash_sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_insert_cash_sales" ON cash_sales FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_update_cash_sales" ON cash_sales FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_cash_sales" ON cash_sales FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "public_read_cash_sale_items" ON cash_sale_items;
DROP POLICY IF EXISTS "public_insert_cash_sale_items" ON cash_sale_items;
DROP POLICY IF EXISTS "public_update_cash_sale_items" ON cash_sale_items;
DROP POLICY IF EXISTS "public_delete_cash_sale_items" ON cash_sale_items;
CREATE POLICY "staff_select_cash_sale_items" ON cash_sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_insert_cash_sale_items" ON cash_sale_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_update_cash_sale_items" ON cash_sale_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_cash_sale_items" ON cash_sale_items FOR DELETE TO authenticated USING (true);

-- ───────────── PURCHASE_ORDERS / ITEMS : staff uniquement ─────────────
DROP POLICY IF EXISTS "public_read_purchase_orders" ON purchase_orders;
DROP POLICY IF EXISTS "public_insert_purchase_orders" ON purchase_orders;
DROP POLICY IF EXISTS "public_update_purchase_orders" ON purchase_orders;
DROP POLICY IF EXISTS "public_delete_purchase_orders" ON purchase_orders;
CREATE POLICY "staff_select_purchase_orders" ON purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_insert_purchase_orders" ON purchase_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_update_purchase_orders" ON purchase_orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_purchase_orders" ON purchase_orders FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "public_read_po_items" ON purchase_order_items;
DROP POLICY IF EXISTS "public_insert_po_items" ON purchase_order_items;
DROP POLICY IF EXISTS "public_update_po_items" ON purchase_order_items;
DROP POLICY IF EXISTS "public_delete_po_items" ON purchase_order_items;
CREATE POLICY "staff_select_purchase_order_items" ON purchase_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_insert_purchase_order_items" ON purchase_order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_update_purchase_order_items" ON purchase_order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_purchase_order_items" ON purchase_order_items FOR DELETE TO authenticated USING (true);

-- ───────────── PROMOTIONS : lecture publique, écriture staff ─────────────
DROP POLICY IF EXISTS "public_insert_promotions" ON promotions;
DROP POLICY IF EXISTS "public_update_promotions" ON promotions;
DROP POLICY IF EXISTS "public_delete_promotions" ON promotions;
CREATE POLICY "staff_insert_promotions" ON promotions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_update_promotions" ON promotions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_promotions" ON promotions FOR DELETE TO authenticated USING (true);

-- ───────────── DELIVERY_ZONES : lecture publique (checkout), écriture staff ─────────────
DROP POLICY IF EXISTS "public_insert_delivery_zones" ON delivery_zones;
DROP POLICY IF EXISTS "public_update_delivery_zones" ON delivery_zones;
DROP POLICY IF EXISTS "public_delete_delivery_zones" ON delivery_zones;
CREATE POLICY "staff_insert_delivery_zones" ON delivery_zones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_update_delivery_zones" ON delivery_zones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_delivery_zones" ON delivery_zones FOR DELETE TO authenticated USING (true);

-- ───────────── EXPERT_TIPS : lecture publique, écriture staff ─────────────
DROP POLICY IF EXISTS "public_insert_expert_tips" ON expert_tips;
DROP POLICY IF EXISTS "public_update_expert_tips" ON expert_tips;
DROP POLICY IF EXISTS "public_delete_expert_tips" ON expert_tips;
CREATE POLICY "staff_insert_expert_tips" ON expert_tips FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_update_expert_tips" ON expert_tips FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_expert_tips" ON expert_tips FOR DELETE TO authenticated USING (true);

-- ───────────── SETTINGS : staff uniquement ─────────────
DROP POLICY IF EXISTS "public_read_settings" ON settings;
DROP POLICY IF EXISTS "public_insert_settings" ON settings;
DROP POLICY IF EXISTS "public_update_settings" ON settings;
DROP POLICY IF EXISTS "public_delete_settings" ON settings;
CREATE POLICY "staff_select_settings" ON settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_insert_settings" ON settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_update_settings" ON settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_settings" ON settings FOR DELETE TO authenticated USING (true);

-- ───────────── NOTIFICATIONS : insertion publique (checkout/POS créent des alertes), reste réservé au staff ─────────────
DROP POLICY IF EXISTS "public_read_notifications" ON notifications;
DROP POLICY IF EXISTS "public_update_notifications" ON notifications;
DROP POLICY IF EXISTS "public_delete_notifications" ON notifications;
CREATE POLICY "staff_select_notifications" ON notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_update_notifications" ON notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_notifications" ON notifications FOR DELETE TO authenticated USING (true);

-- ───────────── EXPENSES : staff uniquement ─────────────
DROP POLICY IF EXISTS "anon_select_expenses" ON expenses;
DROP POLICY IF EXISTS "anon_insert_expenses" ON expenses;
DROP POLICY IF EXISTS "anon_update_expenses" ON expenses;
DROP POLICY IF EXISTS "anon_delete_expenses" ON expenses;
CREATE POLICY "staff_select_expenses" ON expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_insert_expenses" ON expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_update_expenses" ON expenses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_delete_expenses" ON expenses FOR DELETE TO authenticated USING (true);
