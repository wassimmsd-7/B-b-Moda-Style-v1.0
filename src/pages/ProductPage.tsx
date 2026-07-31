import { useEffect, useState } from 'react';
import { ShoppingCart, Minus, Plus, ChevronRight, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { tr, formatPrice, getProductName, getStockStatus, getCategoryName } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import type { Product, Category } from '@/lib/types';

interface ProductPageProps {
  productId: string;
  navigate: (path: string) => void;
}

export function ProductPage({ productId, navigate }: ProductPageProps) {
  const { lang, addToCart } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: prod } = await supabase.from('products').select('*').eq('id', productId).maybeSingle();
      if (!prod) {
        setLoading(false);
        return;
      }
      setProduct(prod);
      if (prod.sizes?.length) setSelectedSize(prod.sizes[0]);
      if (prod.colors?.length) setSelectedColor(prod.colors[0]);

      if (prod.category_id) {
        const { data: cat } = await supabase.from('categories').select('*').eq('id', prod.category_id).maybeSingle();
        setCategory(cat);
        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', prod.category_id)
          .eq('is_active', true)
          .neq('id', productId)
          .limit(4);
        setRelated(rel || []);
      }
      setLoading(false);
    })();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 flex items-center justify-center">
        <div className="text-gray-400">{tr('loading', lang)}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Product not found</p>
          <button onClick={() => navigate('/shop')} className="text-pink-500 font-medium">
            {tr('back', lang)}
          </button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock, product.stock_min);
  const name = getProductName(product, lang);
  const hasPromo = product.promo_price && product.promo_price > 0 && product.promo_price < product.selling_price;
  const displayPrice = hasPromo ? product.promo_price! : product.selling_price;
  const desc = lang === 'ar' ? product.description_ar : lang === 'en' ? product.description_en : product.description_fr;

  const handleAdd = () => {
    if (stockStatus === 'out') return;
    addToCart({
      product_id: product.id,
      name,
      image: product.images?.[0] || null,
      price: displayPrice,
      quantity: qty,
      size: selectedSize,
      color: selectedColor,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-pink-500">{tr('home', lang)}</button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => navigate('/shop')} className="hover:text-pink-500">{tr('shop', lang)}</button>
          {category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-700 dark:text-gray-200">{getCategoryName(category, lang)}</span>
            </>
          )}
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
              {product.images?.[selectedImage] ? (
                <img src={product.images[selectedImage]} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">👶</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-colors ${
                      selectedImage === i ? 'border-pink-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {category && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 mb-3">
                {getCategoryName(category, lang)}
              </span>
            )}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">{name}</h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              {hasPromo ? (
                <>
                  <span className="text-3xl font-bold text-pink-600 dark:text-pink-400">{formatPrice(product.promo_price!)}</span>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.selling_price)}</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                    -{Math.round((1 - product.promo_price! / product.selling_price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(product.selling_price)}</span>
              )}
            </div>

            {/* Stock */}
            <div className="mb-4">
              {stockStatus === 'in' && (
                <span className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                  <Check className="w-4 h-4" /> {tr('inStock', lang)} ({product.stock})
                </span>
              )}
              {stockStatus === 'low' && (
                <span className="inline-flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-400">
                  <Check className="w-4 h-4" /> {tr('lowStock', lang)} ({product.stock})
                </span>
              )}
              {stockStatus === 'out' && (
                <span className="inline-flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
                  {tr('outOfStock', lang)}
                </span>
              )}
            </div>

            {/* Age range */}
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              {tr('ageRange', lang)}: {product.age_min_months} - {product.age_max_months} {tr('ageRange', lang) === 'Âge (mois)' ? 'mois' : 'months'}
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">{tr('size', lang)}</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        selectedSize === s
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">{tr('color', lang)}</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        selectedColor === c
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-3 text-gray-600 dark:text-gray-300 hover:text-pink-500"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-semibold text-gray-900 dark:text-white">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="p-3 text-gray-600 dark:text-gray-300 hover:text-pink-500"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAdd}
                disabled={stockStatus === 'out'}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {added ? (
                  <><Check className="w-5 h-5" /> {tr('orderSuccess', lang)}</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> {tr('addToCart', lang)}</>
                )}
              </button>
            </div>

            {/* Description */}
            {desc && (
              <div className="mb-6">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">{tr('aboutUs', lang)}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{desc}</p>
              </div>
            )}

            {/* Trust */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="w-5 h-5 text-pink-500" />
                <span className="text-[10px] text-gray-500 dark:text-gray-400">{tr('freeShipping', lang)}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <Shield className="w-5 h-5 text-pink-500" />
                <span className="text-[10px] text-gray-500 dark:text-gray-400">{tr('codAvailable', lang)}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <RotateCcw className="w-5 h-5 text-pink-500" />
                <span className="text-[10px] text-gray-500 dark:text-gray-400">{tr('qualityGuarantee', lang)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{tr('featured', lang)}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} navigate={navigate} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
