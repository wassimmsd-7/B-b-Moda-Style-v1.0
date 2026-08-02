import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { tr, formatPrice, generateOrderNumber } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';
import { Check, Truck, Home, Store } from 'lucide-react';
import type { DeliveryZone } from '@/lib/types';

interface CheckoutPageProps {
  navigate: (path: string) => void;
}

export function CheckoutPage({ navigate }: CheckoutPageProps) {
  const { lang, cart, cartTotal, clearCart } = useApp();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    phone2: '',
    wilaya: '',
    commune: '',
    address: '',
    deliveryType: 'home' as 'home' | 'desk' | 'pickup',
    zoneId: '',
    notes: '',
    paymentMethod: 'cod' as 'cod' | 'ccp' | 'virement' | 'autre',
  });

  useEffect(() => {
    supabase.from('delivery_zones').select('*').eq('active', true).order('wilaya_name').then(({ data }) => {
      setZones(data || []);
    });
  }, []);

  const selectedZone = zones.find((z) => z.id === form.zoneId);
  const deliveryPrice =
    form.deliveryType === 'pickup'
      ? 0
      : form.deliveryType === 'home'
        ? selectedZone?.home_price || 0
        : selectedZone?.desk_price || 0;
  const total = cartTotal + deliveryPrice;

  const handleSubmit = async () => {
    setError(null);
    if (!form.name || !form.phone) {
      setError(tr('fullName', lang) + ' & ' + tr('phone', lang) + ' required');
      return;
    }
    if (form.deliveryType !== 'pickup' && !form.zoneId) {
      setError(tr('selectWilaya', lang));
      return;
    }

    setLoading(true);
    try {
      const orderNumber = generateOrderNumber();

      // Create or find client
      let clientId: string | null = null;
      const { data: existingClientId } = await supabase.rpc('find_client_by_phone', { p_phone: form.phone });

      if (existingClientId) {
        clientId = existingClientId as string;
      } else {
        const { data: newClient } = await supabase
          .from('clients')
          .insert({
            name: form.name,
            phone: form.phone,
            phone2: form.phone2 || null,
            wilaya: form.wilaya || null,
            commune: form.commune || null,
            address: form.address || null,
          })
          .select('id')
          .single();
        clientId = newClient?.id || null;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          client_id: clientId,
          client_name: form.name,
          client_phone: form.phone,
          client_phone2: form.phone2 || null,
          client_wilaya: selectedZone?.wilaya_name || null,
          client_commune: form.commune || null,
          client_address: form.address || null,
          delivery_zone_id: form.zoneId || null,
          delivery_type: form.deliveryType,
          delivery_price: deliveryPrice,
          subtotal: cartTotal,
          total,
          payment_method: form.paymentMethod,
          status: 'pending',
          notes: form.notes || null,
          source: 'online',
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      // Create order items
      const items = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(items);
      if (itemsError) throw itemsError;

      // Decrement stock
      for (const item of cart) {
        const { data: prod } = await supabase.from('products').select('stock').eq('id', item.product_id).maybeSingle();
        if (prod) {
          const { error: stockError } = await supabase.from('products').update({ stock: Math.max(0, prod.stock - item.quantity) }).eq('id', item.product_id);
          if (stockError) console.error('Stock sync error for product', item.product_id, stockError.message);
        }
      }

      // Create admin notification
      await createNotification('new_order', [
        { fr: `Nouvelle commande ${orderNumber}`, ar: `طلب جديد ${orderNumber}`, en: `New order ${orderNumber}`, dz: `Commande jdida ${orderNumber}` },
        { fr: `Commande de ${form.name} - ${formatPrice(total)}`, ar: `طلب من ${form.name} - ${formatPrice(total)}`, en: `Order from ${form.name} - ${formatPrice(total)}`, dz: `Commande men ${form.name} - ${formatPrice(total)}` },
      ], order.id, 'order');

      // Check for low/out of stock after order
      for (const item of cart) {
        const { data: prod } = await supabase.from('products').select('stock,stock_min,name_fr').eq('id', item.product_id).maybeSingle();
        if (prod) {
          const newStock = Math.max(0, prod.stock - item.quantity);
          if (newStock === 0) {
            await createNotification('out_of_stock', [
              { fr: `Rupture: ${prod.name_fr}`, ar: `نفاد: ${prod.name_fr}`, en: `Out of stock: ${prod.name_fr}`, dz: `Sali: ${prod.name_fr}` },
              { fr: `Le produit ${prod.name_fr} est en rupture de stock`, ar: `المنتج ${prod.name_fr} نفد من المخزون`, en: `Product ${prod.name_fr} is out of stock`, dz: `Lproduit ${prod.name_fr} sali men stock` },
            ], item.product_id, 'product');
          } else if (newStock <= prod.stock_min) {
            await createNotification('low_stock', [
              { fr: `Stock faible: ${prod.name_fr}`, ar: `مخزون منخفض: ${prod.name_fr}`, en: `Low stock: ${prod.name_fr}`, dz: `Stock 9lil: ${prod.name_fr}` },
              { fr: `Il reste ${newStock} unités de ${prod.name_fr}`, ar: `بقي ${newStock} وحدة من ${prod.name_fr}`, en: `${newStock} units left of ${prod.name_fr}`, dz: `B9a ${newStock} unités men ${prod.name_fr}` },
            ], item.product_id, 'product');
          }
        }
      }

      clearCart();
      navigate(`/order-success/${orderNumber}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16 lg:pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{tr('checkoutTitle', lang)}</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">{tr('contact', lang)}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{tr('fullName', lang)} *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{tr('phone', lang)} *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{tr('phone2', lang)}</label>
                  <input
                    type="tel"
                    value={form.phone2}
                    onChange={(e) => setForm({ ...form, phone2: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">{tr('delivery', lang)}</h2>

              {/* Delivery type */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { k: 'home', v: tr('homeDelivery', lang), icon: Home },
                  { k: 'desk', v: tr('deskDelivery', lang), icon: Store },
                  { k: 'pickup', v: tr('pickup', lang), icon: Truck },
                ].map((opt) => (
                  <button
                    key={opt.k}
                    onClick={() => setForm({ ...form, deliveryType: opt.k as 'home' | 'desk' | 'pickup' })}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
                      form.deliveryType === opt.k
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                    }`}
                  >
                    <opt.icon className={`w-5 h-5 ${form.deliveryType === opt.k ? 'text-pink-500' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium ${form.deliveryType === opt.k ? 'text-pink-600 dark:text-pink-400' : 'text-gray-600 dark:text-gray-300'}`}>{opt.v}</span>
                  </button>
                ))}
              </div>

              {form.deliveryType !== 'pickup' && (
                <>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{tr('wilaya', lang)} *</label>
                    <select
                      value={form.zoneId}
                      onChange={(e) => {
                        const z = zones.find((z) => z.id === e.target.value);
                        setForm({ ...form, zoneId: e.target.value, wilaya: z?.wilaya_name || '' });
                      }}
                      className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">{tr('selectWilaya', lang)}</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.wilaya_code} - {z.wilaya_name} ({formatPrice(form.deliveryType === 'home' ? z.home_price : z.desk_price)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{tr('commune', lang)}</label>
                      <input
                        type="text"
                        value={form.commune}
                        onChange={(e) => setForm({ ...form, commune: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{tr('address', lang)}</label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Payment */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">{tr('paymentMethod', lang)}</h2>
              <div className="space-y-2">
                {[
                  { k: 'cod', v: tr('cod', lang), desc: '✓' },
                  { k: 'ccp', v: 'CCP / Mandat', desc: '' },
                  { k: 'virement', v: 'Virement bancaire', desc: '' },
                ].map((opt) => (
                  <button
                    key={opt.k}
                    onClick={() => setForm({ ...form, paymentMethod: opt.k as 'cod' | 'ccp' | 'virement' | 'autre' })}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-colors ${
                      form.paymentMethod === opt.k
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                    }`}
                  >
                    <span className={`text-sm font-medium ${form.paymentMethod === opt.k ? 'text-pink-600 dark:text-pink-400' : 'text-gray-700 dark:text-gray-200'}`}>{opt.v}</span>
                    {form.paymentMethod === opt.k && <Check className="w-4 h-4 text-pink-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{tr('notes', lang)}</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">{tr('total', lang)}</h2>
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={`${item.product_id}-${item.size}-${item.color}`} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300 truncate pr-2">{item.name} ×{item.quantity}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{tr('subtotal', lang)}</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{tr('delivery', lang)}</span>
                  <span>{deliveryPrice === 0 ? '—' : formatPrice(deliveryPrice)}</span>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white">{tr('total', lang)}</span>
                  <span className="text-xl font-bold text-pink-600 dark:text-pink-400">{formatPrice(total)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-4 py-3.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow-lg disabled:opacity-50 transition-colors"
              >
                {loading ? tr('loading', lang) : tr('placeOrder', lang)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
