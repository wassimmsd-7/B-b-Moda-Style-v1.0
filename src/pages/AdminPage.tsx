import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { tr, formatPrice, formatDate, getProductName, getCategoryName, getStockStatus } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Truck, Tag, BarChart3,
  Settings, Menu, X, Plus, Edit2, Trash2, Search, AlertTriangle,
  TrendingUp, DollarSign, ShoppingBag, ArrowDownRight,
  ClipboardList, Wallet, Receipt,
} from 'lucide-react';
import type { Product, Category, Order, OrderItem, Client, Supplier, Promotion, PurchaseOrder, PurchaseOrderItem, Expense } from '@/lib/types';

interface AdminPageProps {
  navigate: (path: string) => void;
}

type AdminTab = 'dashboard' | 'products' | 'orders' | 'inventory' | 'clients' | 'suppliers' | 'promotions' | 'purchaseOrders' | 'analytics' | 'expenses' | 'reorder' | 'settings';

export function AdminPage({ navigate }: AdminPageProps) {
  const { lang, staffRole, setStaffRole } = useApp();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(!staffRole);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Restore an existing Supabase session on page reload instead of
    // forcing staff to log in again every time.
    (async () => {
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user.email;
      if (email) {
        const { data: staff } = await supabase
          .from('app_users')
          .select('role, active')
          .eq('email', email)
          .maybeSingle();
        if (staff?.active) {
          setStaffRole(staff.role as 'superadmin' | 'owner' | 'cashier');
          setShowLogin(false);
        }
      }
      setCheckingSession(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-sm text-gray-400">Chargement…</div>
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'dashboard', label: tr('dashboard', lang), icon: LayoutDashboard },
    { key: 'products', label: tr('products', lang), icon: Package },
    { key: 'orders', label: tr('orders', lang), icon: ShoppingCart },
    { key: 'inventory', label: tr('inventory', lang), icon: AlertTriangle },
    { key: 'clients', label: tr('clients', lang), icon: Users },
    { key: 'suppliers', label: tr('suppliers', lang), icon: Truck },
    { key: 'promotions', label: tr('promotions', lang), icon: Tag },
    { key: 'purchaseOrders', label: tr('purchaseOrders', lang), icon: ClipboardList },
    { key: 'analytics', label: tr('analytics', lang), icon: BarChart3 },
    { key: 'expenses', label: tr('expenses2', lang), icon: Wallet },
    { key: 'reorder', label: tr('reorderList', lang), icon: ShoppingCart },
    { key: 'settings', label: tr('settings', lang), icon: Settings },
  ];

  if (showLogin) {
    return <StaffLogin onLogin={(role) => { setStaffRole(role); setShowLogin(false); }} navigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <img src="/image.png" alt="Logo" className="h-10 w-auto object-contain" />
            <div>
              <div className="font-bold text-sm text-gray-900 dark:text-white">Bèbè Moda Style</div>
              <div className="text-xs text-pink-500">{staffRole}</div>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
          <button
            onClick={() => navigate('/pos')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ShoppingBag className="w-4 h-4" />
            {tr('pos', lang)}
          </button>
          <button
            onClick={async () => { await supabase.auth.signOut(); setStaffRole(null); navigate('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 mt-4"
          >
            <X className="w-4 h-4" />
            Déconnexion
          </button>
        </nav>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 dark:text-gray-300">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {tabs.find((t) => t.key === tab)?.label}
          </h1>
          <button onClick={() => navigate('/')} className="text-sm text-pink-500 hover:text-pink-600 font-medium">
            ← {tr('home', lang)}
          </button>
        </header>

        <main className="p-4 lg:p-6">
          {tab === 'dashboard' && <DashboardTab />}
          {tab === 'products' && <ProductsTab />}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'inventory' && <InventoryTab />}
          {tab === 'clients' && <ClientsTab />}
          {tab === 'suppliers' && <SuppliersTab />}
          {tab === 'promotions' && <PromotionsTab />}
          {tab === 'purchaseOrders' && <PurchaseOrdersTab />}
          {tab === 'analytics' && <AnalyticsTab />}
          {tab === 'expenses' && <ExpensesTab />}
          {tab === 'reorder' && <ReorderTab navigate={navigate} />}
          {tab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}

// ───────────── STAFF LOGIN ─────────────
function StaffLogin({ onLogin, navigate }: { onLogin: (role: 'superadmin' | 'owner' | 'cashier') => void; navigate: (path: string) => void }) {
  const { lang } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setLoading(false);
      setError('Email ou mot de passe incorrect.');
      return;
    }

    const { data: staff, error: staffError } = await supabase
      .from('app_users')
      .select('role, active')
      .eq('email', email)
      .maybeSingle();

    setLoading(false);

    if (staffError || !staff) {
      setError("Ce compte n'a pas accès à l'espace staff (introuvable dans app_users).");
      await supabase.auth.signOut();
      return;
    }
    if (!staff.active) {
      setError('Ce compte a été désactivé.');
      await supabase.auth.signOut();
      return;
    }

    onLogin(staff.role as 'superadmin' | 'owner' | 'cashier');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <img src="/image.png" alt="Bèbè Moda Style" className="h-20 w-auto object-contain mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bèbè Moda Style</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Espace Staff</p>
        </div>
        <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bebemoda.dz"
              className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-semibold transition-colors">
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
          <button onClick={() => navigate('/')} className="w-full text-sm text-gray-500 hover:text-pink-500">
            ← {tr('home', lang)}
          </button>
        </form>
      </div>
    </div>
  );
}

// ───────────── DASHBOARD ─────────────
function DashboardTab() {
  const { lang } = useApp();
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    lowStock: 0,
    clients: 0,
    posSales: 0,
    profit: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split('T')[0];
      const [{ data: orders }, { data: products }, { data: clients }, { data: posSales }, { data: recent }] = await Promise.all([
        supabase.from('orders').select('*').gte('created_at', today),
        supabase.from('products').select('*'),
        supabase.from('clients').select('*'),
        supabase.from('cash_sales').select('*').gte('created_at', today),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      const onlineRevenue = (orders || []).reduce((s, o) => s + (o.total || 0), 0);
      const posRevenue = (posSales || []).reduce((s, p) => s + (p.total || 0), 0);
      const lowStock = (products || []).filter((p) => getStockStatus(p.stock, p.stock_min) !== 'in').length;

      setStats({
        revenue: onlineRevenue + posRevenue,
        orders: orders?.length || 0,
        products: products?.length || 0,
        lowStock,
        clients: clients?.length || 0,
        posSales: posSales?.length || 0,
        profit: 0,
      });
      setRecentOrders(recent as Order[] || []);
      setLoading(false);
    })();

    // Real-time subscriptions
    const orderSub = supabase.channel('admin-dash-orders').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
      // Refresh data on new order
      setTimeout(() => {
        const today = new Date().toISOString().split('T')[0];
        Promise.all([
          supabase.from('orders').select('*').gte('created_at', today),
          supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        ]).then(([o, r]) => {
          setStats(prev => ({ ...prev, orders: o.data?.length || 0, revenue: (o.data || []).reduce((s, x) => s + (x.total || 0), 0) + prev.revenue }));
          setRecentOrders(r.data as Order[] || []);
        });
      }, 100);
    }).subscribe();

    const saleSub = supabase.channel('admin-dash-sales').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cash_sales' }, () => {
      setTimeout(() => {
        const today = new Date().toISOString().split('T')[0];
        supabase.from('cash_sales').select('*').gte('created_at', today).then(({ data }) => {
          setStats(prev => ({ ...prev, posSales: data?.length || 0, revenue: prev.revenue + (data || []).reduce((s, x) => s + (x.total || 0), 0) }));
        });
      }, 100);
    }).subscribe();

    return () => { supabase.removeChannel(orderSub); supabase.removeChannel(saleSub); };
  }, []);

  const cards = [
    { label: tr('revenue', lang), value: formatPrice(stats.revenue), icon: DollarSign, color: 'green' },
    { label: tr('totalOrders', lang), value: stats.orders, icon: ShoppingCart, color: 'blue' },
    { label: tr('posSales', lang), value: stats.posSales, icon: ShoppingBag, color: 'pink' },
    { label: tr('products', lang), value: stats.products, icon: Package, color: 'amber' },
    { label: tr('inventory', lang), value: stats.lowStock, icon: AlertTriangle, color: 'orange' },
    { label: tr('clients', lang), value: stats.clients, icon: Users, color: 'indigo' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-900/30 flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 text-${card.color}-500`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">{tr('orders', lang)} récentes</h2>
        {loading ? (
          <div className="text-center text-gray-400 py-8">{tr('loading', lang)}</div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center text-gray-400 py-8">{tr('noData', lang)}</div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">{order.order_number}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{order.client_name} — {formatDate(order.created_at, lang)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-pink-600 dark:text-pink-400">{formatPrice(order.total)}</div>
                  <span className={`text-xs font-medium ${
                    order.status === 'delivered' ? 'text-green-500' :
                    order.status === 'cancelled' ? 'text-red-500' :
                    'text-amber-500'
                  }`}>
                    {tr(order.status, lang)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────── PRODUCTS TAB ─────────────
function ProductsTab() {
  const { lang } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [{ data: prods }, { data: cats }, { data: sups }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name_fr'),
      supabase.from('suppliers').select('*').order('name'),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
    setSuppliers(sups || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter((p) =>
    p.name_fr.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit?')) return;
    await supabase.from('products').delete().eq('id', id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr('search', lang)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> {tr('add', lang)}
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">{tr('loading', lang)}</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">{tr('name', lang)}</th>
                  <th className="text-left px-4 py-3 font-medium">{tr('category', lang)}</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Fournisseur</th>
                  <th className="text-left px-4 py-3 font-medium">{tr('price', lang)}</th>
                  <th className="text-left px-4 py-3 font-medium">{tr('stock', lang)}</th>
                  <th className="text-left px-4 py-3 font-medium">{tr('status', lang)}</th>
                  <th className="text-right px-4 py-3 font-medium">{tr('actions', lang)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((p) => {
                  const stockStatus = getStockStatus(p.stock, p.stock_min);
                  const cat = categories.find((c) => c.id === p.category_id);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0">
                            {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{getProductName(p, lang)}</div>
                            <div className="text-xs text-gray-400">{p.sku || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{cat ? getCategoryName(cat, lang) : '—'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 hidden md:table-cell">{suppliers.find((s) => s.id === p.supplier_id)?.name || '—'}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{formatPrice(p.selling_price)}</td>
                      <td className="px-4 py-3">
                        <span className={stockStatus === 'out' ? 'text-red-500' : stockStatus === 'low' ? 'text-orange-500' : 'text-gray-700 dark:text-gray-200'}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.is_active ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                        }`}>
                          {p.is_active ? tr('active', lang) : tr('inactive', lang)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => { setEditing(p); setShowForm(true); }} className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-500">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          suppliers={suppliers}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

// ───────────── PRODUCT FORM ─────────────
function ProductForm({ product, categories, suppliers, onClose, onSaved }: {
  product: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { lang } = useApp();
  const [form, setForm] = useState({
    name_fr: product?.name_fr || '',
    name_ar: product?.name_ar || '',
    name_en: product?.name_en || '',
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    category_id: product?.category_id || '',
    supplier_id: product?.supplier_id || '',
    purchase_price: product?.purchase_price || 0,
    selling_price: product?.selling_price || 0,
    promo_price: product?.promo_price || '',
    stock: product?.stock || 0,
    stock_min: product?.stock_min || 5,
    age_min_months: product?.age_min_months || 0,
    age_max_months: product?.age_max_months || 36,
    gender: product?.gender || 'unisex',
    season: product?.season || 'all',
    sizes: product?.sizes?.join(', ') || '',
    colors: product?.colors?.join(', ') || '',
    images: product?.images?.join('\n') || '',
    description_fr: product?.description_fr || '',
    is_featured: product?.is_featured || false,
    is_active: product?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [poHistory, setPoHistory] = useState<(PurchaseOrderItem & { po_number?: string; po_status?: string; po_date?: string })[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!product) return;
    setLoadingHistory(true);
    (async () => {
      const { data: items } = await supabase.from('purchase_order_items').select('*').eq('product_id', product.id).order('created_at', { ascending: false });
      if (!items || items.length === 0) { setPoHistory([]); setLoadingHistory(false); return; }
      const poIds = Array.from(new Set(items.map((i) => i.po_id)));
      const { data: pos } = await supabase.from('purchase_orders').select('*').in('id', poIds);
      const merged = items.map((i) => {
        const po = pos?.find((p) => p.id === i.po_id);
        return { ...i, po_number: po?.po_number, po_status: po?.status, po_date: po?.created_at };
      });
      setPoHistory(merged);
      setLoadingHistory(false);
    })();
  }, [product]);

  const handleSave = async () => {
    setSaving(true);
    const data = {
      name_fr: form.name_fr,
      name_ar: form.name_ar || null,
      name_en: form.name_en || null,
      sku: form.sku || null,
      barcode: form.barcode || null,
      category_id: form.category_id || null,
      supplier_id: form.supplier_id || null,
      purchase_price: Number(form.purchase_price),
      selling_price: Number(form.selling_price),
      promo_price: form.promo_price ? Number(form.promo_price) : null,
      stock: Number(form.stock),
      stock_min: Number(form.stock_min),
      age_min_months: Number(form.age_min_months),
      age_max_months: Number(form.age_max_months),
      gender: form.gender,
      season: form.season,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(',').map((s) => s.trim()).filter(Boolean),
      images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
      description_fr: form.description_fr || null,
      is_featured: form.is_featured,
      is_active: form.is_active,
    };

    if (product) {
      await supabase.from('products').update(data).eq('id', product.id);
    } else {
      await supabase.from('products').insert(data);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white">{product ? tr('edit', lang) : tr('add', lang)} {tr('products', lang)}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nom (FR) *">
              <input value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} className="input" />
            </Field>
            <Field label="Nom (AR)">
              <input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className="input" dir="rtl" />
            </Field>
            <Field label="SKU">
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input" />
            </Field>
            <Field label="Code-barres">
              <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="input" />
            </Field>
            <Field label={tr('category', lang)}>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input">
                <option value="">—</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
              </select>
            </Field>
            <Field label={tr('gender', lang)}>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as 'boy' | 'girl' | 'unisex' })} className="input">
                <option value="unisex">{tr('unisex', lang)}</option>
                <option value="boy">{tr('boy', lang)}</option>
                <option value="girl">{tr('girl', lang)}</option>
              </select>
            </Field>
            <Field label="Fournisseur">
              <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className="input">
                <option value="">—</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label={tr('purchaseCost', lang)}>
              <input type="number" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: Number(e.target.value) })} className="input" />
            </Field>
            <Field label={tr('price', lang)}>
              <input type="number" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: Number(e.target.value) })} className="input" />
            </Field>
            <Field label="Promo price">
              <input type="number" value={form.promo_price} onChange={(e) => setForm({ ...form, promo_price: e.target.value })} className="input" />
            </Field>
            <Field label={tr('stock', lang)}>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="input" />
            </Field>
            <Field label="Stock min">
              <input type="number" value={form.stock_min} onChange={(e) => setForm({ ...form, stock_min: Number(e.target.value) })} className="input" />
            </Field>
            <Field label={tr('season', lang)}>
              <select value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="input">
                <option value="all">{tr('allSeasons', lang)}</option>
                <option value="spring">{tr('spring', lang)}</option>
                <option value="summer">{tr('summer', lang)}</option>
                <option value="autumn">{tr('autumn', lang)}</option>
                <option value="winter">{tr('winter', lang)}</option>
              </select>
            </Field>
            <Field label="Âge min (mois)">
              <input type="number" value={form.age_min_months} onChange={(e) => setForm({ ...form, age_min_months: Number(e.target.value) })} className="input" />
            </Field>
            <Field label="Âge max (mois)">
              <input type="number" value={form.age_max_months} onChange={(e) => setForm({ ...form, age_max_months: Number(e.target.value) })} className="input" />
            </Field>
          </div>
          <Field label="Tailles (séparées par virgules)">
            <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className="input" placeholder="0-3M, 3-6M, 6-12M" />
          </Field>
          <Field label="Couleurs (séparées par virgules)">
            <input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} className="input" placeholder="Rouge, Bleu, Rose" />
          </Field>
          <Field label="Images (une URL par ligne)">
            <textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} rows={3} className="input" placeholder="https://..." />
          </Field>
          <Field label="Description (FR)">
            <textarea value={form.description_fr} onChange={(e) => setForm({ ...form, description_fr: e.target.value })} rows={3} className="input" />
          </Field>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-pink-500" />
              {tr('featured', lang)}
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-pink-500" />
              {tr('active', lang)}
            </label>
          </div>

          {product && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Historique des commandes fournisseur</h3>
              {loadingHistory ? (
                <div className="text-xs text-gray-400">{tr('loading', lang)}</div>
              ) : poHistory.length === 0 ? (
                <div className="text-xs text-gray-400">Aucune commande fournisseur pour ce produit.</div>
              ) : (
                <div className="space-y-1.5">
                  {poHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2">
                      <div>
                        <span className="font-mono font-bold text-gray-900 dark:text-white">{item.po_number || '—'}</span>
                        <span className="ml-2 text-gray-400">{item.po_date ? formatDate(item.po_date, lang) : ''}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{item.quantity_ordered} × {formatPrice(item.unit_price)}</span>
                        <span className={`px-1.5 py-0.5 rounded-md font-medium ${
                          item.po_status === 'received' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          item.po_status === 'sent' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          item.po_status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-500'
                        }`}>{item.po_status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">{tr('cancel', lang)}</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold disabled:opacity-50">{tr('save', lang)}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

// ───────────── ORDERS TAB ─────────────
function OrdersTab() {
  const { lang } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data as Order[] || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter((o) => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search && !o.order_number.toLowerCase().includes(search.toLowerCase()) && !o.client_name.toLowerCase().includes(search.toLowerCase()) && !o.client_phone.includes(search)) return false;
    return true;
  });

  const updateStatus = async (order: Order, status: Order['status']) => {
    const updates: Partial<Order> = { status, updated_at: new Date().toISOString() };
    if (status === 'confirmed') updates.confirmed_at = new Date().toISOString();
    if (status === 'shipped') updates.shipped_at = new Date().toISOString();
    if (status === 'delivered') updates.delivered_at = new Date().toISOString();
    if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();
    await supabase.from('orders').update(updates).eq('id', order.id);
    load();
    if (selected?.id === order.id) setSelected({ ...order, ...updates });
  };

  const viewOrder = async (order: Order) => {
    setSelected(order);
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    setItems(data || []);
  };

  const statuses = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr('search', lang)} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm text-gray-900 dark:text-white">
          {statuses.map((s) => <option key={s} value={s}>{s === 'all' ? tr('status', lang) : tr(s, lang)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">{tr('loading', lang)}</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">N°</th>
                  <th className="text-left px-4 py-3 font-medium">{tr('name', lang)}</th>
                  <th className="text-left px-4 py-3 font-medium">{tr('phone', lang)}</th>
                  <th className="text-left px-4 py-3 font-medium">{tr('date', lang)}</th>
                  <th className="text-left px-4 py-3 font-medium">{tr('total2', lang)}</th>
                  <th className="text-left px-4 py-3 font-medium">{tr('status', lang)}</th>
                  <th className="text-right px-4 py-3 font-medium">{tr('actions', lang)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{o.order_number}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{o.client_name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{o.client_phone}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(o.created_at, lang)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        o.status === 'delivered' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                        o.status === 'cancelled' || o.status === 'returned' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                        o.status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                        'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>{tr(o.status, lang)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => viewOrder(o)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/30">
                        {tr('edit', lang)}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">{selected.order_number}</h2>
                <p className="text-xs text-gray-500">{formatDate(selected.created_at, lang)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">{tr('name', lang)}:</span> <span className="font-medium text-gray-900 dark:text-white">{selected.client_name}</span></div>
                <div><span className="text-gray-500">{tr('phone', lang)}:</span> <span className="font-medium text-gray-900 dark:text-white">{selected.client_phone}</span></div>
                <div><span className="text-gray-500">{tr('wilaya', lang)}:</span> <span className="font-medium text-gray-900 dark:text-white">{selected.client_wilaya || '—'}</span></div>
                <div><span className="text-gray-500">{tr('delivery', lang)}:</span> <span className="font-medium text-gray-900 dark:text-white">{formatPrice(selected.delivery_price)}</span></div>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">{tr('orders', lang)}</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span className="text-gray-600 dark:text-gray-300">{item.product_name} ×{item.quantity}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatPrice(item.total_price)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                  <span>{tr('total', lang)}</span>
                  <span>{formatPrice(selected.total)}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">{tr('status', lang)}</h3>
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as Order['status'][]).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selected.status === s
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tr(s, lang)}
                    </button>
                  ))}
                </div>
              </div>
              {selected.notes && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{tr('notes', lang)}:</span> {selected.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ───────────── INVENTORY TAB ─────────────
function InventoryTab() {
  const { lang } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('products').select('*').order('stock', { ascending: true }).then(({ data }) => {
      setProducts(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = products.filter((p) => {
    const status = getStockStatus(p.stock, p.stock_min);
    if (filter === 'low') return status === 'low';
    if (filter === 'out') return status === 'out';
    return true;
  });

  const updateStock = async (id: string, stock: number) => {
    await supabase.from('products').update({ stock }).eq('id', id);
    setProducts(products.map((p) => p.id === id ? { ...p, stock } : p));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[
          { k: 'all', v: tr('all', lang) },
          { k: 'low', v: tr('lowStock', lang) },
          { k: 'out', v: tr('outOfStock', lang) },
        ].map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k as 'all' | 'low' | 'out')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f.k ? 'bg-pink-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700'
            }`}
          >
            {f.v}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <div className="col-span-full text-center text-gray-400 py-12">{tr('loading', lang)}</div>}
        {!loading && filtered.map((p) => {
          const status = getStockStatus(p.stock, p.stock_min);
          return (
            <div key={p.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0">
                  {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">{getProductName(p, lang)}</h3>
                  <p className="text-xs text-gray-400">{p.sku || '—'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-xs font-medium ${
                    status === 'out' ? 'text-red-500' : status === 'low' ? 'text-orange-500' : 'text-green-500'
                  }`}>
                    {status === 'out' ? tr('outOfStock', lang) : status === 'low' ? tr('lowStock', lang) : tr('inStock', lang)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={p.stock}
                    onChange={(e) => updateStock(p.id, Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-center text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <span className="text-xs text-gray-400">/ {p.stock_min}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────────── CLIENTS TAB ─────────────
function ClientsTab() {
  const { lang } = useApp();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('clients').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setClients(data as Client[] || []);
      setLoading(false);
    });
  }, []);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search),
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr('search', lang)} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500" />
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">{tr('loading', lang)}</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">{tr('name', lang)}</th>
                  <th className="text-left px-4 py-3 font-medium">{tr('phone', lang)}</th>
                  <th className="text-left px-4 py-3 font-medium">{tr('wilaya', lang)}</th>
                  <th className="text-left px-4 py-3 font-medium">{tr('totalOrders', lang)}</th>
                  <th className="text-left px-4 py-3 font-medium">{tr('totalSpent', lang)}</th>
                  <th className="text-left px-4 py-3 font-medium">{tr('date', lang)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.wilaya || '—'}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{c.total_orders}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{formatPrice(c.total_spent)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(c.created_at, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ───────────── SUPPLIERS TAB ─────────────
function SuppliersTab() {
  const { lang } = useApp();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('suppliers').select('*').order('name');
    setSuppliers(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer?')) return;
    await supabase.from('suppliers').delete().eq('id', id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> {tr('add', lang)}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{s.name}</h3>
                <p className="text-xs text-gray-400">{s.contact_name || '—'}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(s); setShowForm(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              {s.phone && <div>📞 {s.phone}</div>}
              {s.email && <div>✉️ {s.email}</div>}
              {s.city && <div>📍 {s.city}, {s.country}</div>}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <SupplierForm supplier={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
    </div>
  );
}

function SupplierForm({ supplier, onClose, onSaved }: { supplier: Supplier | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: supplier?.name || '',
    contact_name: supplier?.contact_name || '',
    phone: supplier?.phone || '',
    phone2: supplier?.phone2 || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
    city: supplier?.city || '',
    country: supplier?.country || 'Algérie',
    notes: supplier?.notes || '',
  });

  const handleSave = async () => {
    if (supplier) {
      await supabase.from('suppliers').update(form).eq('id', supplier.id);
    } else {
      await supabase.from('suppliers').insert(form);
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white">Fournisseur</h2>
          <button onClick={onClose} className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <Field label="Nom *"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></Field>
          <Field label="Contact"><input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className="input" /></Field>
          <Field label="Téléphone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" /></Field>
          <Field label="Téléphone 2"><input value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} className="input" /></Field>
          <Field label="Email"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></Field>
          <Field label="Ville"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" /></Field>
          <Field label="Adresse"><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" /></Field>
          <Field label="Notes"><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input" /></Field>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Annuler</button>
          <button onClick={handleSave} className="px-4 py-2.5 rounded-xl bg-pink-500 text-white text-sm font-semibold">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

// ───────────── PROMOTIONS TAB ─────────────
function PromotionsTab() {
  const { lang } = useApp();
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
    setPromos(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer?')) return;
    await supabase.from('promotions').delete().eq('id', id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> {tr('add', lang)}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promos.map((p) => (
          <div key={p.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{p.name_fr}</h3>
                <p className="text-xs text-gray-400">{p.description_fr}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(p); setShowForm(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-xs font-bold">
                {p.discount_type === 'percent' ? `-${p.discount_value}%` : `-${formatPrice(p.discount_value)}`}
              </span>
              {p.start_date && p.end_date && (
                <span className="text-xs text-gray-400">{formatDate(p.start_date, lang)} → {formatDate(p.end_date, lang)}</span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs ${p.active ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                {p.active ? tr('active', lang) : tr('inactive', lang)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <PromoForm promo={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
    </div>
  );
}

function PromoForm({ promo, onClose, onSaved }: { promo: Promotion | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name_fr: promo?.name_fr || '',
    description_fr: promo?.description_fr || '',
    discount_type: promo?.discount_type || 'percent',
    discount_value: promo?.discount_value || 10,
    start_date: promo?.start_date || '',
    end_date: promo?.end_date || '',
    active: promo?.active ?? true,
  });

  const handleSave = async () => {
    const data = {
      ...form,
      discount_value: Number(form.discount_value),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };
    if (promo) {
      await supabase.from('promotions').update(data).eq('id', promo.id);
    } else {
      await supabase.from('promotions').insert(data);
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white">Promotion</h2>
          <button onClick={onClose} className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <Field label="Nom *"><input value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} className="input" /></Field>
          <Field label="Description"><input value={form.description_fr} onChange={(e) => setForm({ ...form, description_fr: e.target.value })} className="input" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percent' | 'fixed' })} className="input">
                <option value="percent">%</option>
                <option value="fixed">DA</option>
              </select>
            </Field>
            <Field label="Valeur"><input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} className="input" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Début"><input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="input" /></Field>
            <Field label="Fin"><input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="input" /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-pink-500" />
            Active
          </label>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Annuler</button>
          <button onClick={handleSave} className="px-4 py-2.5 rounded-xl bg-pink-500 text-white text-sm font-semibold">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

// ───────────── PURCHASE ORDERS TAB ─────────────
function PurchaseOrdersTab() {
  const { lang } = useApp();
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [selectedItems, setSelectedItems] = useState<PurchaseOrderItem[]>([]);

  const load = useCallback(async () => {
    const [{ data: poData }, { data: supData }, { data: prodData }] = await Promise.all([
      supabase.from('purchase_orders').select('*').order('created_at', { ascending: false }),
      supabase.from('suppliers').select('*'),
      supabase.from('products').select('*'),
    ]);
    setPos(poData as PurchaseOrder[] || []);
    setSuppliers(supData || []);
    setProducts(prodData || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openPO = async (po: PurchaseOrder) => {
    setSelectedPO(po);
    const { data } = await supabase.from('purchase_order_items').select('*').eq('po_id', po.id);
    setSelectedItems(data || []);
  };

  const changeStatus = async (po: PurchaseOrder, status: PurchaseOrder['status']) => {
    // When marking as received, restock products for the not-yet-received quantity
    if (status === 'received' && po.status !== 'received') {
      for (const item of selectedItems) {
        if (!item.product_id) continue;
        const remaining = item.quantity_ordered - (item.quantity_received || 0);
        if (remaining <= 0) continue;
        const { data: prod } = await supabase.from('products').select('stock').eq('id', item.product_id).maybeSingle();
        if (prod) {
          await supabase.from('products').update({ stock: prod.stock + remaining }).eq('id', item.product_id);
        }
        await supabase.from('purchase_order_items').update({ quantity_received: item.quantity_ordered }).eq('id', item.id);
      }
    }
    await supabase.from('purchase_orders').update({ status, received_at: status === 'received' ? new Date().toISOString() : po.received_at }).eq('id', po.id);
    setSelectedPO(null);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{pos.length} {tr('purchaseOrders', lang)}</p>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> {tr('add', lang)}
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">{tr('loading', lang)}</div>
      ) : pos.length === 0 ? (
        <div className="text-center text-gray-400 py-12">{tr('noData', lang)}</div>
      ) : (
        <div className="space-y-3">
          {pos.map((po) => (
            <button key={po.id} onClick={() => openPO(po)} className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-sm font-bold text-gray-900 dark:text-white">{po.po_number}</div>
                  <div className="text-xs text-gray-500">{po.supplier_name || '—'} — {formatDate(po.created_at, lang)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white">{formatPrice(po.total_amount)}</div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    po.status === 'received' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                    po.status === 'sent' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                    po.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}>{po.status}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <PurchaseOrderForm
          suppliers={suppliers}
          products={products}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}

      {selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white">{selectedPO.po_number}</h2>
              <button onClick={() => setSelectedPO(null)} className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Fournisseur: <span className="font-medium text-gray-900 dark:text-white">{selectedPO.supplier_name || '—'}</span><br />
                Date: {formatDate(selectedPO.created_at, lang)}<br />
                Statut actuel: <span className="font-medium">{selectedPO.status}</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Articles</h3>
                <div className="space-y-1.5">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2">
                      <span className="text-gray-700 dark:text-gray-200">{item.product_name}</span>
                      <span className="text-gray-500">{item.quantity_ordered} × {formatPrice(item.unit_price)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-gray-700">
                <span>Total</span>
                <span>{formatPrice(selectedPO.total_amount)}</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Changer le statut</h3>
                <div className="flex gap-2 flex-wrap">
                  {(['draft', 'sent', 'received', 'cancelled'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => changeStatus(selectedPO, s)}
                      disabled={selectedPO.status === s}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border ${
                        selectedPO.status === s
                          ? 'bg-pink-500 text-white border-pink-500 cursor-default'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-pink-300'
                      }`}
                    >
                      {s === 'received' ? '✓ Reçu (met à jour le stock)' : s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PurchaseOrderForm({ suppliers, products, initialSupplierId, initialItems, onClose, onSaved }: {
  suppliers: Supplier[];
  products: Product[];
  initialSupplierId?: string;
  initialItems?: { productId: string; qty: number; price: number }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [supplierId, setSupplierId] = useState(initialSupplierId || '');
  const [items, setItems] = useState<{ productId: string; qty: number; price: number }[]>(initialItems && initialItems.length > 0 ? initialItems : []);
  const [notes, setNotes] = useState('');

  const addItem = () => setItems([...items, { productId: '', qty: 1, price: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: 'productId' | 'qty' | 'price', value: string | number) => {
    setItems(items.map((item, idx) => {
      if (idx !== i) return item;
      if (field === 'productId') {
        const p = products.find((p) => p.id === value);
        return { ...item, productId: value as string, price: p?.purchase_price || 0 };
      }
      return { ...item, [field]: Number(value) };
    }));
  };

  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  const handleSave = async () => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    const { data: po } = await supabase.from('purchase_orders').insert({
      supplier_id: supplierId || null,
      supplier_name: supplier?.name || null,
      total_amount: total,
      notes,
      status: 'draft',
    }).select('id').single();

    if (po) {
      await supabase.from('purchase_order_items').insert(
        items.filter((i) => i.productId).map((i) => {
          const p = products.find((p) => p.id === i.productId);
          return {
            po_id: po.id,
            product_id: i.productId,
            product_name: p?.name_fr || '',
            quantity_ordered: i.qty,
            unit_price: i.price,
            total_price: i.qty * i.price,
          };
        }),
      );
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white">Bon de commande</h2>
          <button onClick={onClose} className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Fournisseur">
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="input">
              <option value="">—</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Articles</h3>
              <button onClick={addItem} className="text-sm text-pink-500 font-medium">+ Ajouter</button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)} className="input flex-1">
                    <option value="">—</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name_fr}</option>)}
                  </select>
                  <input type="number" value={item.qty} onChange={(e) => updateItem(i, 'qty', e.target.value)} className="input w-16" placeholder="Qté" />
                  <input type="number" value={item.price} onChange={(e) => updateItem(i, 'price', e.target.value)} className="input w-24" placeholder="Prix" />
                  <button onClick={() => removeItem(i)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-gray-700">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input" /></Field>
        </div>
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Annuler</button>
          <button onClick={handleSave} className="px-4 py-2.5 rounded-xl bg-pink-500 text-white text-sm font-semibold">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

// ───────────── ANALYTICS TAB ─────────────
function AnalyticsTab() {
  const { lang } = useApp();
  const [data, setData] = useState({
    onlineRevenue: 0,
    posRevenue: 0,
    onlineOrders: 0,
    posSales: 0,
    purchaseCost: 0,
    profit: 0,
    expenses: 0,
  });
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const now = new Date();
      const start = new Date();
      if (period === 'today') start.setHours(0, 0, 0, 0);
      else if (period === 'week') start.setDate(now.getDate() - 7);
      else if (period === 'month') start.setMonth(now.getMonth() - 1);
      else if (period === 'year') start.setFullYear(now.getFullYear() - 1);

      const startISO = start.toISOString();
      const [{ data: orders }, { data: pos }] = await Promise.all([
        supabase.from('orders').select('*').gte('created_at', startISO).neq('status', 'cancelled'),
        supabase.from('cash_sales').select('*').gte('created_at', startISO).neq('status', 'cancelled').neq('status', 'returned'),
      ]);

      const onlineRev = (orders || []).reduce((s, o) => s + (o.total || 0), 0);
      const posRev = (pos || []).reduce((s, p) => s + (p.total || 0), 0);
      const purchaseCost = (pos || []).reduce((s, p) => s + (p.subtotal || 0) * 0.6, 0); // estimate

      setData({
        onlineRevenue: onlineRev,
        posRevenue: posRev,
        onlineOrders: orders?.length || 0,
        posSales: pos?.length || 0,
        purchaseCost,
        profit: onlineRev + posRev - purchaseCost,
        expenses: 0,
      });
      setLoading(false);
    })();
  }, [period]);

  const cards = [
    { label: tr('revenue', lang), value: formatPrice(data.onlineRevenue + data.posRevenue), icon: DollarSign, color: 'green' },
    { label: tr('onlineSales', lang), value: formatPrice(data.onlineRevenue), icon: ShoppingCart, color: 'blue', sub: `${data.onlineOrders} ${tr('orders', lang)}` },
    { label: tr('posSales', lang), value: formatPrice(data.posRevenue), icon: ShoppingBag, color: 'pink', sub: `${data.posSales} ${tr('posSales', lang)}` },
    { label: tr('purchaseCost', lang), value: formatPrice(data.purchaseCost), icon: ArrowDownRight, color: 'red' },
    { label: tr('profit', lang), value: formatPrice(data.profit), icon: TrendingUp, color: 'green' },
    { label: tr('avgOrder', lang), value: formatPrice((data.onlineOrders + data.posSales) > 0 ? (data.onlineRevenue + data.posRevenue) / (data.onlineOrders + data.posSales) : 0), icon: BarChart3, color: 'amber' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[
          { k: 'today', v: 'Aujourd\'hui' },
          { k: 'week', v: '7 jours' },
          { k: 'month', v: '30 jours' },
          { k: 'year', v: 'Année' },
        ].map((p) => (
          <button
            key={p.k}
            onClick={() => setPeriod(p.k as 'today' | 'week' | 'month' | 'year')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              period === p.k ? 'bg-pink-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700'
            }`}
          >
            {p.v}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">{tr('loading', lang)}</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <div className={`w-10 h-10 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-900/30 flex items-center justify-center mb-3`}>
                <card.icon className={`w-5 h-5 text-${card.color}-500`} />
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</div>
              {card.sub && <div className="text-xs text-gray-400 mt-1">{card.sub}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ───────────── SETTINGS TAB ─────────────
function SettingsTab() {
  const { lang } = useApp();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('settings').select('*').then(({ data }) => {
      const map: Record<string, string> = {};
      (data || []).forEach((s: { key: string; value: string }) => map[s.key] = s.value);
      setSettings(map);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() });
    }
    setSaving(false);
  };

  const fields = [
    { key: 'store_name', label: 'Nom du magasin' },
    { key: 'store_phone', label: 'Téléphone' },
    { key: 'store_email', label: 'Email' },
    { key: 'store_address', label: 'Adresse' },
    { key: 'store_instagram', label: 'Instagram' },
    { key: 'store_facebook', label: 'Facebook' },
    { key: 'currency', label: 'Devise' },
    { key: 'low_stock_threshold', label: 'Seuil stock bas' },
  ];

  return (
    <div className="max-w-2xl space-y-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 space-y-4">
    <h2 className="font-bold text-gray-900 dark:text-white">Paramètres du magasin</h2>
    {fields.map((f) => (
      <Field key={f.key} label={f.label}>
        <input
          value={settings[f.key] || ''}
          onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
          className="input"
        />
      </Field>
    ))}
    <button onClick={handleSave} disabled={saving} className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold disabled:opacity-50">
      {saving ? tr('loading', lang) : tr('save', lang)}
    </button>
    </div>
    </div>
  );
}

// ===================== EXPENSES TAB =====================
function ExpensesTab() {
  const { lang } = useApp();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'salary', category: '', description: '', amount: '', payment_date: '' });

  const load = useCallback(async () => {
    const { data } = await supabase.from('expenses').select('*').order('payment_date', { ascending: false });
    setExpenses(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const sub = supabase.channel('expenses-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => load()).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [load]);

  const handleSave = async () => {
    if (!form.amount || !form.payment_date) return;
    await supabase.from('expenses').insert({
      type: form.type,
      category: form.category || null,
      description: form.description || null,
      amount: Number(form.amount),
      payment_date: form.payment_date,
    });
    setForm({ type: 'salary', category: '', description: '', amount: '', payment_date: '' });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette depense?')) return;
    await supabase.from('expenses').delete().eq('id', id);
    load();
  };

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const typeLabels: Record<string, string> = {
    salary: tr('salary', lang), personnel: tr('personnel', lang), rent: tr('rent', lang),
    utility: tr('utility', lang), supplies: tr('supplies', lang), marketing: tr('marketing', lang),
    transport: tr('transport', lang), tax: tr('tax', lang), other: tr('other', lang),
  };
  const typeIcons: Record<string, typeof Wallet> = {
    salary: Wallet, personnel: Users, rent: Receipt, utility: Receipt,
    supplies: Package, marketing: Tag, transport: Truck, tax: DollarSign, other: Receipt,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{tr('expenses2', lang)}</h2>
          <p className="text-sm text-gray-500">{tr('totalExpenses', lang)}: <span className="font-bold text-red-500">{formatPrice(totalExpenses)}</span></p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> {tr('addExpense', lang)}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{tr('expenseType', lang)}</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
                <option value="salary">{tr('salary', lang)}</option>
                <option value="personnel">{tr('personnel', lang)}</option>
                <option value="rent">{tr('rent', lang)}</option>
                <option value="utility">{tr('utility', lang)}</option>
                <option value="supplies">{tr('supplies', lang)}</option>
                <option value="marketing">{tr('marketing', lang)}</option>
                <option value="transport">{tr('transport', lang)}</option>
                <option value="tax">{tr('tax', lang)}</option>
                <option value="other">{tr('other', lang)}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{tr('price', lang)}</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{tr('category', lang)}</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Categorie" className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{tr('date', lang)}</label>
              <input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="input" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{tr('cancel', lang)}</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-pink-500 text-white text-sm font-semibold">{tr('save', lang)}</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-12">{tr('loading', lang)}</div>
      ) : expenses.length === 0 ? (
        <div className="text-center text-gray-400 py-12">{tr('noData', lang)}</div>
      ) : (
        <div className="space-y-2">
          {expenses.map((e) => {
            const Icon = typeIcons[e.type] || Receipt;
            return (
              <div key={e.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 dark:text-white truncate">{e.description || typeLabels[e.type] || e.type}</div>
                  <div className="text-xs text-gray-400">{typeLabels[e.type] || e.type} - {e.payment_date ? new Date(e.payment_date).toLocaleDateString('fr-FR') : ''}</div>
                </div>
                <div className="font-bold text-sm text-red-500 shrink-0">{formatPrice(Number(e.amount))}</div>
                <button onClick={() => handleDelete(e.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===================== REORDER TAB =====================
function ReorderTab({ navigate: _navigate }: { navigate: (path: string) => void }) {
  const { lang } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'out' | 'low' | 'new' | 'seasonal'>('out');
  const [selected, setSelected] = useState<Record<string, number>>({}); // productId -> qty
  const [showPOForm, setShowPOForm] = useState(false);

  const load = useCallback(async () => {
    const [{ data }, { data: sups }] = await Promise.all([
      supabase.from('products').select('*').order('name_fr'),
      supabase.from('suppliers').select('*').order('name'),
    ]);
    setProducts(data as Product[] || []);
    setSuppliers(sups || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const sub = supabase.channel('reorder-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => load()).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [load]);

  const suggestedQty = (p: Product) => Math.max((p.stock_min || 10) * 3 - p.stock, 10);

  const outOfStock = products.filter(p => p.stock === 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= (p.stock_min || 5));
  const newProducts = [...products].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 20);
  const seasonal = products.filter(p => p.is_seasonal);

  const sections = [
    { key: 'out' as const, label: tr('outOfStockProducts', lang), items: outOfStock, color: 'red' },
    { key: 'low' as const, label: tr('lowStockProducts', lang), items: lowStock, color: 'orange' },
    { key: 'new' as const, label: 'Nouveaux produits', items: newProducts, color: 'purple' },
    { key: 'seasonal' as const, label: tr('seasonalProducts', lang), items: seasonal, color: 'blue' },
  ];

  const current = sections.find(s => s.key === activeSection)!;
  const selectedCount = Object.keys(selected).length;

  const toggleSelect = (p: Product) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[p.id] !== undefined) {
        delete next[p.id];
      } else {
        next[p.id] = suggestedQty(p);
      }
      return next;
    });
  };

  const updateQty = (id: string, qty: number) => {
    setSelected((prev) => ({ ...prev, [id]: qty }));
  };

  const selectAllCurrent = () => {
    setSelected((prev) => {
      const next = { ...prev };
      const allSelected = current.items.every((p) => next[p.id] !== undefined);
      current.items.forEach((p) => {
        if (allSelected) delete next[p.id];
        else if (next[p.id] === undefined) next[p.id] = suggestedQty(p);
      });
      return next;
    });
  };

  const initialPOItems = Object.entries(selected).map(([productId, qty]) => {
    const p = products.find((pr) => pr.id === productId);
    return { productId, qty, price: p?.purchase_price || 0 };
  });
  const initialSupplierId = (() => {
    const ids = Object.keys(selected).map((id) => products.find((p) => p.id === id)?.supplier_id).filter(Boolean) as string[];
    if (ids.length === 0) return '';
    const counts: Record<string, number> = {};
    ids.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{tr('reorderList', lang)}</h2>
          <p className="text-sm text-gray-500">{tr('reorderSubtitle', lang)}</p>
        </div>
        {selectedCount > 0 && (
          <button onClick={() => setShowPOForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold">
            <ShoppingCart className="w-4 h-4" /> {tr('createPO', lang)} ({selectedCount})
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {sections.map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeSection === s.key ? 'bg-pink-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
            {s.label} <span className={`ml-1 px-1.5 py-0.5 rounded-md text-xs ${activeSection === s.key ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>{s.items.length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">{tr('loading', lang)}</div>
      ) : current.items.length === 0 ? (
        <div className="text-center text-gray-400 py-12">{tr('noData', lang)}</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="text-center px-4 py-3">
                    <input type="checkbox" className="accent-pink-500" checked={current.items.length > 0 && current.items.every((p) => selected[p.id] !== undefined)} onChange={selectAllCurrent} />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{tr('name', lang)}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">{tr('category', lang)}</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">{tr('stock', lang)}</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">{tr('suggestedQty', lang)}</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">{tr('actions', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {current.items.map(p => {
                  const isSelected = selected[p.id] !== undefined;
                  return (
                    <tr key={p.id} className={`border-t border-gray-50 dark:border-gray-700 ${isSelected ? 'bg-pink-50/50 dark:bg-pink-900/10' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" className="accent-pink-500" checked={isSelected} onChange={() => toggleSelect(p)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {p.images?.[0] && <img src={p.images[0]} alt="" className="w-8 h-8 rounded-md object-cover" />}
                          <span className="font-medium text-gray-900 dark:text-white">{getProductName(p, lang)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{p.sku || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${p.stock === 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'}`}>{p.stock}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isSelected ? (
                          <input type="number" value={selected[p.id]} onChange={(e) => updateQty(p.id, Number(e.target.value))} className="w-16 px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-center text-gray-900 dark:text-white" />
                        ) : (
                          <span className="text-gray-600 dark:text-gray-300">{suggestedQty(p)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => toggleSelect(p)} className="text-xs text-pink-500 hover:text-pink-600 font-medium">
                          {isSelected ? tr('remove', lang) : tr('add', lang)}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPOForm && (
        <PurchaseOrderForm
          suppliers={suppliers}
          products={products}
          initialSupplierId={initialSupplierId}
          initialItems={initialPOItems}
          onClose={() => setShowPOForm(false)}
          onSaved={() => { setShowPOForm(false); setSelected({}); }}
        />
      )}
    </div>
  );
}
