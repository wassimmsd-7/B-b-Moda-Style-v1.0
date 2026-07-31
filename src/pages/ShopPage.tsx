import { useEffect, useState, useMemo } from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { tr, getCategoryName } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import type { Product, Category } from '@/lib/types';

interface ShopPageProps {
  navigate: (path: string) => void;
}

export function ShopPage({ navigate }: ShopPageProps) {
  const { lang } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [maxAge, setMaxAge] = useState<number>(36);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const cat = params.get('cat');
    if (cat) setSelectedCat(cat);
  }, []);

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('categories').select('*').eq('active', true).order('sort_order'),
        supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }),
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.name_fr.toLowerCase().includes(q) ||
        p.name_ar?.toLowerCase().includes(q) ||
        p.name_en?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (selectedCat) result = result.filter((p) => p.category_id === selectedCat);
    if (selectedGender) result = result.filter((p) => p.gender === selectedGender);
    if (selectedSeason) result = result.filter((p) => p.season === selectedSeason || p.season === 'all');
    result = result.filter((p) => p.age_max_months >= maxAge || p.age_min_months <= maxAge);

    switch (sortBy) {
      case 'priceLowHigh':
        result.sort((a, b) => (a.promo_price || a.selling_price) - (b.promo_price || b.selling_price));
        break;
      case 'priceHighLow':
        result.sort((a, b) => (b.promo_price || b.selling_price) - (a.promo_price || a.selling_price));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [products, search, selectedCat, selectedGender, selectedSeason, maxAge, sortBy]);

  const clearFilters = () => {
    setSelectedCat(null);
    setSelectedGender(null);
    setSelectedSeason(null);
    setMaxAge(36);
    setSearch('');
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">{tr('categories', lang)}</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => setSelectedCat(null)}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !selectedCat
                ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 font-medium'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {tr('allCategories', lang)}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCat === cat.id
                  ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {getCategoryName(cat, lang)}
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">{tr('gender', lang)}</h3>
        <div className="flex flex-wrap gap-2">
          {[{ k: 'boy', v: tr('boy', lang) }, { k: 'girl', v: tr('girl', lang) }, { k: 'unisex', v: tr('unisex', lang) }].map((g) => (
            <button
              key={g.k}
              onClick={() => setSelectedGender(selectedGender === g.k ? null : g.k)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedGender === g.k
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {g.v}
            </button>
          ))}
        </div>
      </div>

      {/* Season */}
      <div>
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">{tr('season', lang)}</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { k: 'spring', v: tr('spring', lang) },
            { k: 'summer', v: tr('summer', lang) },
            { k: 'autumn', v: tr('autumn', lang) },
            { k: 'winter', v: tr('winter', lang) },
          ].map((s) => (
            <button
              key={s.k}
              onClick={() => setSelectedSeason(selectedSeason === s.k ? null : s.k)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedSeason === s.k
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {s.v}
            </button>
          ))}
        </div>
      </div>

      {/* Age */}
      <div>
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
          {tr('ageRange', lang)}: 0-{maxAge}
        </h3>
        <input
          type="range"
          min="0"
          max="36"
          value={maxAge}
          onChange={(e) => setMaxAge(Number(e.target.value))}
          className="w-full accent-pink-500"
        />
      </div>

      <button
        onClick={clearFilters}
        className="w-full py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        {tr('clearFilters', lang)}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tr('shop', lang)}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} {tr('results', lang)}
          </p>
        </div>

        {/* Search + sort bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tr('searchPlaceholder', lang)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="newest">{tr('newest', lang)}</option>
            <option value="priceLowHigh">{tr('priceLowHigh', lang)}</option>
            <option value="priceHighLow">{tr('priceHighLow', lang)}</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-6">
          {/* Desktop filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <FilterContent />
            </div>
          </aside>

          {/* Mobile filter drawer */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
              <div className="relative w-80 max-w-[85%] bg-white dark:bg-gray-800 p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 dark:text-white">{tr('filter', lang)}</h2>
                  <button onClick={() => setShowFilters(false)} className="p-1 text-gray-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterContent />
              </div>
            </div>
          )}

          {/* Products grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 dark:text-gray-400">{tr('noResults', lang)}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} navigate={navigate} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
