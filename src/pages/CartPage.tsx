import { useApp } from '@/context/AppContext';
import { tr, formatPrice } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';

interface CartPageProps {
  navigate: (path: string) => void;
}

export function CartPage({ navigate }: CartPageProps) {
  const { lang, cart, updateCartQty, removeFromCart, cartTotal } = useApp();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-12 h-12 text-pink-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tr('emptyCart', lang)}</h2>
          <button
            onClick={() => navigate('/shop')}
            className="mt-4 px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold transition-colors"
          >
            {tr('continueShopping', lang)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16 lg:pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <button onClick={() => navigate('/')} className="hover:text-pink-500">{tr('home', lang)}</button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-700 dark:text-gray-200">{tr('yourCart', lang)}</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{tr('yourCart', lang)}</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item) => (
              <div
                key={`${item.product_id}-${item.size}-${item.color}`}
                className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700"
              >
                <button
                  onClick={() => navigate(`/product/${item.product_id}`)}
                  className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 shrink-0"
                >
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">👶</div>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">{item.name}</h3>
                  <div className="flex gap-2 mt-1">
                    {item.size && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{tr('size', lang)}: {item.size}</span>
                    )}
                    {item.color && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{tr('color', lang)}: {item.color}</span>
                    )}
                  </div>
                  <div className="mt-2 font-bold text-pink-600 dark:text-pink-400">{formatPrice(item.price)}</div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.product_id, item.size, item.color)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button
                      onClick={() => updateCartQty(item.product_id, item.quantity - 1, item.size, item.color)}
                      className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-pink-500"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2.5 text-sm font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQty(item.product_id, item.quantity + 1, item.size, item.color)}
                      className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-pink-500"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">{tr('total', lang)}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{tr('subtotal', lang)}</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{tr('delivery', lang)}</span>
                  <span className="text-gray-400">—</span>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white">{tr('total', lang)}</span>
                  <span className="text-xl font-bold text-pink-600 dark:text-pink-400">{formatPrice(cartTotal)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-4 py-3.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow-lg transition-colors"
              >
                {tr('checkout', lang)}
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="w-full mt-2 py-3 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {tr('continueShopping', lang)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
