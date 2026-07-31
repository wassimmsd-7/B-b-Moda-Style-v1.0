# Bèbè Moda Style — Guide Complet

## Vue d'ensemble

Votre application web complète pour boutique bébé (0-36 mois) a été construite avec les technologies suivantes :

- **Frontend** : React + TypeScript + Vite + Tailwind CSS
- **Backend/Base de données** : Supabase (PostgreSQL) — déjà configuré et connecté
- **Icônes** : Lucide React
- **Stockage** : Supabase (base de données + images)

L'application fonctionne en **4 langues** (Français, Arabe, Anglais, Darija algérienne) avec **mode sombre/clair** et est **entièrement responsive** (mobile, tablette, ordinateur).

---

## Les 4 grands axes de l'application

### 1. Côté Client (la boutique en ligne)

**Pages disponibles :**
- **Accueil** : Hero, catégories, produits en vedette, conseils d'experts
- **Boutique** : Catalogue complet avec filtres (catégorie, genre, saison, âge) et tri (prix, nouveautés)
- **Page produit** : Images, tailles, couleurs, quantité, ajout au panier, produits similaires
- **Panier** : Modification des quantités, suppression, sous-total
- **Checkout** : Formulaire de commande (nom, téléphone, wilaya, commune, adresse, type de livraison, paiement à la livraison COD)
- **Suivi de commande** : Recherche par numéro ou téléphone, timeline de statut
- **Conseils d'experts** : Articles sur la nutrition, santé, développement, vêtements, sécurité
- **Contact** : Formulaire + lien Google Maps de votre boutique

**Fonctionnalités client :**
- Recherche intelligente (nom, SKU, tags)
- Filtrage par âge, genre, saison, catégorie
- Paiement à la livraison (COD) favorisé
- Panier sauvegardé (localStorage)
- Suivi de commande en temps réel
- Changement de langue et thème persistant

### 2. Côté Propriétaire (Dashboard Admin)

Accessible via le bouton **Admin** dans le menu. Comptes de démonstration :
- `admin@bebemoda.dz` → Super Admin
- `owner@bebemoda.dz` → Propriétaire
- `caisse@bebemoda.dz` → Caissier

**Modules disponibles :**

1. **Tableau de bord** : Chiffre d'affaires du jour, nombre de commandes, ventes caisse, alertes stock, clients, commandes récentes

2. **Gestion des produits** : Ajouter, modifier, supprimer des produits avec :
   - Nom en 4 langues, SKU, code-barres
   - Prix d'achat et prix de vente, prix promo
   - Stock et seuil minimum
   - Catégorie, genre, saison, tranche d'âge
   - Tailles, couleurs, images (URLs)
   - Description, mise en vedette, statut actif

3. **Gestion des commandes** : Liste filtrable par statut, recherche par nom/téléphone/numéro, changement de statut (en attente → confirmée → en préparation → expédiée → livrée / annulée), détails complets avec articles

4. **Inventaire** : Vue des stocks faibles et ruptures, modification rapide du stock, filtres par statut

5. **Gestion des clients** : Liste avec historique (nombre de commandes, total dépensé, dernière commande)

6. **Gestion des fournisseurs** : Ajout/modification/suppression avec contacts, téléphone, email, adresse

7. **Promotions** : Création d'offres (pourcentage ou montant fixe, dates de début/fin, statut actif)

8. **Bons de commande** : Création de commandes fournisseur avec articles, quantités, prix, fournisseur

9. **Statistiques** : Chiffre d'affaires, ventes en ligne vs caisse, coût d'achat, bénéfice net, panier moyen — filtrable par période (jour, semaine, mois, année)

10. **Paramètres** : Nom du magasin, téléphone, email, adresse, réseaux sociaux, devise, seuil de stock bas

### 3. Côté Caisse (POS)

Accessible via le menu Admin → bouton **Caisse** ou via `#/pos`.

**Fonctionnalités :**
- Recherche et scan de produits (nom, SKU, code-barres)
- Filtre par catégorie
- Ajout rapide au panier
- Calcul automatique du sous-total et du coût d'achat
- **4 modes de paiement** : Espèces, Carte, Crédit (avec date limite), Mixte
- Paiement partiel avec calcul du rendu
- Impression du reçu
- Ventes du jour (total et nombre)
- Décrémentation automatique du stock après vente

### 4. Côté Super Admin

Le super admin a accès à tous les modules ci-dessus ainsi qu'aux paramètres globaux. La gestion des rôles se fait via la table `app_users` dans la base de données.

---

## Base de données (Supabase)

Toutes les tables suivantes ont été créées avec la sécurité RLS activée :

| Table | Description |
|-------|-------------|
| `app_users` | Comptes staff (superadmin, owner, cashier) |
| `categories` | Catégories de produits (8 catégories pré-remplies) |
| `products` | Catalogue produits complet |
| `suppliers` | Fournisseurs |
| `clients` | Clients avec historique |
| `delivery_zones` | Zones de livraison (10 wilayas pré-remplies) |
| `orders` | Commandes en ligne |
| `order_items` | Lignes de commande |
| `cash_sales` | Ventes caisse (POS) |
| `cash_sale_items` | Lignes de vente caisse |
| `purchase_orders` | Bons de commande fournisseurs |
| `purchase_order_items` | Lignes de bon de commande |
| `promotions` | Offres et réductions |
| `expert_tips` | Conseils d'experts (6 pré-remplis) |
| `settings` | Paramètres globaux |

---

## Comment utiliser l'application

### Démarrage
Le serveur de développement démarre automatiquement. Ouvrez l'URL fournie dans votre navigateur.

### Navigation
- **Boutique** : Cliquez sur "Boutique" ou l'image d'accueil
- **Admin** : Cliquez sur "Admin" en haut à droite
- **Caisse** : Depuis l'admin, cliquez sur "Caisse" dans le menu latéral
- **Langue** : Cliquez sur l'icône globe 🌐 pour changer de langue
- **Thème** : Cliquez sur l'icône lune/soleil pour basculer le mode sombre/clair

### Ajouter des produits
1. Allez dans Admin → Produits → bouton "+ Ajouter"
2. Remplissez le formulaire (nom, prix, stock, catégorie, images, etc.)
3. Cliquez "Enregistrer"

### Gérer les commandes
1. Allez dans Admin → Commandes
2. Filtrez par statut si besoin
3. Cliquez sur "Modifier" pour voir les détails et changer le statut

### Faire une vente caisse
1. Allez dans Admin → Caisse (ou `#/pos`)
2. Recherchez/scannez un produit, cliquez pour l'ajouter au panier
3. Cliquez "Payer", choisissez le mode de paiement
4. Confirmez et imprimez le reçu

---

## Suggestions et recommandations

### Ce qui est déjà inclus
- ✅ Design moderne, premium et responsive
- ✅ 4 langues avec support RTL (arabe)
- ✅ Mode sombre/clair
- ✅ Base de données complète avec sécurité RLS
- ✅ Gestion complète des produits, commandes, stock
- ✅ Caisse (POS) avec multiples modes de paiement
- ✅ Suivi de commande pour les clients
- ✅ Conseils d'experts pour les parents
- ✅ Statistiques et tableau de bord
- ✅ Gestion des fournisseurs et bons de commande
- ✅ Promotions et offres

### Améliorations futures recommandées
1. **Upload d'images** : Connecter Supabase Storage pour uploader des photos de produits directement
2. **Authentification réelle** : Activer l'auth Supabase pour sécuriser l'accès admin
3. **Notifications** : Email/SMS automatique aux clients quand le statut change
4. **Code-barres scanner** : Utiliser la caméra du téléphone pour scanner
5. **Application mobile** : PWA (Progressive Web App) installable
6. **Paiement en ligne** : Intégrer Stripe ou CIB pour paiement par carte
7. **Multi-boutique** : Gérer plusieurs boutiques physiques
8. **Facturation** : Génération de factures PDF
9. **Stock prévisionnel** : Alertes automatiques quand le stock atteint un seuil
10. **Programme de fidélité** : Points pour les clients réguliers

---

## Commandes utiles

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement (déjà actif)
npm run dev

# Construire pour la production
npm run build

# Vérifier les types TypeScript
npm run typecheck

# Lancer le linter
npm run lint
```

---

## Architecture technique

```
src/
├── components/          # Composants réutilisables
│   ├── Layout.tsx       # Header + Footer
│   └── ProductCard.tsx  # Carte produit
├── context/
│   └── AppContext.tsx   # Contexte global (langue, thème, panier)
├── lib/
│   ├── i18n.ts          # Traductions 4 langues
│   ├── router.ts        # Routeur custom
│   ├── supabase.ts      # Client Supabase
│   ├── types.ts         # Types TypeScript
│   └── utils.ts         # Utilitaires (formatage, etc.)
├── pages/
│   ├── HomePage.tsx     # Accueil
│   ├── ShopPage.tsx     # Boutique
│   ├── ProductPage.tsx  # Détail produit
│   ├── CartPage.tsx     # Panier
│   ├── CheckoutPage.tsx # Commande
│   ├── OrderSuccessPage.tsx
│   ├── TrackOrderPage.tsx
│   ├── TipsPage.tsx     # Conseils
│   ├── ContactPage.tsx
│   ├── AdminPage.tsx    # Dashboard propriétaire
│   └── PosPage.tsx      # Caisse
├── App.tsx              # Point d'entrée
└── main.tsx             # Bootstrap
```

---

## Données pré-remplies

- **8 catégories** : Vêtements, Chaussures, Jouets, Accessoires, Hygiène, Nutrition, Chambre, Poussettes
- **10 wilayas** : Alger, Oran, Béjaïa, Constantine, Blida, Boumerdès, Annaba, Batna, Tlemcen, Sétif
- **6 conseils d'experts** : Tailles, matières, sommeil, nutrition, stimulation, peau
- **Paramètres magasin** : Configurés avec les valeurs par défaut

Pour ajouter votre logo et vos informations, allez dans Admin → Paramètres.
