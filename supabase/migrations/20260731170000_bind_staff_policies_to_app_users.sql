/*
# Lier les policies "staff" à de vrais comptes staff (app_users)

Problème : la migration précédente (20260731160000) restreint l'écriture
sur les tables sensibles à `TO authenticated`. Mais "authenticated" veut
seulement dire "possède une session Supabase Auth valide" — pas
"fait partie de l'équipe". Par défaut, Supabase Auth autorise n'importe
qui à créer un compte via `signUp()` avec la clé publique (visible dans
le code du site). Un visiteur malveillant pourrait donc créer son propre
compte directement via l'API Supabase (sans passer par le site), obtenir
une session "authenticated", et ainsi contourner la vérification de rôle
qui n'existe que côté interface (dans AdminPage.tsx) — la base de
données, elle, ne vérifiait pas qui était réellement connecté.

Cette migration corrige ça à la racine : une fonction `is_active_staff()`
vérifie que l'email du compte connecté existe bien dans `app_users` ET
que ce compte est actif. Toutes les policies "staff_*" sont mises à jour
pour exiger cette vérification, en plus d'être authentifié.

Complément indispensable (à faire manuellement dans le Dashboard, pas en
SQL) : Authentication → Sign In / Providers → désactiver "Allow new users
to sign up", pour qu'il soit même impossible de créer un compte Auth par
soi-même. Voir les instructions données dans le chat.
*/

CREATE OR REPLACE FUNCTION is_active_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM app_users
    WHERE email = (auth.jwt() ->> 'email')
    AND active = true
  );
$$;

ALTER POLICY "staff_select_app_users" ON app_users USING (is_active_staff());
ALTER POLICY "staff_insert_app_users" ON app_users WITH CHECK (is_active_staff());
ALTER POLICY "staff_update_app_users" ON app_users USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_app_users" ON app_users USING (is_active_staff());
ALTER POLICY "staff_insert_categories" ON categories WITH CHECK (is_active_staff());
ALTER POLICY "staff_update_categories" ON categories USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_categories" ON categories USING (is_active_staff());
ALTER POLICY "staff_select_suppliers" ON suppliers USING (is_active_staff());
ALTER POLICY "staff_insert_suppliers" ON suppliers WITH CHECK (is_active_staff());
ALTER POLICY "staff_update_suppliers" ON suppliers USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_suppliers" ON suppliers USING (is_active_staff());
ALTER POLICY "staff_insert_products" ON products WITH CHECK (is_active_staff());
ALTER POLICY "staff_update_products" ON products USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_products" ON products USING (is_active_staff());
ALTER POLICY "staff_update_clients" ON clients USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_clients" ON clients USING (is_active_staff());
ALTER POLICY "staff_update_orders" ON orders USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_orders" ON orders USING (is_active_staff());
ALTER POLICY "staff_update_order_items" ON order_items USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_order_items" ON order_items USING (is_active_staff());
ALTER POLICY "staff_select_cash_sales" ON cash_sales USING (is_active_staff());
ALTER POLICY "staff_insert_cash_sales" ON cash_sales WITH CHECK (is_active_staff());
ALTER POLICY "staff_update_cash_sales" ON cash_sales USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_cash_sales" ON cash_sales USING (is_active_staff());
ALTER POLICY "staff_select_cash_sale_items" ON cash_sale_items USING (is_active_staff());
ALTER POLICY "staff_insert_cash_sale_items" ON cash_sale_items WITH CHECK (is_active_staff());
ALTER POLICY "staff_update_cash_sale_items" ON cash_sale_items USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_cash_sale_items" ON cash_sale_items USING (is_active_staff());
ALTER POLICY "staff_select_purchase_orders" ON purchase_orders USING (is_active_staff());
ALTER POLICY "staff_insert_purchase_orders" ON purchase_orders WITH CHECK (is_active_staff());
ALTER POLICY "staff_update_purchase_orders" ON purchase_orders USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_purchase_orders" ON purchase_orders USING (is_active_staff());
ALTER POLICY "staff_select_purchase_order_items" ON purchase_order_items USING (is_active_staff());
ALTER POLICY "staff_insert_purchase_order_items" ON purchase_order_items WITH CHECK (is_active_staff());
ALTER POLICY "staff_update_purchase_order_items" ON purchase_order_items USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_purchase_order_items" ON purchase_order_items USING (is_active_staff());
ALTER POLICY "staff_insert_promotions" ON promotions WITH CHECK (is_active_staff());
ALTER POLICY "staff_update_promotions" ON promotions USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_promotions" ON promotions USING (is_active_staff());
ALTER POLICY "staff_insert_delivery_zones" ON delivery_zones WITH CHECK (is_active_staff());
ALTER POLICY "staff_update_delivery_zones" ON delivery_zones USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_delivery_zones" ON delivery_zones USING (is_active_staff());
ALTER POLICY "staff_insert_expert_tips" ON expert_tips WITH CHECK (is_active_staff());
ALTER POLICY "staff_update_expert_tips" ON expert_tips USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_expert_tips" ON expert_tips USING (is_active_staff());
ALTER POLICY "staff_select_settings" ON settings USING (is_active_staff());
ALTER POLICY "staff_insert_settings" ON settings WITH CHECK (is_active_staff());
ALTER POLICY "staff_update_settings" ON settings USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_settings" ON settings USING (is_active_staff());
ALTER POLICY "staff_select_notifications" ON notifications USING (is_active_staff());
ALTER POLICY "staff_update_notifications" ON notifications USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_notifications" ON notifications USING (is_active_staff());
ALTER POLICY "staff_select_expenses" ON expenses USING (is_active_staff());
ALTER POLICY "staff_insert_expenses" ON expenses WITH CHECK (is_active_staff());
ALTER POLICY "staff_update_expenses" ON expenses USING (is_active_staff()) WITH CHECK (is_active_staff());
ALTER POLICY "staff_delete_expenses" ON expenses USING (is_active_staff());
