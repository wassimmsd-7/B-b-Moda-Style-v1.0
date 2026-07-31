import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { tr } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { ExpertTip } from '@/lib/types';

interface TipsPageProps {
  navigate: (path: string) => void;
}

const tipCategories = [
  { k: 'all', icon: '📚' },
  { k: 'nutrition', icon: '🍎' },
  { k: 'sante', icon: '❤️' },
  { k: 'developpement', icon: '🧠' },
  { k: 'vetements', icon: '👕' },
  { k: 'securite', icon: '🛡️' },
  { k: 'general', icon: '💡' },
];

export function TipsPage({ navigate }: TipsPageProps) {
  const { lang } = useApp();
  const [tips, setTips] = useState<ExpertTip[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('expert_tips').select('*').eq('active', true).then(({ data }) => {
      setTips(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = filter === 'all' ? tips : tips.filter((t) => t.category === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16 lg:pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tr('expertTips', lang)}</h1>
          <p className="text-gray-500 dark:text-gray-400">{tr('tipsSubtitle', lang)}</p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tipCategories.map((cat) => (
            <button
              key={cat.k}
              onClick={() => setFilter(cat.k)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === cat.k
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/30'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.k === 'all' ? tr('allCategories', lang) : cat.k}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">{tr('loading', lang)}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((tip) => (
              <div
                key={tip.id}
                className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center text-2xl shrink-0">
                    {tipCategories.find((c) => c.k === tip.category)?.icon || '💡'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {lang === 'ar' ? tip.title_ar : lang === 'en' ? tip.title_en : tip.title_fr}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {lang === 'ar' ? tip.content_ar : lang === 'en' ? tip.content_en : tip.content_fr}
                    </p>
                    <div className="mt-2 text-xs text-pink-500">
                      {tip.age_min_months} - {tip.age_max_months} {tr('ageRange', lang) === 'Âge (mois)' ? 'mois' : 'months'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
