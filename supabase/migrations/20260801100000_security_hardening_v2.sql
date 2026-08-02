/*
# Renforcement sécurité (v2)

1. Gestion du personnel réservée au super-admin
   -----------------------------------------------
   Jusqu'ici, n'importe quel compte staff actif (même un simple caissier)
   pouvait, via l'API, modifier la table `app_users` — donc se donner le
   rôle "superadmin" lui-même. On ajoute `is_superadmin()` et on restreint
   l'écriture sur `app_users` à ce rôle uniquement. La lecture reste
   ouverte à tout le personnel connecté (nécessaire pour la vérification
   de rôle au login).

2. Données commandes/clients : fin de la lecture ouverte
   -------------------------------------------------------
   Auparavant, `orders`, `order_items` et `clients` étaient lisibles par
   n'importe qui via l'API Supabase (clé publique), pas seulement via le
   site — nécessaire uniquement pour permettre à un client de suivre sa
   commande ou au checkout de retrouver son compte par téléphone. Ce
   n'était pas exploité par l'interface du site (qui filtre côté client),
   mais restait un vrai risque si quelqu'un interrogeait l'API
   directement : il pouvait lister toutes les commandes et coordonnées de
   tous les clients.

   Remplacé par deux fonctions "security definer" qui ne renvoient QUE la
   commande/le client correspondant exactement aux critères fournis
   (numéro de commande + téléphone, ou téléphone seul) — jamais la liste
   complète. Les policies de lecture publique sur ces 3 tables sont
   supprimées ; le personnel connecté (authenticated + is_active_staff())
   garde un accès complet pour gérer les commandes normalement.

3. Stockage des photos produits
   -----------------------------
   Bucket public "product-images" : lecture publique (affichage sur le
   site), envoi/suppression réservés au personnel connecté et actif.
*/

-- ═══════════════ 1. Personnel réservé au super-admin ═══════════════

CREATE OR REPLACE FUNCTION is_superadmin()
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
    AND role = 'superadmin'
  );
$$;

ALTER POLICY "staff_insert_app_users" ON app_users WITH CHECK (is_superadmin());
ALTER POLICY "staff_update_app_users" ON app_users USING (is_superadmin()) WITH CHECK (is_superadmin());
ALTER POLICY "staff_delete_app_users" ON app_users USING (is_superadmin());
-- staff_select_app_users reste ouvert à tout le personnel actif (is_active_staff), inchangé.

-- ═══════════════ 2. Suivi de commande sécurisé ═══════════════

DROP POLICY IF EXISTS "public_read_orders" ON orders;
DROP POLICY IF EXISTS "public_read_order_items" ON order_items;
DROP POLICY IF EXISTS "public_read_clients" ON clients;

CREATE POLICY "staff_select_orders" ON orders FOR SELECT TO authenticated USING (is_active_staff());
CREATE POLICY "staff_select_order_items" ON order_items FOR SELECT TO authenticated USING (is_active_staff());
CREATE POLICY "staff_select_clients" ON clients FOR SELECT TO authenticated USING (is_active_staff());

CREATE OR REPLACE FUNCTION track_order(p_order_number text, p_phone text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT to_jsonb(o) || jsonb_build_object(
    'items', COALESCE((SELECT jsonb_agg(oi) FROM order_items oi WHERE oi.order_id = o.id), '[]'::jsonb)
  )
  INTO result
  FROM orders o
  WHERE o.order_number = p_order_number AND o.client_phone = p_phone
  LIMIT 1;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION track_order(text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION find_client_by_phone(p_phone text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id FROM clients WHERE phone = p_phone LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION find_client_by_phone(text) TO anon, authenticated;

-- ═══════════════ 3. Stockage des photos produits ═══════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "staff_upload_product_images" ON storage.objects;
CREATE POLICY "staff_upload_product_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND is_active_staff());

DROP POLICY IF EXISTS "staff_delete_product_images" ON storage.objects;
CREATE POLICY "staff_delete_product_images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND is_active_staff());
