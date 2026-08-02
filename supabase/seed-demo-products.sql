/*
# Catalogue de démonstration avec photos internet

Ce fichier ajoute ~20 produits d'exemple répartis dans toutes les
catégories, chacun avec une vraie photo (banque d'images libres de droits
Pexels — gratuite, pas de copyright). Objectif : voir immédiatement le
site "habillé" avec du contenu réaliste. Vous pourrez ensuite remplacer
chaque photo par les vôtres directement depuis l'admin (Produits →
Modifier → glisser-déposer vos photos), et modifier/supprimer les
produits comme vous voulez — ce ne sont que des exemples de départ.

À exécuter dans le SQL Editor de votre projet Supabase.
*/

INSERT INTO products (name_fr, name_ar, description_fr, category_id, purchase_price, selling_price, stock, stock_min, images, sizes, colors, gender, season, is_active, is_featured)
SELECT * FROM (VALUES

-- Vêtements
('Body manches longues coton bio', 'بادي أكمام طويلة قطن عضوي', 'Body doux 100% coton bio pour nouveau-né, pression pressostatique facile.',
  (SELECT id FROM categories WHERE name_fr = 'Vêtements' LIMIT 1),
  600::numeric, 1200::numeric, 22, 5,
  ARRAY['https://images.pexels.com/photos/11369371/pexels-photo-11369371.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY['0-3M','3-6M','6-12M'], ARRAY['Blanc','Écru'], 'unisex', 'all', true, true),

('Pyjama léger rayé', 'بيجاما خفيفة مخططة', 'Pyjama une pièce, tissu respirant, pressions au dos pour un change facile.',
  (SELECT id FROM categories WHERE name_fr = 'Vêtements' LIMIT 1),
  700::numeric, 1500::numeric, 14, 5,
  ARRAY['https://images.pexels.com/photos/6624418/pexels-photo-6624418.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY['0-3M','3-6M','6-12M','12-18M'], ARRAY['Gris','Bleu'], 'boy', 'all', true, false),

('Ensemble body + bonnet tricoté', 'طقم بادي وقبعة محبوكة', 'Ensemble chaud pour l''hiver, tricot doux, idéal pour la sortie de maternité.',
  (SELECT id FROM categories WHERE name_fr = 'Vêtements' LIMIT 1),
  900::numeric, 1900::numeric, 9, 4,
  ARRAY['https://images.pexels.com/photos/11369306/pexels-photo-11369306.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY['0-3M','3-6M'], ARRAY['Gris'], 'unisex', 'winter', true, true),

('Barboteuse été légère', 'بدلة صيفية خفيفة', 'Barboteuse en coton léger, parfaite pour les journées chaudes.',
  (SELECT id FROM categories WHERE name_fr = 'Vêtements' LIMIT 1),
  650::numeric, 1400::numeric, 0, 5,
  ARRAY['https://images.pexels.com/photos/3875232/pexels-photo-3875232.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY['3-6M','6-12M'], ARRAY['Multicolore'], 'unisex', 'summer', true, false),

('Grenouillère bébé garçon', 'بدلة نوم للرضيع', 'Grenouillère confortable en coton, coupe ample pour la liberté de mouvement.',
  (SELECT id FROM categories WHERE name_fr = 'Vêtements' LIMIT 1),
  700::numeric, 1450::numeric, 17, 5,
  ARRAY['https://images.pexels.com/photos/8506329/pexels-photo-8506329.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY['6-12M','12-18M'], ARRAY['Marron'], 'boy', 'all', true, false),

-- Chaussures
('Chaussons bébé antidérapants', 'شباشب مانعة للانزلاق', 'Chaussons souples en coton, semelle antidérapante, 0-12 mois.',
  (SELECT id FROM categories WHERE name_fr = 'Chaussures' LIMIT 1),
  400::numeric, 900::numeric, 12, 5,
  ARRAY['https://images.pexels.com/photos/19471464/pexels-photo-19471464.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY['0-6M','6-12M'], ARRAY['Beige','Marron'], 'unisex', 'all', true, false),

('Bottines premiers pas', 'حذاء الخطوات الأولى', 'Bottines souples en cuir végétal, idéales pour les premiers pas.',
  (SELECT id FROM categories WHERE name_fr = 'Chaussures' LIMIT 1),
  1200::numeric, 2600::numeric, 6, 3,
  ARRAY['https://images.pexels.com/photos/15844903/pexels-photo-15844903.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY['18-24M'], ARRAY['Marron'], 'unisex', 'all', true, true),

-- Jouets
('Peluche ours doudou', 'دمية دب محشوة', 'Peluche douce et hypoallergénique, 25cm, compagnon idéal pour dormir.',
  (SELECT id FROM categories WHERE name_fr = 'Jouets' LIMIT 1),
  800::numeric, 1800::numeric, 15, 5,
  ARRAY['https://images.pexels.com/photos/421879/pexels-photo-421879.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY[]::text[], ARRAY['Marron'], 'unisex', 'all', true, true),

('Lapin peluche pastel', 'أرنب محشو', 'Peluche lapin toute douce, coloris pastel, parfaite pour bébé.',
  (SELECT id FROM categories WHERE name_fr = 'Jouets' LIMIT 1),
  750::numeric, 1650::numeric, 3, 5,
  ARRAY['https://images.pexels.com/photos/6134646/pexels-photo-6134646.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY[]::text[], ARRAY['Jaune'], 'unisex', 'all', true, false),

('Lot de peluches assorties', 'مجموعة دمى محشوة', 'Assortiment de petites peluches colorées, éveil des sens.',
  (SELECT id FROM categories WHERE name_fr = 'Jouets' LIMIT 1),
  600::numeric, 1300::numeric, 20, 5,
  ARRAY['https://images.pexels.com/photos/220137/pexels-photo-220137.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY[]::text[], ARRAY['Multicolore'], 'unisex', 'all', true, false),

('Ourson musical à suspendre', 'دب موسيقي للتعليق', 'Jouet musical à suspendre au berceau, mélodies douces pour l''endormissement.',
  (SELECT id FROM categories WHERE name_fr = 'Jouets' LIMIT 1),
  1100::numeric, 2400::numeric, 8, 4,
  ARRAY['https://images.pexels.com/photos/1166473/pexels-photo-1166473.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY[]::text[], ARRAY['Beige'], 'unisex', 'all', true, false),

-- Nutrition
('Biberon anti-colique 260ml', 'رضاعة مانعة للمغص 260 مل', 'Biberon sans BPA avec valve anti-colique, tétine débit lent.',
  (SELECT id FROM categories WHERE name_fr = 'Nutrition' LIMIT 1),
  900::numeric, 1900::numeric, 24, 6,
  ARRAY['https://images.pexels.com/photos/6624450/pexels-photo-6624450.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY[]::text[], ARRAY['Transparent'], 'unisex', 'all', true, true),

('Lot de 3 biberons + brosse', 'طقم 3 رضاعات وفرشاة', 'Set complet : 3 biberons de tailles différentes et brosse de nettoyage.',
  (SELECT id FROM categories WHERE name_fr = 'Nutrition' LIMIT 1),
  1800::numeric, 3600::numeric, 5, 4,
  ARRAY['https://images.pexels.com/photos/6182103/pexels-photo-6182103.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY[]::text[], ARRAY['Transparent'], 'unisex', 'all', true, false),

('Tire-lait manuel', 'مضخة حليب يدوية', 'Tire-lait manuel silencieux et confortable pour maman allaitante.',
  (SELECT id FROM categories WHERE name_fr = 'Nutrition' LIMIT 1),
  2200::numeric, 4200::numeric, 0, 3,
  ARRAY['https://images.pexels.com/photos/5593124/pexels-photo-5593124.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY[]::text[], ARRAY['Blanc'], 'unisex', 'all', true, false),

-- Hygiène & Soin
('Coffret soin bébé 5 pièces', 'طقم عناية بالرضيع 5 قطع', 'Coffret complet : shampoing, lotion, coton, brosse, ciseaux.',
  (SELECT id FROM categories WHERE name_fr = 'Hygiène & Soin' LIMIT 1),
  1500::numeric, 3200::numeric, 11, 4,
  ARRAY['https://images.pexels.com/photos/11369315/pexels-photo-11369315.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY[]::text[], ARRAY['Multicolore'], 'unisex', 'all', true, true),

('Serviette de bain à capuche', 'منشفة استحمام بقبعة', 'Serviette douce en coton avec capuche, motif animal.',
  (SELECT id FROM categories WHERE name_fr = 'Hygiène & Soin' LIMIT 1),
  850::numeric, 1800::numeric, 13, 5,
  ARRAY['https://images.pexels.com/photos/11369478/pexels-photo-11369478.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY[]::text[], ARRAY['Rose','Bleu'], 'unisex', 'all', true, false),

-- Chambre & Mobilier
('Tour de lit matelassé', 'حاجز سرير مبطن', 'Tour de lit rembourré, protège bébé des barreaux, coton doux.',
  (SELECT id FROM categories WHERE name_fr = 'Chambre & Mobilier' LIMIT 1),
  2000::numeric, 4200::numeric, 7, 3,
  ARRAY['https://images.pexels.com/photos/11369305/pexels-photo-11369305.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY[]::text[], ARRAY['Beige','Rose'], 'unisex', 'all', true, false),

('Veilleuse nuage LED', 'مصباح ليلي على شكل غيمة', 'Veilleuse douce en forme de nuage, lumière tamisée, USB rechargeable.',
  (SELECT id FROM categories WHERE name_fr = 'Chambre & Mobilier' LIMIT 1),
  1400::numeric, 2900::numeric, 9, 4,
  ARRAY['https://images.pexels.com/photos/11369383/pexels-photo-11369383.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY[]::text[], ARRAY['Blanc'], 'unisex', 'all', true, true),

-- Accessoires
('Bavoirs imperméables lot de 4', 'أطقم مرايل مقاومة للماء', 'Lot de 4 bavoirs en tissu enduit, faciles à nettoyer.',
  (SELECT id FROM categories WHERE name_fr = 'Accessoires' LIMIT 1),
  500::numeric, 1100::numeric, 30, 8,
  ARRAY['https://images.pexels.com/photos/11369384/pexels-photo-11369384.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY[]::text[], ARRAY['Multicolore'], 'unisex', 'all', true, false),

('Attache-sucette personnalisable', 'حامل اللهاية', 'Attache-tétine en tissu doux avec clip sécurisé.',
  (SELECT id FROM categories WHERE name_fr = 'Accessoires' LIMIT 1),
  350::numeric, 800::numeric, 18, 6,
  ARRAY['https://images.pexels.com/photos/11369386/pexels-photo-11369386.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY[]::text[], ARRAY['Bleu','Rose'], 'unisex', 'all', true, false)

) AS v(name_fr, name_ar, description_fr, category_id, purchase_price, selling_price, stock, stock_min, images, sizes, colors, gender, season, is_active, is_featured)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE products.name_fr = v.name_fr);
