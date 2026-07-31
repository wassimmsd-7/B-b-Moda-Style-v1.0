import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { tr, formatPrice, getProductName, getStockStatus, generateSaleNumber, formatDateTime } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, Printer, X,
  CreditCard, Banknote, Clock, Check, ArrowLeft, Receipt,
  History, RotateCcw, AlertCircle, Edit2, Save,
} from 'lucide-react';
import type { Product, CashSale, CashSaleItem, Category } from '@/lib/types';

interface PosPageProps {
  navigate: (path: string) => void;
}

interface CartLine {
  product_id: string;
  name: string;
  price: number;
  purchase_price: number;
  qty: number;
  stock: number;
  barcode: string | null;
  size: string | null;
  color: string | null;
}

export function PosPage({ navigate }: PosPageProps) {
  const { lang, staffRole } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'edahabiya' | 'mixed'>('cash');
  const [paymentMode, setPaymentMode] = useState<'full' | 'deposit' | 'credit'>('full');
  const [amountPaid, setAmountPaid] = useState('');
  const [creditDeadline, setCreditDeadline] = useState('');
  const [clientName, setClientName] = useState('');
  const [lastSale, setLastSale] = useState<CashSale | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [todaySales, setTodaySales] = useState<CashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedSale, setSelectedSale] = useState<CashSale | null>(null);
  const [saleItems, setSaleItems] = useState<CashSaleItem[]>([]);
  const [editingSale, setEditingSale] = useState<CashSale | null>(null);
  const [editItems, setEditItems] = useState<(CashSaleItem & { _originalQty?: number })[]>([]);
  const [editProductSearch, setEditProductSearch] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const loadProducts = useCallback(async () => {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*').eq('is_active', true).order('name_fr'),
      supabase.from('categories').select('*').eq('active', true).order('sort_order'),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
    setLoading(false);
  }, []);

  const loadTodaySales = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('cash_sales').select('*').gte('created_at', today).order('created_at', { ascending: false });
    setTodaySales(data as CashSale[] || []);
  }, []);

  useEffect(() => {
    loadProducts();
    loadTodaySales();

    // Real-time subscription for products
    const productSub = supabase.channel('pos-products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => loadProducts()).subscribe();
    const saleSub = supabase.channel('pos-sales').on('postgres_changes', { event: '*', schema: 'public', table: 'cash_sales' }, () => loadTodaySales()).subscribe();

    return () => { supabase.removeChannel(productSub); supabase.removeChannel(saleSub); };
  }, [loadProducts, loadTodaySales]);

  if (!staffRole) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <img src="/image.png" alt="Bèbè Moda Style" className="h-20 w-auto object-contain mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Caisse — Bèbè Moda Style</h1>
            <p className="text-sm text-gray-500">Connexion staff requise</p>
          </div>
          <button onClick={() => navigate('/admin')} className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold">
            Se connecter
          </button>
          <button onClick={() => navigate('/')} className="w-full mt-2 text-sm text-gray-500 hover:text-pink-500">
            ← {tr('home', lang)}
          </button>
        </div>
      </div>
    );
  }

  const filtered = products.filter((p) => {
    if (selectedCat && p.category_id !== selectedCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name_fr.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.barcode?.includes(search);
    }
    return true;
  });

  const addToCart = (product: Product) => {
    const price = product.promo_price && product.promo_price < product.selling_price ? product.promo_price : product.selling_price;
    setCart((prev) => {
      const existing = prev.find((l) => l.product_id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map((l) => l.product_id === product.id ? { ...l, qty: l.qty + 1 } : l);
      }
      return [...prev, { product_id: product.id, name: getProductName(product, lang), price, purchase_price: product.purchase_price, qty: 1, stock: product.stock, barcode: product.barcode, size: product.sizes?.[0] || null, color: product.colors?.[0] || null }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => prev.map((l) => {
      if (l.product_id !== productId) return l;
      const newQty = l.qty + delta;
      if (newQty <= 0) return l;
      if (newQty > l.stock) return l;
      return { ...l, qty: newQty };
    }));
  };

  const removeLine = (productId: string) => setCart((prev) => prev.filter((l) => l.product_id !== productId));

  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);
  const totalCost = cart.reduce((s, l) => s + l.purchase_price * l.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const saleNumber = generateSaleNumber();
    const paid = paymentMode === 'credit' ? 0 : Number(amountPaid || subtotal);
    const due = subtotal - paid;

    const { data: sale } = await supabase.from('cash_sales').insert({
      sale_number: saleNumber, cashier_name: staffRole, client_name: clientName || null,
      subtotal, total: subtotal, amount_paid: paid, amount_due: due,
      credit_deadline: creditDeadline || null, payment_method: paymentMethod,
      status: paymentMode === 'credit' ? 'credit' : due > 0 ? 'partial' : 'completed',
    }).select('*').single();

    if (sale) {
      await supabase.from('cash_sale_items').insert(cart.map((l) => ({
        sale_id: sale.id, product_id: l.product_id, product_name: l.name, barcode: l.barcode,
        size: l.size, color: l.color, quantity: l.qty, unit_price: l.price,
        purchase_price: l.purchase_price, total_price: l.price * l.qty,
      })));

      // Decrement stock + check alerts
      for (const l of cart) {
        const { data: prod } = await supabase.from('products').select('stock,stock_min,name_fr').eq('id', l.product_id).maybeSingle();
        if (prod) {
          const newStock = Math.max(0, prod.stock - l.qty);
          await supabase.from('products').update({ stock: newStock }).eq('id', l.product_id);
          if (newStock === 0) {
            await createNotification('out_of_stock', [
              { fr: `Rupture: ${prod.name_fr}`, ar: `نفاد: ${prod.name_fr}`, en: `Out: ${prod.name_fr}`, dz: `Sali: ${prod.name_fr}` },
              { fr: `${prod.name_fr} en rupture de stock`, ar: `${prod.name_fr} نفد`, en: `${prod.name_fr} out of stock`, dz: `${prod.name_fr} sali` },
            ], l.product_id, 'product');
          } else if (newStock <= prod.stock_min) {
            await createNotification('low_stock', [
              { fr: `Stock faible: ${prod.name_fr}`, ar: `مخزون منخفض: ${prod.name_fr}`, en: `Low: ${prod.name_fr}`, dz: `Stock 9lil: ${prod.name_fr}` },
              { fr: `${newStock} unités restantes`, ar: `${newStock} وحدة متبقية`, en: `${newStock} units left`, dz: `${newStock} unités b9aw` },
            ], l.product_id, 'product');
          }
        }
      }

      await createNotification('new_sale', [
        { fr: `Vente ${saleNumber}`, ar: `بيع ${saleNumber}`, en: `Sale ${saleNumber}`, dz: `Vente ${saleNumber}` },
        { fr: `Vente caisse - ${formatPrice(subtotal)}`, ar: `بيع صندوق - ${formatPrice(subtotal)}`, en: `POS sale - ${formatPrice(subtotal)}`, dz: `Vente caisse - ${formatPrice(subtotal)}` },
      ], sale.id, 'cash_sale');

      setLastSale(sale as CashSale);
      setShowReceipt(true);
      setCart([]); setShowCheckout(false); setAmountPaid(''); setClientName(''); setCreditDeadline(''); setPaymentMode('full');
      loadTodaySales(); loadProducts();
    }
  };

  const viewSale = async (sale: CashSale) => {
    setSelectedSale(sale);
    const { data } = await supabase.from('cash_sale_items').select('*').eq('sale_id', sale.id);
    setSaleItems(data || []);
  };

  const cancelSale = async (sale: CashSale) => {
    if (!confirm(`Annuler la vente ${sale.sale_number}? Le stock sera restauré.`)) return;
    // Restore stock
    for (const item of saleItems) {
      const { data: prod } = await supabase.from('products').select('stock').eq('id', item.product_id).maybeSingle();
      if (prod) {
        await supabase.from('products').update({ stock: prod.stock + item.quantity }).eq('id', item.product_id);
      }
    }
    await supabase.from('cash_sales').update({ status: 'cancelled' }).eq('id', sale.id);
    setSelectedSale(null);
    setShowHistory(false);
    loadTodaySales(); loadProducts();
  };

  const openEditSale = async (sale: CashSale) => {
    const { data } = await supabase.from('cash_sale_items').select('*').eq('sale_id', sale.id);
    setEditingSale(sale);
    setEditItems((data || []).map((i) => ({ ...i, _originalQty: i.quantity })));
    setEditProductSearch('');
    setShowHistory(false);
  };

  const editUpdateQty = (itemId: string, qty: number) => {
    if (qty < 0) return;
    setEditItems((prev) => prev.map((i) => i.id === itemId ? { ...i, quantity: qty, total_price: qty * i.unit_price } : i));
  };

  const editRemoveItem = (itemId: string) => {
    setEditItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const editAddProduct = (product: Product) => {
    const price = product.promo_price && product.promo_price < product.selling_price ? product.promo_price : product.selling_price;
    setEditItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) => i.id === existing.id ? { ...i, quantity: i.quantity + 1, total_price: (i.quantity + 1) * i.unit_price } : i);
      }
      return [...prev, {
        id: `new-${product.id}-${Date.now()}`,
        sale_id: editingSale!.id,
        product_id: product.id,
        product_name: getProductName(product, lang),
        product_sku: product.sku,
        barcode: product.barcode,
        size: product.sizes?.[0] || null,
        color: product.colors?.[0] || null,
        quantity: 1,
        unit_price: price,
        purchase_price: product.purchase_price,
        discount_amount: 0,
        total_price: price,
        _originalQty: 0,
      }];
    });
    setEditProductSearch('');
  };

  const editNewSubtotal = editItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  const saveEditSale = async () => {
    if (!editingSale) return;
    setSavingEdit(true);
    // Adjust stock for each affected product: delta = originalQty - newQty (positive => restore stock)
    for (const item of editItems) {
      const originalQty = item._originalQty || 0;
      const delta = originalQty - item.quantity;
      if (delta !== 0 && item.product_id) {
        const { data: prod } = await supabase.from('products').select('stock').eq('id', item.product_id).maybeSingle();
        if (prod) {
          await supabase.from('products').update({ stock: Math.max(0, prod.stock + delta) }).eq('id', item.product_id);
        }
      }
    }
    // Removed items (present originally but no longer in editItems)
    const { data: originalItems } = await supabase.from('cash_sale_items').select('*').eq('sale_id', editingSale.id);
    const stillPresentIds = new Set(editItems.filter((i) => !i.id.startsWith('new-')).map((i) => i.id));
    for (const orig of originalItems || []) {
      if (!stillPresentIds.has(orig.id)) {
        if (orig.product_id) {
          const { data: prod } = await supabase.from('products').select('stock').eq('id', orig.product_id).maybeSingle();
          if (prod) await supabase.from('products').update({ stock: prod.stock + orig.quantity }).eq('id', orig.product_id);
        }
        await supabase.from('cash_sale_items').delete().eq('id', orig.id);
      }
    }
    // Update or insert items
    for (const item of editItems) {
      if (item.id.startsWith('new-')) {
        await supabase.from('cash_sale_items').insert({
          sale_id: editingSale.id, product_id: item.product_id, product_name: item.product_name,
          product_sku: item.product_sku, barcode: item.barcode, size: item.size, color: item.color,
          quantity: item.quantity, unit_price: item.unit_price, purchase_price: item.purchase_price,
          discount_amount: 0, total_price: item.unit_price * item.quantity,
        });
      } else {
        await supabase.from('cash_sale_items').update({
          quantity: item.quantity, total_price: item.unit_price * item.quantity,
        }).eq('id', item.id);
      }
    }
    const newTotal = editNewSubtotal;
    const newDue = Math.max(0, newTotal - editingSale.amount_paid);
    const newStatus = editingSale.status === 'credit' ? 'credit' : newDue > 0 ? 'partial' : 'completed';
    await supabase.from('cash_sales').update({
      subtotal: newTotal, total: newTotal, amount_due: newDue, status: newStatus,
    }).eq('id', editingSale.id);

    setSavingEdit(false);
    setEditingSale(null);
    loadTodaySales();
    loadProducts();
  };

  const todayTotal = todaySales.filter(s => s.status !== 'cancelled').reduce((s, sale) => s + (sale.total || 0), 0);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="p-2 text-gray-500 hover:text-pink-500"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            <img src="/image.png" alt="Logo" className="h-9 w-auto object-contain" />
            <div>
              <div className="font-bold text-sm text-gray-900 dark:text-white">Caisse — POS</div>
              <div className="text-xs text-gray-400">{staffRole}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowHistory(true)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
            <History className="w-4 h-4" /> <span className="hidden sm:inline">{tr('saleHistory', lang)}</span>
          </button>
          <div className="text-right">
            <div className="text-xs text-gray-400">{tr('todaySales', lang)}</div>
            <div className="font-bold text-sm text-pink-600 dark:text-pink-400">{formatPrice(todayTotal)}</div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-400">{tr('totalOrders', lang)}</div>
            <div className="font-bold text-sm text-gray-900 dark:text-white">{todaySales.length}</div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Products */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr('scanOrSearch', lang)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500" autoFocus />
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              <button onClick={() => setSelectedCat(null)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${!selectedCat ? 'bg-pink-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>{tr('allCategories', lang)}</button>
              {categories.map((c) => (
                <button key={c.id} onClick={() => setSelectedCat(c.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedCat === c.id ? 'bg-pink-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>{c.name_fr}</button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? <div className="text-center text-gray-400 py-12">{tr('loading', lang)}</div>
            : filtered.length === 0 ? <div className="text-center text-gray-400 py-12">{tr('noResults', lang)}</div>
            : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filtered.map((p) => {
                  const status = getStockStatus(p.stock, p.stock_min);
                  const price = p.promo_price && p.promo_price < p.selling_price ? p.promo_price : p.selling_price;
                  return (
                    <button key={p.id} onClick={() => addToCart(p)} disabled={status === 'out'} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-pink-300 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed group">
                      <div className="aspect-square rounded-lg bg-gray-50 dark:bg-gray-900 overflow-hidden mb-2">
                        {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-3xl">👶</div>}
                      </div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">{getProductName(p, lang)}</div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-pink-600 dark:text-pink-400">{formatPrice(price)}</span>
                        <span className={`text-[10px] ${status === 'out' ? 'text-red-500' : status === 'low' ? 'text-orange-500' : 'text-gray-400'}`}>{p.stock}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cart sidebar */}
        <div className="w-full sm:w-80 lg:w-96 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> {tr('cart2', lang)}</h2>
            {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-600 font-medium">Vider</button>}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart className="w-12 h-12 mb-2 opacity-30" />
                <p className="text-sm">{tr('emptyCart', lang)}</p>
              </div>
            ) : (
              cart.map((line) => (
                <div key={line.product_id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 dark:text-white truncate">{line.name}</div>
                    <div className="text-xs text-gray-400">{formatPrice(line.price)} × {line.qty}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(line.product_id, -1)} className="w-6 h-6 rounded-md bg-white dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"><Minus className="w-3 h-3" /></button>
                    <span className="w-6 text-center text-xs font-bold text-gray-900 dark:text-white">{line.qty}</span>
                    <button onClick={() => updateQty(line.product_id, 1)} className="w-6 h-6 rounded-md bg-white dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"><Plus className="w-3 h-3" /></button>
                    <button onClick={() => removeLine(line.product_id)} className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">{tr('subtotal', lang)}</span><span className="font-bold text-gray-900 dark:text-white">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-xs text-gray-400"><span>{tr('purchaseCost', lang)}</span><span>{formatPrice(totalCost)}</span></div>
              <div className="flex justify-between text-sm"><span className="font-semibold text-gray-900 dark:text-white">{tr('total', lang)}</span><span className="text-xl font-bold text-pink-600 dark:text-pink-400">{formatPrice(subtotal)}</span></div>
              <button onClick={() => setShowCheckout(true)} className="w-full py-3.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-lg transition-colors flex items-center justify-center gap-2"><CreditCard className="w-5 h-5" /> {tr('pay', lang)}</button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="font-bold text-gray-900 dark:text-white">{tr('pay', lang)}</h2>
              <button onClick={() => setShowCheckout(false)} className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{formatPrice(subtotal)}</div>
                <div className="text-xs text-gray-400">{tr('total', lang)}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Client (optionnel)</label>
                <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder={tr('name', lang)} className="input" />
              </div>

              {/* Payment mode selection */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{tr('paymentMethod', lang)}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: 'full', v: tr('fullPayment', lang), icon: Check },
                    { k: 'deposit', v: tr('depositPayment', lang), icon: Banknote },
                    { k: 'credit', v: tr('creditPayment', lang), icon: Clock },
                  ].map((opt) => (
                    <button key={opt.k} onClick={() => setPaymentMode(opt.k as 'full' | 'deposit' | 'credit')} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-colors ${paymentMode === opt.k ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30' : 'border-gray-200 dark:border-gray-700'}`}>
                      <opt.icon className={`w-4 h-4 ${paymentMode === opt.k ? 'text-pink-500' : 'text-gray-400'}`} />
                      <span className={`text-[10px] font-medium text-center ${paymentMode === opt.k ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500'}`}>{opt.v}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment method selection */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Moyen de paiement</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { k: 'cash', v: tr('cash', lang), icon: Banknote },
                    { k: 'card', v: tr('card', lang), icon: CreditCard },
                    { k: 'edahabiya', v: tr('edahabiya', lang), icon: Receipt },
                    { k: 'mixed', v: 'Mixte', icon: Receipt },
                  ].map((opt) => (
                    <button key={opt.k} onClick={() => setPaymentMethod(opt.k as 'cash' | 'card' | 'edahabiya' | 'mixed')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-colors ${paymentMethod === opt.k ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30' : 'border-gray-200 dark:border-gray-700'}`}>
                      <opt.icon className={`w-4 h-4 ${paymentMethod === opt.k ? 'text-pink-500' : 'text-gray-400'}`} />
                      <span className={`text-[10px] font-medium ${paymentMethod === opt.k ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500'}`}>{opt.v}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Full payment: show amount paid field with change calculation */}
              {paymentMode === 'full' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{tr('amountPaid', lang)}</label>
                  <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder={String(subtotal)} className="input" />
                  {amountPaid && Number(amountPaid) > subtotal && <div className="mt-1 text-xs text-green-500">{tr('change', lang)}: {formatPrice(Number(amountPaid) - subtotal)}</div>}
                </div>
              )}

              {/* Deposit payment: show deposit amount + deadline for remainder */}
              {paymentMode === 'deposit' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{tr('depositAmount', lang)}</label>
                    <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0" className="input" />
                    {amountPaid && Number(amountPaid) < subtotal && <div className="mt-1 text-xs text-orange-500">{tr('remainingAmount', lang)}: {formatPrice(subtotal - Number(amountPaid))}</div>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{tr('creditDeadline', lang)}</label>
                    <input type="date" value={creditDeadline} onChange={(e) => setCreditDeadline(e.target.value)} className="input" />
                  </div>
                </>
              )}

              {/* Credit payment: show deadline only */}
              {paymentMode === 'credit' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{tr('creditDeadline', lang)}</label>
                  <input type="date" value={creditDeadline} onChange={(e) => setCreditDeadline(e.target.value)} className="input" />
                  <div className="mt-1 text-xs text-orange-500">{tr('remainingAmount', lang)}: {formatPrice(subtotal)}</div>
                </div>
              )}

              <button onClick={handleCheckout} className="w-full py-3.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold transition-colors flex items-center justify-center gap-2"><Check className="w-5 h-5" /> {tr('confirm', lang)}</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt modal */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3"><Check className="w-10 h-10 text-green-500" /></div>
              <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{tr('orderSuccess', lang)}</h2>
              <p className="text-xs text-gray-400 mb-4">{lastSale.sale_number}</p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-left mb-4">
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">{tr('total', lang)}</span><span className="font-bold text-gray-900 dark:text-white">{formatPrice(lastSale.total)}</span></div>
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">{tr('amountPaid', lang)}</span><span className="text-gray-900 dark:text-white">{formatPrice(lastSale.amount_paid)}</span></div>
                {lastSale.amount_due > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Reste dû</span><span className="text-red-500">{formatPrice(lastSale.amount_due)}</span></div>}
                {lastSale.credit_deadline && <div className="flex justify-between text-sm mt-1"><span className="text-gray-500">{tr('creditDeadline', lang)}</span><span className="text-orange-500">{lastSale.credit_deadline}</span></div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold flex items-center justify-center gap-2"><Printer className="w-4 h-4" /> {tr('printReceipt', lang)}</button>
                <button onClick={() => { setShowReceipt(false); setLastSale(null); }} className="flex-1 py-3 rounded-xl bg-pink-500 text-white font-semibold">{tr('newSale', lang)}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale history modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white">{tr('saleHistory', lang)}</h2>
              <button onClick={() => setShowHistory(false)} className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-2">
              {todaySales.length === 0 ? <div className="text-center text-gray-400 py-8">{tr('noData', lang)}</div> : todaySales.map((sale) => (
                <div key={sale.id} className={`p-3 rounded-xl border ${sale.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 opacity-60' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <div className="font-mono text-xs font-bold text-gray-900 dark:text-white">{sale.sale_number}</div>
                      <div className="text-xs text-gray-400">{formatDateTime(sale.created_at, lang)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-gray-900 dark:text-white">{formatPrice(sale.total)}</div>
                      <span className={`text-xs font-medium ${sale.status === 'completed' ? 'text-green-500' : sale.status === 'cancelled' ? 'text-red-500' : sale.status === 'credit' ? 'text-orange-500' : 'text-amber-500'}`}>{sale.status === 'completed' ? '✓' : sale.status === 'cancelled' ? '✗' : sale.status === 'credit' ? '🕐' : '⏳'} {sale.payment_method}</span>
                    </div>
                  </div>
                  {sale.status !== 'cancelled' && (
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => openEditSale(sale)} className="flex-1 py-1.5 rounded-lg text-xs font-medium text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-center gap-1">
                        <Edit2 className="w-3 h-3" /> Modifier
                      </button>
                      <button onClick={() => viewSale(sale)} className="flex-1 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center gap-1">
                        <RotateCcw className="w-3 h-3" /> {tr('cancelSale', lang)}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit sale modal */}
      {editingSale && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Edit2 className="w-4 h-4 text-blue-500" /> Modifier {editingSale.sale_number}</h2>
              <button onClick={() => setEditingSale(null)} className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                {editItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-xl p-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product_name}</div>
                      <div className="text-xs text-gray-400">{formatPrice(item.unit_price)} / unité</div>
                    </div>
                    <button onClick={() => editUpdateQty(item.id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                    <button onClick={() => editUpdateQty(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300"><Plus className="w-3.5 h-3.5" /></button>
                    <div className="w-20 text-right text-sm font-bold text-gray-900 dark:text-white">{formatPrice(item.unit_price * item.quantity)}</div>
                    <button onClick={() => editRemoveItem(item.id)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {editItems.length === 0 && <div className="text-center text-sm text-gray-400 py-4">Aucun article — la vente sera vidée</div>}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={editProductSearch}
                    onChange={(e) => setEditProductSearch(e.target.value)}
                    placeholder="Ajouter un article..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                {editProductSearch && (
                  <div className="mt-1 max-h-40 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-700">
                    {products.filter((p) => p.name_fr.toLowerCase().includes(editProductSearch.toLowerCase())).slice(0, 8).map((p) => (
                      <button key={p.id} onClick={() => editAddProduct(p)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 flex justify-between text-gray-700 dark:text-gray-200">
                        <span>{p.name_fr}</span>
                        <span className="text-gray-400">{formatPrice(p.selling_price)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-gray-700">
                <span>Nouveau total</span>
                <span>{formatPrice(editNewSubtotal)}</span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setEditingSale(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{tr('cancel', lang)}</button>
                <button onClick={saveEditSale} disabled={savingEdit} className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <Save className="w-4 h-4" /> {savingEdit ? tr('loading', lang) : tr('save', lang)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel sale confirmation modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-bold text-red-500 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> {tr('cancelSale', lang)}</h2>
              <button onClick={() => setSelectedSale(null)} className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Vente: <span className="font-mono font-bold">{selectedSale.sale_number}</span><br />
                Total: <span className="font-bold">{formatPrice(selectedSale.total)}</span><br />
                Date: {formatDateTime(selectedSale.created_at, lang)}
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Articles à restaurer:</h3>
                {saleItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span className="text-gray-600 dark:text-gray-300">{item.product_name} ×{item.quantity}</span>
                    <span className="text-green-500">+{item.quantity} stock</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedSale(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{tr('cancel', lang)}</button>
                <button onClick={() => cancelSale(selectedSale)} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold">{tr('cancelSale', lang)}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
