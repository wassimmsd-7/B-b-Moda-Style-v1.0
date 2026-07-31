import { ShoppingCart, Eye, Star, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { tr } from '@/lib/i18n';
import { formatPrice, getProductName, getStockStatus } from '@/lib/utils';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
}

export function ProductCard({ product, navigate }: ProductCardProps) {
  const { lang, addToCart } = useApp();
  const stockStatus = getStockStatus(product.stock, product.stock_min);
  const name = getProductName(product, lang);
  const image = product.images?.[0] || '';
  const hasPromo = product.promo_price && product.promo_price > 0 && product.promo_price < product.selling_price;
  const displayPrice = hasPromo ? product.promo_price! : product.selling_price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stockStatus === 'out') return;
    addToCart({
      product_id: product.id,
      name,
      image,
      price: displayPrice,
      quantity: 1,
      size: product.sizes?.[0] || null,
      color: product.colors?.[0] || null,
      stock: product.stock,
    });
  };

  const handleDirectBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stockStatus === 'out') return;
    addToCart({
      product_id: product.id,
      name,
      image,
      price: displayPrice,
      quantity: 1,
      size: product.sizes?.[0] || null,
      color: product.colors?.[0] || null,
      stock: product.stock,
    });
    navigate('/checkout');
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">👶</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasPromo && (
            <span className="px-2 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-md">
              -{Math.round((1 - product.promo_price! / product.selling_price) * 100)}%
            </span>
          )}
          {product.is_featured && (
            <span className="px-2 py-1 rounded-full bg-amber-400 text-amber-900 text-[10px] font-bold shadow-md flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-current" />
              {tr('featured', lang)}
            </span>
          )}
        </div>

        {/* Stock badge */}
        {stockStatus === 'out' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-4 py-2 rounded-full bg-white/90 text-gray-900 text-xs font-bold">
              {tr('outOfStock', lang)}
            </span>
          </div>
        )}
        {stockStatus === 'low' && (
          <span className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-orange-500 text-white text-[10px] font-bold shadow-md">
            {tr('lowStock', lang)}
          </span>
        )}

        {/* Hover actions */}
        <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleQuickAdd}
            disabled={stockStatus === 'out'}
            className="w-9 h-9 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={tr('addToCart', lang)}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
            className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center shadow-md transition-colors"
            aria-label={tr('viewProduct', lang)}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleDirectBuy}
            disabled={stockStatus === 'out'}
            className="w-9 h-9 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={tr('directBuy', lang)}
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          {hasPromo ? (
            <>
              <span className="font-bold text-pink-600 dark:text-pink-400">
                {formatPrice(product.promo_price!)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.selling_price)}
              </span>
            </>
          ) : (
            <span className="font-bold text-gray-900 dark:text-white">
              {formatPrice(product.selling_price)}
            </span>
          )}
        </div>
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-1.5 flex gap-1 flex-wrap">
            {product.sizes.slice(0, 4).map((s) => (
              <span key={s} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px] text-gray-600 dark:text-gray-300">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
