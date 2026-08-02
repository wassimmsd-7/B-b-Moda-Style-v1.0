import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { tr, formatPrice, formatDateTime } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Package, Truck, Home, XCircle, Clock, Search } from 'lucide-react';
import type { Order, OrderItem, OrderStatus } from '@/lib/types';

interface TrackOrderPageProps {
  navigate: (path: string) => void;
}

const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const statusIcons: Record<string, typeof Package> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  delivered: Home,
  cancelled: XCircle,
  returned: XCircle,
};

export function TrackOrderPage(_props: TrackOrderPageProps) {
  const { lang } = useApp();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!orderNumber.trim() || !phone.trim()) {
      setError(tr('trackOrderBothRequired', lang));
      return;
    }
    setLoading(true);
    setError(null);
    setOrder(null);
    setItems([]);

    const { data, error } = await supabase.rpc('track_order', {
      p_order_number: orderNumber.trim(),
      p_phone: phone.trim(),
    });

    if (error) {
      setError(error.message);
    } else if (!data) {
      setError(tr('noData', lang));
    } else {
      const { items: orderItems, ...orderFields } = data as Order & { items: OrderItem[] };
      setOrder(orderFields as Order);
      setItems(orderItems || []);
    }
    setLoading(false);
  };


  const currentStep = order ? statusFlow.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16 lg:pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{tr('trackOrder', lang)}</h1>

        {/* Search */}
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder={tr('orderNumber', lang)}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            placeholder={tr('phone', lang)}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full sm:w-auto mb-6 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white text-sm font-semibold"
        >
          <Search className="w-4 h-4" /> {tr('trackOrder', lang)}
        </button>

        {loading && <div className="text-center text-gray-400 py-8">{tr('loading', lang)}</div>}
        {error && <div className="text-center text-red-500 py-8">{error}</div>}

        {order && (
          <div className="space-y-6">
            {/* Order info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{tr('orderNumber', lang)}</div>
                  <div className="font-bold text-gray-900 dark:text-white">{order.order_number}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{tr('orderDate', lang)}</div>
                  <div className="font-medium text-sm text-gray-700 dark:text-gray-200">{formatDateTime(order.created_at, lang)}</div>
                </div>
              </div>

              {/* Status timeline */}
              {order.status === 'cancelled' || order.status === 'returned' ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/30">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {tr(order.status, lang)}
                    {order.cancel_reason && ` — ${order.cancel_reason}`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  {statusFlow.map((status, i) => {
                    const Icon = statusIcons[status];
                    const isDone = i <= currentStep;
                    const isCurrent = i === currentStep;
                    return (
                      <div key={status} className="flex flex-col items-center flex-1 relative">
                        {i > 0 && (
                          <div className={`absolute top-4 -left-1/2 w-full h-0.5 ${isDone ? 'bg-pink-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                        )}
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isDone ? 'bg-pink-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-pink-200 dark:ring-pink-900/50' : ''}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`mt-1.5 text-[10px] font-medium ${isDone ? 'text-pink-600 dark:text-pink-400' : 'text-gray-400'}`}>
                          {tr(status, lang)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">{tr('orders', lang)}</h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      {item.product_name} ×{item.quantity}
                      {item.size && ` (${item.size})`}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{tr('subtotal', lang)}</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{tr('delivery', lang)}</span>
                  <span>{formatPrice(order.delivery_price)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-1">
                  <span>{tr('total', lang)}</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">{tr('delivery', lang)}</h2>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <div>{order.client_name}</div>
                <div>{order.client_phone}</div>
                {order.client_wilaya && <div>{order.client_wilaya}{order.client_commune ? `, ${order.client_commune}` : ''}</div>}
                {order.client_address && <div>{order.client_address}</div>}
                {order.delivery_tracking && (
                  <div className="mt-2 p-2 rounded-lg bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                    {tr('delivery', lang)}: {order.delivery_tracking}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
