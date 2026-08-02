import type { Lang } from './types';

export interface Translations {
  [key: string]: { fr: string; ar: string; en: string; dz: string };
}

export const t: Translations = {
  // Navigation
  home: { fr: 'Accueil', ar: 'الرئيسية', en: 'Home', dz: 'Dar' },
  shop: { fr: 'Boutique', ar: 'المتجر', en: 'Shop', dz: 'Lboutique' },
  cart: { fr: 'Panier', ar: 'السلة', en: 'Cart', dz: 'Panier' },
  orders: { fr: 'Commandes', ar: 'الطلبات', en: 'Orders', dz: 'Commandes' },
  tips: { fr: 'Conseils', ar: 'نصائح', en: 'Tips', dz: 'Nasaïh' },
  contact: { fr: 'Contact', ar: 'اتصل بنا', en: 'Contact', dz: 'Contact' },
  admin: { fr: 'Admin', ar: 'الإدارة', en: 'Admin', dz: 'Admin' },
  pos: { fr: 'Caisse', ar: 'الصندوق', en: 'POS', dz: 'Caisse' },

  // Hero
  heroTitle: { fr: 'Bèbè Moda Style', ar: 'بيبي مودا ستايل', en: 'Bèbè Moda Style', dz: 'Bèbè Moda Style' },
  heroSubtitle: {
    fr: 'Tout pour votre bébé, de 0 à 36 mois et plus',
    ar: 'كل ما يحتاجه طفلك من 0 إلى 36 شهراً وأكثر',
    en: 'Everything for your baby, 0 to 36 months and beyond',
    dz: 'Koulchi l bébek, men 0 l 36 chher w zid',
  },
  heroCta: { fr: 'Découvrir la boutique', ar: 'اكتشف المتجر', en: 'Browse shop', dz: 'Chouf lboutique' },

  // Categories
  categories: { fr: 'Catégories', ar: 'الفئات', en: 'Categories', dz: 'Catégories' },
  allCategories: { fr: 'Toutes les catégories', ar: 'كل الفئات', en: 'All categories', dz: 'Koul les catégories' },

  // Product
  addToCart: { fr: 'Ajouter au panier', ar: 'أضف إلى السلة', en: 'Add to cart', dz: 'Zidou l panier' },
  outOfStock: { fr: 'Rupture de stock', ar: 'نفد المخزون', en: 'Out of stock', dz: 'Sali men stock' },
  lowStock: { fr: 'Bientôt épuisé', ar: 'على وشك النفاد', en: 'Low stock', dz: 'Krib ykhalas' },
  inStock: { fr: 'En stock', ar: 'متوفر', en: 'In stock', dz: 'F stock' },
  viewProduct: { fr: 'Voir le produit', ar: 'عرض المنتج', en: 'View product', dz: 'Chouf el produit' },
  featured: { fr: 'En vedette', ar: 'مميز', en: 'Featured', dz: 'Mymez' },
  promo: { fr: 'Promo', ar: 'تخفيض', en: 'Sale', dz: 'Promo' },
  new: { fr: 'Nouveau', ar: 'جديد', en: 'New', dz: 'Jdid' },

  // Filters
  filter: { fr: 'Filtrer', ar: 'تصفية', en: 'Filter', dz: 'Filter' },
  sortBy: { fr: 'Trier par', ar: 'ترتيب حسب', en: 'Sort by', dz: 'Trier' },
  priceLowHigh: { fr: 'Prix croissant', ar: 'السعر تصاعدي', en: 'Price low to high', dz: "Prix men l'ogla l l'oula" },
  priceHighLow: { fr: 'Prix décroissant', ar: 'السعر تنازلي', en: 'Price high to low', dz: "Prix men l'oula l l'ogla" },
  newest: { fr: 'Plus récents', ar: 'الأحدث', en: 'Newest', dz: "L'ajdad" },
  search: { fr: 'Rechercher...', ar: 'بحث...', en: 'Search...', dz: 'Qelleb...' },
  searchPlaceholder: { fr: 'Rechercher un produit...', ar: 'ابحث عن منتج...', en: 'Search products...', dz: 'Qelleb 3la produit...' },
  ageRange: { fr: 'Âge (mois)', ar: 'العمر (شهر)', en: 'Age (months)', dz: "L'3mer (chher)" },
  gender: { fr: 'Genre', ar: 'الجنس', en: 'Gender', dz: 'Jins' },
  boy: { fr: 'Garçon', ar: 'ولد', en: 'Boy', dz: 'Weld' },
  girl: { fr: 'Fille', ar: 'بنت', en: 'Girl', dz: 'Bent' },
  unisex: { fr: 'Mixte', ar: 'مختلط', en: 'Unisex', dz: 'Mixte' },
  season: { fr: 'Saison', ar: 'موسم', en: 'Season', dz: 'Mawsim' },
  spring: { fr: 'Printemps', ar: 'ربيع', en: 'Spring', dz: 'Rbi3' },
  summer: { fr: 'Été', ar: 'صيف', en: 'Summer', dz: 'Stef' },
  autumn: { fr: 'Automne', ar: 'خريف', en: 'Autumn', dz: 'Khrif' },
  winter: { fr: 'Hiver', ar: 'شتاء', en: 'Winter', dz: 'Chta' },
  allSeasons: { fr: 'Toutes saisons', ar: 'كل المواسم', en: 'All seasons', dz: 'Koul les mawasim' },
  clearFilters: { fr: 'Effacer les filtres', ar: 'مسح الفلاتر', en: 'Clear filters', dz: 'Mahi les filtres' },
  noResults: { fr: 'Aucun produit trouvé', ar: 'لا توجد منتجات', en: 'No products found', dz: 'Ma l9ina hata produit' },
  results: { fr: 'résultats', ar: 'نتائج', en: 'results', dz: 'natayej' },

  // Cart
  yourCart: { fr: 'Votre panier', ar: 'سلتك', en: 'Your cart', dz: 'Panier ta3k' },
  emptyCart: { fr: 'Votre panier est vide', ar: 'سلتك فارغة', en: 'Your cart is empty', dz: 'El panier ta3k fadi' },
  continueShopping: { fr: 'Continuer mes achats', ar: 'متابعة التسوق', en: 'Continue shopping', dz: 'Kemmel l shopping' },
  subtotal: { fr: 'Sous-total', ar: 'المجموع الفرعي', en: 'Subtotal', dz: 'Sous-total' },
  delivery: { fr: 'Livraison', ar: 'التوصيل', en: 'Delivery', dz: 'Livraison' },
  total: { fr: 'Total', ar: 'المجموع', en: 'Total', dz: 'Total' },
  checkout: { fr: 'Commander', ar: 'اطلب', en: 'Checkout', dz: 'Commander' },
  remove: { fr: 'Retirer', ar: 'إزالة', en: 'Remove', dz: 'Hayd' },
  quantity: { fr: 'Quantité', ar: 'الكمية', en: 'Quantity', dz: 'Kemiya' },
  size: { fr: 'Taille', ar: 'المقاس', en: 'Size', dz: 'Taille' },
  color: { fr: 'Couleur', ar: 'اللون', en: 'Color', dz: 'Loun' },

  // Checkout
  checkoutTitle: { fr: 'Finaliser la commande', ar: 'إتمام الطلب', en: 'Checkout', dz: 'Kemmel la commande' },
  fullName: { fr: 'Nom complet', ar: 'الاسم الكامل', en: 'Full name', dz: 'Esm kamel' },
  phone: { fr: 'Téléphone', ar: 'الهاتف', en: 'Phone', dz: 'Tilifoun' },
  phone2: { fr: 'Téléphone 2 (optionnel)', ar: 'الهاتف 2 (اختياري)', en: 'Phone 2 (optional)', dz: 'Tilifoun 2 (khtiyari)' },
  wilaya: { fr: 'Wilaya', ar: 'الولاية', en: 'Wilaya', dz: 'Wilaya' },
  commune: { fr: 'Commune', ar: 'البلدية', en: 'Commune', dz: 'Baladiya' },
  address: { fr: 'Adresse', ar: 'العنوان', en: 'Address', dz: '3onwan' },
  deliveryType: { fr: 'Type de livraison', ar: 'نوع التوصيل', en: 'Delivery type', dz: 'No3 ta3 livraison' },
  homeDelivery: { fr: 'À domicile', ar: 'إلى المنزل', en: 'Home delivery', dz: 'Livraison ldar' },
  deskDelivery: { fr: 'Au bureau', ar: 'في المكتب', en: 'Desk delivery', dz: 'Livraison lbureau' },
  pickup: { fr: 'Retrait en boutique', ar: 'الاستلام في المتجر', en: 'Store pickup', dz: 'Twa5ed men lboutique' },
  paymentMethod: { fr: 'Mode de paiement', ar: 'طريقة الدفع', en: 'Payment method', dz: 'Tariqat lkhalas' },
  cod: { fr: 'Paiement à la livraison', ar: 'الدفع عند الاستلام', en: 'Cash on delivery', dz: 'Tkheles ki twssel' },
  notes: { fr: 'Notes (optionnel)', ar: 'ملاحظات (اختياري)', en: 'Notes (optional)', dz: 'Moulahadhat (khtiyari)' },
  placeOrder: { fr: 'Confirmer la commande', ar: 'تأكيد الطلب', en: 'Place order', dz: 'Confirme la commande' },
  orderSuccess: { fr: 'Commande passée avec succès!', ar: 'تم الطلب بنجاح!', en: 'Order placed successfully!', dz: 'Lcommande n9at b nnejah!' },
  orderSuccessMsg: { fr: 'Nous vous contacterons bientôt pour confirmer.', ar: 'سنتصل بك قريباً للتأكيد.', en: 'We will contact you shortly to confirm.', dz: 'Hna ncontactiwk krib bech nconfirmiw.' },
  orderNumber: { fr: 'Numéro de commande', ar: 'رقم الطلب', en: 'Order number', dz: 'Raqm commande' },

  // Order tracking
  trackOrder: { fr: 'Suivre ma commande', ar: 'تتبع طلبي', en: 'Track my order', dz: 'Tabi3 commande ta3i' },
  trackOrderBothRequired: { fr: 'Entrez le numéro de commande ET le téléphone utilisé lors de la commande.', ar: 'أدخل رقم الطلب ورقم الهاتف المستخدم عند الطلب.', en: 'Enter both the order number and the phone used when ordering.', dz: 'Dkhel raqam commande w telephone li khdemti bih.' },
  orderStatus: { fr: 'Statut', ar: 'الحالة', en: 'Status', dz: 'Halat' },
  pending: { fr: 'En attente', ar: 'في الانتظار', en: 'Pending', dz: "Fi l'intidar" },
  confirmed: { fr: 'Confirmée', ar: 'مؤكدة', en: 'Confirmed', dz: 'Mou2akkada' },
  processing: { fr: 'En préparation', ar: 'قيد التحضير', en: 'Processing', dz: 'Fi tahdir' },
  shipped: { fr: 'Expédiée', ar: 'تم الشحن', en: 'Shipped', dz: 'Twa3' },
  delivered: { fr: 'Livrée', ar: 'تم التوصيل', en: 'Delivered', dz: 'Twaslat' },
  cancelled: { fr: 'Annulée', ar: 'ملغاة', en: 'Cancelled', dz: 'Mlgha' },
  returned: { fr: 'Retournée', ar: 'مرتجعة', en: 'Returned', dz: 'Trja3' },
  myOrders: { fr: 'Mes commandes', ar: 'طلباتي', en: 'My orders', dz: 'Commandes ta3i' },
  orderDate: { fr: 'Date', ar: 'التاريخ', en: 'Date', dz: 'Tarikh' },
  orderTotal: { fr: 'Montant', ar: 'المبلغ', en: 'Amount', dz: 'Mablagh' },

  // Tips
  expertTips: { fr: 'Conseils d\'experts', ar: 'نصائح الخبراء', en: 'Expert tips', dz: "Nasaïh d'khabirin" },
  tipsSubtitle: {
    fr: 'Nos conseils pour prendre soin de votre bébé',
    ar: 'نصائحنا للعناية بطفلك',
    en: 'Our tips to care for your baby',
    dz: 'Nasaïh ta3na bech na3neyo b bébek',
  },

  // Admin
  dashboard: { fr: 'Tableau de bord', ar: 'لوحة التحكم', en: 'Dashboard', dz: 'Lawhat lqada' },
  products: { fr: 'Produits', ar: 'المنتجات', en: 'Products', dz: 'Muntajat' },
  inventory: { fr: 'Inventaire', ar: 'المخزون', en: 'Inventory', dz: 'Lstock' },
  clients: { fr: 'Clients', ar: 'العملاء', en: 'Clients', dz: 'Klayan' },
  suppliers: { fr: 'Fournisseurs', ar: 'الموردون', en: 'Suppliers', dz: 'Mwarridin' },
  promotions: { fr: 'Promotions', ar: 'العروض', en: 'Promotions', dz: 'Promotions' },
  analytics: { fr: 'Statistiques', ar: 'الإحصائيات', en: 'Analytics', dz: 'Ihsa2iyat' },
  settings: { fr: 'Paramètres', ar: 'الإعدادات', en: 'Settings', dz: 'I3dadat' },
  purchaseOrders: { fr: 'Bons de commande', ar: 'أوامر الشراء', en: 'Purchase orders', dz: 'Bons de commande' },

  // CRUD
  add: { fr: 'Ajouter', ar: 'إضافة', en: 'Add', dz: 'Zid' },
  edit: { fr: 'Modifier', ar: 'تعديل', en: 'Edit', dz: 'Modifi' },
  delete: { fr: 'Supprimer', ar: 'حذف', en: 'Delete', dz: 'Sopp' },
  save: { fr: 'Enregistrer', ar: 'حفظ', en: 'Save', dz: 'Sajjel' },
  cancel: { fr: 'Annuler', ar: 'إلغاء', en: 'Cancel', dz: 'Annuli' },
  confirm: { fr: 'Confirmer', ar: 'تأكيد', en: 'Confirm', dz: 'Mou2akked' },
  search2: { fr: 'Rechercher', ar: 'بحث', en: 'Search', dz: 'Qelleb' },
  actions: { fr: 'Actions', ar: 'إجراءات', en: 'Actions', dz: 'Ijra2at' },
  name: { fr: 'Nom', ar: 'الاسم', en: 'Name', dz: 'Esm' },
  price: { fr: 'Prix', ar: 'السعر', en: 'Price', dz: 'S3r' },
  stock: { fr: 'Stock', ar: 'المخزون', en: 'Stock', dz: 'Stock' },
  category: { fr: 'Catégorie', ar: 'الفئة', en: 'Category', dz: 'Catégorie' },
  status: { fr: 'Statut', ar: 'الحالة', en: 'Status', dz: 'Halat' },
  date: { fr: 'Date', ar: 'التاريخ', en: 'Date', dz: 'Tarikh' },
  total2: { fr: 'Total', ar: 'المجموع', en: 'Total', dz: 'Total' },
  active: { fr: 'Actif', ar: 'نشط', en: 'Active', dz: 'Na6i' },
  inactive: { fr: 'Inactif', ar: 'غير نشط', en: 'Inactive', dz: 'Machi na6i' },
  yes: { fr: 'Oui', ar: 'نعم', en: 'Yes', dz: 'Iyeh' },
  no: { fr: 'Non', ar: 'لا', en: 'No', dz: 'Le' },
  loading: { fr: 'Chargement...', ar: 'جار التحميل...', en: 'Loading...', dz: 'Tsel...' },
  noData: { fr: 'Aucune donnée', ar: 'لا توجد بيانات', en: 'No data', dz: 'Ma kayan hata data' },
  back: { fr: 'Retour', ar: 'رجوع', en: 'Back', dz: 'Rja3' },

  // POS
  posTitle: { fr: 'Caisse', ar: 'الصندوق', en: 'Cash Register', dz: 'Caisse' },
  scanOrSearch: { fr: 'Scanner ou rechercher un produit...', ar: 'امسح أو ابحث عن منتج...', en: 'Scan or search product...', dz: 'Scanner wla qelleb 3la produit...' },
  cart2: { fr: 'Panier', ar: 'السلة', en: 'Cart', dz: 'Panier' },
  pay: { fr: 'Payer', ar: 'دفع', en: 'Pay', dz: 'Kheles' },
  cash: { fr: 'Espèces', ar: 'نقداً', en: 'Cash', dz: 'Cach' },
  card: { fr: 'Carte', ar: 'بطاقة', en: 'Card', dz: 'Carte' },
  credit: { fr: 'Crédit', ar: 'ائتمان', en: 'Credit', dz: 'Credit' },
  partial: { fr: 'Partiel', ar: 'جزئي', en: 'Partial', dz: 'Joz2i' },
  amountPaid: { fr: 'Montant payé', ar: 'المبلغ المدفوع', en: 'Amount paid', dz: 'Mablagh mkheles' },
  change: { fr: 'Rendu', ar: 'الباقي', en: 'Change', dz: 'Rendu' },
  printReceipt: { fr: 'Imprimer le reçu', ar: 'طباعة الإيصال', en: 'Print receipt', dz: 'Tabi3 lreçu' },
  newSale: { fr: 'Nouvelle vente', ar: 'بيع جديد', en: 'New sale', dz: 'Vente jdida' },
  todaySales: { fr: 'Ventes du jour', ar: 'مبيعات اليوم', en: 'Today\'s sales', dz: 'Vente dyal lyoum' },
  returnSale: { fr: 'Retour/Annuler vente', ar: 'إرجاع/إلغاء البيع', en: 'Return/Cancel sale', dz: 'Rja3/Annuli vente' },
  cancelSale: { fr: 'Annuler la vente', ar: 'إلغاء البيع', en: 'Cancel sale', dz: 'Annuli vente' },
  modifySale: { fr: 'Modifier la vente', ar: 'تعديل البيع', en: 'Modify sale', dz: 'Modifi vente' },
  creditDeadline: { fr: 'Date limite de paiement', ar: 'تاريخ limite الدفع', en: 'Payment deadline', dz: 'Tarikh limite ta3 lkhalas' },
  saleHistory: { fr: 'Historique des ventes', ar: 'سجل المبيعات', en: 'Sale history', dz: 'Tarikh vente' },
  selectSale: { fr: 'Sélectionner une vente', ar: 'اختر عملية بيع', en: 'Select a sale', dz: 'Ekhtar vente' },

  // Analytics
  revenue: { fr: 'Chiffre d\'affaires', ar: 'رقم المعاملات', en: 'Revenue', dz: "Chiffre d'affaires" },
  profit: { fr: 'Bénéfice net', ar: 'صافي الربح', en: 'Net profit', dz: 'Rib net' },
  onlineSales: { fr: 'Commandes en ligne', ar: 'طلبات أونلاين', en: 'Online orders', dz: 'Commandes en ligne' },
  posSales: { fr: 'Ventes caisse', ar: 'مبيعات الصندوق', en: 'POS sales', dz: 'Vente dyal caisse' },
  totalOrders: { fr: 'Total commandes', ar: 'إجمالي الطلبات', en: 'Total orders', dz: 'Total commandes' },
  avgOrder: { fr: 'Panier moyen', ar: 'متوسط الطلب', en: 'Avg. order', dz: 'Panier moyen' },
  purchaseCost: { fr: 'Coût d\'achat', ar: 'تكلفة الشراء', en: 'Purchase cost', dz: 'Kelfat lchra' },
  expenses: { fr: 'Frais & charges', ar: 'المصاريف والأعباء', en: 'Expenses', dz: 'Masarif w takalif' },

  // Footer
  aboutUs: { fr: 'À propos', ar: 'من نحن', en: 'About us', dz: '3la 7sab' },
  followUs: { fr: 'Suivez-nous', ar: 'تابعنا', en: 'Follow us', dz: 'Tabe3na' },
  allRights: { fr: 'Tous droits réservés', ar: 'جميع الحقوق محفوظة', en: 'All rights reserved', dz: 'Koul l7oouq mahfouda' },

  // Misc
  darkMode: { fr: 'Mode sombre', ar: 'الوضع الداكن', en: 'Dark mode', dz: 'Mode gmeq' },
  lightMode: { fr: 'Mode clair', ar: 'الوضع الفاتح', en: 'Light mode', dz: 'Mode mchi' },
  language: { fr: 'Langue', ar: 'اللغة', en: 'Language', dz: 'Lugha' },
  selectWilaya: { fr: 'Sélectionner une wilaya', ar: 'اختر ولاية', en: 'Select wilaya', dz: 'Ekhtar wilaya' },
  freeShipping: { fr: 'Livraison disponible 58 wilaya', ar: 'توصيل 58 ولاية', en: 'Delivery to 58 wilayas', dz: 'Livraison f 58 wilaya' },
  codAvailable: { fr: 'Paiement à la livraison disponible', ar: 'الدفع عند الاستلام متاح', en: 'Cash on delivery available', dz: 'Tkheles ki twssel mawjoud' },
  qualityGuarantee: { fr: 'Qualité garantie', ar: 'جودة مضمونة', en: 'Quality guaranteed', dz: 'Jawda mdamouna' },

  // Notifications
  newOrder: { fr: 'Nouvelle commande', ar: 'طلب جديد', en: 'New order', dz: 'Commande jdida' },
  newSaleNotif: { fr: 'Nouvelle vente', ar: 'بيع جديد', en: 'New sale', dz: 'Vente jdida' },
  lowStockAlert: { fr: 'Stock faible', ar: 'مخزون منخفض', en: 'Low stock', dz: 'Stock 9lil' },
  outOfStockAlert: { fr: 'Rupture de stock', ar: 'نفاد المخزون', en: 'Out of stock', dz: 'Sali stock' },
  notifications: { fr: 'Notifications', ar: 'إشعارات', en: 'Notifications', dz: 'Icha3rat' },
  markAllRead: { fr: 'Tout marquer comme lu', ar: 'تحديد الكل كمقروء', en: 'Mark all as read', dz: 'Kaml m9ra' },
  noNotifications: { fr: 'Aucune notification', ar: 'لا توجد إشعارات', en: 'No notifications', dz: 'Ma kayan hata ichaar' },
  viewAll: { fr: 'Voir tout', ar: 'عرض الكل', en: 'View all', dz: 'Chouf koulchi' },
  whatsapp: { fr: 'WhatsApp', ar: 'واتساب', en: 'WhatsApp', dz: 'WhatsApp' },
  callUs: { fr: 'Appelez-nous', ar: 'اتصل بنا', en: 'Call us', dz: '3ayetlina' },
  productAdded: { fr: 'Produit ajouté au panier', ar: 'تمت إضافة المنتج للسلة', en: 'Product added to cart', dz: 'Produit tzad l panier' },
  saleCancelled: { fr: 'Vente annulée', ar: 'تم إلغاء البيع', en: 'Sale cancelled', dz: 'Vente mmlgha' },
  saleModified: { fr: 'Vente modifiée', ar: 'تم تعديل البيع', en: 'Sale modified', dz: 'Vente mmodifia' },
  directBuy: { fr: 'Achat direct', ar: 'شراء مباشر', en: 'Direct buy', dz: 'Chra mobacher' },

  // Expenses
  expenses2: { fr: 'Frais & Charges', ar: 'المصاريف والأعباء', en: 'Expenses', dz: 'Masarif w takalif' },
  addExpense: { fr: 'Ajouter une dépense', ar: 'إضافة مصروف', en: 'Add expense', dz: 'Zid masrouf' },
  expenseType: { fr: 'Type de dépense', ar: 'نوع المصروف', en: 'Expense type', dz: 'No3 masrouf' },
  personnel: { fr: 'Personnel', ar: 'موظفون', en: 'Personnel', dz: 'Personnel' },
  salary: { fr: 'Salaire', ar: 'راتب', en: 'Salary', dz: 'Salaire' },
  rent: { fr: 'Loyer', ar: 'إيجار', en: 'Rent', dz: 'Loyer' },
  utility: { fr: 'Factures', ar: 'فواتير', en: 'Utilities', dz: 'Factures' },
  supplies: { fr: 'Fournitures', ar: 'مستلزمات', en: 'Supplies', dz: 'Fournitures' },
  marketing: { fr: 'Marketing', ar: 'تسويق', en: 'Marketing', dz: 'Marketing' },
  transport: { fr: 'Transport', ar: 'نقل', en: 'Transport', dz: 'Transport' },
  tax: { fr: 'Impôts', ar: 'ضرائب', en: 'Taxes', dz: 'Daraïb' },
  other: { fr: 'Autre', ar: 'آخر', en: 'Other', dz: 'Autre' },
  totalExpenses: { fr: 'Total dépenses', ar: 'إجمالي المصاريف', en: 'Total expenses', dz: 'Total masarif' },
  netProfit: { fr: 'Bénéfice net', ar: 'صافي الربح', en: 'Net profit', dz: 'Rib net' },

  // Reorder list
  reorderList: { fr: 'À commander', ar: 'للطلب', en: 'To reorder', dz: 'Lezim tcommandi' },
  reorderSubtitle: { fr: 'Produits à réapprovisionner', ar: 'منتجات لإعادة التموين', en: 'Products to restock', dz: 'Produits lezim t3awd t3ammerhom' },
  outOfStockProducts: { fr: 'Rupture de stock', ar: 'نفاد المخزون', en: 'Out of stock', dz: 'Sali men stock' },
  lowStockProducts: { fr: 'Stock faible', ar: 'مخزون منخفض', en: 'Low stock', dz: 'Stock 9lil' },
  seasonalProducts: { fr: 'Produits saisonniers', ar: 'منتجات موسمية', en: 'Seasonal products', dz: 'Produits mawasmiya' },
  suggestedQty: { fr: 'Qté suggérée', ar: 'كمية مقترحة', en: 'Suggested qty', dz: 'Kemiya mo9tara7a' },
  createPO: { fr: 'Créer bon de commande', ar: 'إنشاء أمر شراء', en: 'Create purchase order', dz: 'Cree bon de commande' },
  deliveryZonesTab: { fr: 'Zones de livraison', ar: 'مناطق التوصيل', en: 'Delivery zones', dz: 'Zones ta3 livraison' },
  expertTipsTab: { fr: 'Conseils experts', ar: 'نصائح الخبراء', en: 'Expert tips', dz: 'Nsayeh' },
  staffTab: { fr: 'Personnel', ar: 'الموظفون', en: 'Staff', dz: 'Personnel' },

  // Import
  importData: { fr: 'Importer', ar: 'استيراد', en: 'Import', dz: 'Importi' },
  importProducts: { fr: 'Importer produits', ar: 'استيراد منتجات', en: 'Import products', dz: 'Importi produits' },
  importSuppliers: { fr: 'Importer fournisseurs', ar: 'استيراد موردين', en: 'Import suppliers', dz: 'Importi mwarridin' },
  importOrders: { fr: 'Importer commandes', ar: 'استيراد طلبات', en: 'Import orders', dz: 'Importi commandes' },
  exportData: { fr: 'Exporter', ar: 'تصدير', en: 'Export', dz: 'Exporti' },
  csvJsonFormat: { fr: 'Format CSV ou JSON', ar: 'صيغة CSV أو JSON', en: 'CSV or JSON format', dz: 'Format CSV wla JSON' },
  dragDropFile: { fr: 'Glissez votre fichier ici', ar: 'اسحب ملفك هنا', en: 'Drag your file here', dz: 'S7eb fichier ta3k hna' },

  // Payment methods extended
  edahabiya: { fr: 'Edahabiya', ar: 'الذهبية', en: 'Edahabiya', dz: 'Edahabiya' },
  fullPayment: { fr: 'Paiement total', ar: 'دفع كامل', en: 'Full payment', dz: 'Khalas kamel' },
  depositPayment: { fr: 'Versement + reste à terme', ar: 'دفعة + الباقي لاحقاً', en: 'Deposit + balance later', dz: 'Versement + lb9i ba3d' },
  creditPayment: { fr: 'Achat à crédit', ar: 'شراء بالدين', en: 'Credit purchase', dz: 'Chra b dyn' },
  remainingAmount: { fr: 'Reste à payer', ar: 'الباقي للدفع', en: 'Remaining amount', dz: 'B9a lezim tkheles' },
  depositAmount: { fr: 'Montant du versement', ar: 'مبلغ الدفعة', en: 'Deposit amount', dz: 'Mablagh versement' },
};

export function tr(key: string, lang: Lang): string {
  const entry = t[key];
  if (!entry) return key;
  return entry[lang] || entry.fr || key;
}
