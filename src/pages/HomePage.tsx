import { useEffect, useState } from 'react';
import { ShoppingBag, Truck, Shield, Sparkles, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { tr, formatPrice, getProductName, getCategoryName } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import type { Product, Category, ExpertTip } from '@/lib/types';

interface HomePageProps {
  navigate: (path: string) => void;
}

export function HomePage({ navigate }: HomePageProps) {
  const { lang } = useApp();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tips, setTips] = useState<ExpertTip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: prods }, { data: tps }] = await Promise.all([
        supabase.from('categories').select('*').eq('active', true).order('sort_order'),
        supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(8),
        supabase.from('expert_tips').select('*').eq('active', true).limit(3),
      ]);
      setCategories(cats || []);
      setFeatured(prods || []);
      setTips(tps || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="relative pt-16 lg:pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-pink-50 to-amber-50 dark:from-pink-950/40 dark:via-gray-900 dark:to-gray-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                {tr('qualityGuarantee', lang)}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                {tr('heroTitle', lang)}
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto lg:mx-0">
                {tr('heroSubtitle', lang)}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/shop')}
                  className="px-8 py-3.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  {tr('heroCta', lang)}
                </button>
                <button
                  onClick={() => navigate('/tips')}
                  className="px-8 py-3.5 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  {tr('expertTips', lang)}
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {featured.slice(0, 4).map((p, i) => (
                  <div
                    key={p.id}
                    className={`rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform ${
                      i % 2 === 0 ? 'mt-8' : ''
                    }`}
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    <div className="aspect-square bg-white dark:bg-gray-800">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">👶</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white dark:bg-gray-900 py-6 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center">
                <Truck className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900 dark:text-white">{tr('freeShipping', lang)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900 dark:text-white">{tr('codAvailable', lang)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900 dark:text-white">{tr('qualityGuarantee', lang)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{tr('categories', lang)}</h2>
          <button onClick={() => navigate('/shop')} className="text-sm text-pink-500 hover:text-pink-600 font-medium flex items-center gap-1">
            {tr('allCategories', lang)} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/shop?cat=${cat.id}`)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-800 hover:shadow-lg transition-all hover:scale-105 border border-gray-100 dark:border-gray-700"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: (cat.color || '#ec4899') + '20' }}
              >
                <span style={{ color: cat.color || '#ec4899' }} className="text-2xl">●</span>
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200 text-center">
                {getCategoryName(cat, lang)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{tr('featured', lang)}</h2>
          <button onClick={() => navigate('/shop')} className="text-sm text-pink-500 hover:text-pink-600 font-medium flex items-center gap-1">
            {tr('shop', lang)} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
        )}
      </section>

      {/* Expert tips preview */}
      {tips.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{tr('expertTips', lang)}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tr('tipsSubtitle', lang)}</p>
            </div>
            <button onClick={() => navigate('/tips')} className="text-sm text-pink-500 hover:text-pink-600 font-medium flex items-center gap-1">
              {tr('tips', lang)} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tips.map((tip) => (
              <div key={tip.id} className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
                <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center mb-3">
                  <span className="text-xl">💡</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {lang === 'ar' ? tip.title_ar : lang === 'en' ? tip.title_en : tip.title_fr}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {lang === 'ar' ? tip.content_ar : lang === 'en' ? tip.content_en : tip.content_fr}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
