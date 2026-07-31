export type Lang = 'fr' | 'ar' | 'en' | 'dz';
export type Role = 'superadmin' | 'owner' | 'cashier';
export type Theme = 'light' | 'dark';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  lang: Lang;
  active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name_fr: string;
  name_ar: string | null;
  name_en: string | null;
  name_dz: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  active: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  phone2: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string;
  notes: string | null;
  active: boolean;
}

export interface Product {
  id: string;
  sku: string | null;
  barcode: string | null;
  name_fr: string;
  name_ar: string | null;
  name_en: string | null;
  name_dz: string | null;
  description_fr: string | null;
  description_ar: string | null;
  description_en: string | null;
  category_id: string | null;
  supplier_id: string | null;
  age_min_months: number;
  age_max_months: number;
  gender: 'boy' | 'girl' | 'unisex';
  purchase_price: number;
  selling_price: number;
  promo_price: number | null;
  promo_end_date: string | null;
  stock: number;
  stock_min: number;
  images: string[];
  sizes: string[];
  colors: string[];
  season: string;
  is_featured: boolean;
  is_active: boolean;
  is_seasonal: boolean;
  weight_grams: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string | null;
  phone2: string | null;
  email: string | null;
  wilaya: string | null;
  commune: string | null;
  address: string | null;
  notes: string | null;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  created_at: string;
}

export interface DeliveryZone {
  id: string;
  wilaya_code: string;
  wilaya_name: string;
  home_price: number;
  desk_price: number;
  days_min: number;
  days_max: number;
  active: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface Order {
  id: string;
  order_number: string;
  client_id: string | null;
  client_name: string;
  client_phone: string;
  client_phone2: string | null;
  client_wilaya: string | null;
  client_commune: string | null;
  client_address: string | null;
  delivery_zone_id: string | null;
  delivery_type: 'home' | 'desk' | 'pickup';
  delivery_price: number;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: 'cod' | 'ccp' | 'virement' | 'autre';
  status: OrderStatus;
  notes: string | null;
  delivery_tracking: string | null;
  delivery_company: string | null;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CashSale {
  id: string;
  sale_number: string;
  cashier_id: string | null;
  cashier_name: string | null;
  client_id: string | null;
  client_name: string | null;
  subtotal: number;
  discount: number;
  total: number;
  amount_paid: number;
  amount_due: number;
  credit_deadline: string | null;
  payment_method: 'cash' | 'ccp' | 'card' | 'credit' | 'mixed';
  status: 'completed' | 'partial' | 'credit' | 'cancelled' | 'returned';
  notes: string | null;
  return_reason: string | null;
  created_at: string;
}

export interface CashSaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  barcode: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  purchase_price: number;
  discount_amount: number;
  total_price: number;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string | null;
  supplier_name: string | null;
  status: 'draft' | 'sent' | 'received' | 'cancelled';
  total_amount: number;
  notes: string | null;
  expected_date: string | null;
  received_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  name_fr: string;
  name_ar: string | null;
  name_en: string | null;
  name_dz: string | null;
  description_fr: string | null;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  applies_to: 'all' | 'category' | 'product';
  category_id: string | null;
  product_id: string | null;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
}

export interface ExpertTip {
  id: string;
  title_fr: string;
  title_ar: string | null;
  title_en: string | null;
  content_fr: string | null;
  content_ar: string | null;
  content_en: string | null;
  category: string;
  age_min_months: number;
  age_max_months: number;
  icon: string | null;
  active: boolean;
}

export interface Expense {
  id: string;
  type: 'personnel' | 'salary' | 'rent' | 'utility' | 'supplies' | 'marketing' | 'transport' | 'tax' | 'other';
  category: string | null;
  description: string | null;
  amount: number;
  payment_date: string | null;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  size: string | null;
  color: string | null;
  stock: number;
}
