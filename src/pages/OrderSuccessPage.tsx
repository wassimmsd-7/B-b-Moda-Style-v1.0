import { useApp } from '@/context/AppContext';
import { tr } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface OrderSuccessPageProps {
  orderNumber: string;
  navigate: (path: string) => void;
}

export function OrderSuccessPage({ orderNumber, navigate }: OrderSuccessPageProps) {
  const { lang } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6 animate-in zoom-in">
          <CheckCircle2 className="w-14 h-14 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tr('orderSuccess', lang)}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{tr('orderSuccessMsg', lang)}</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{tr('orderNumber', lang)}</div>
          <div className="font-bold text-lg text-pink-600 dark:text-pink-400">{orderNumber}</div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/track')}
            className="px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold transition-colors"
          >
            {tr('trackOrder', lang)}
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {tr('continueShopping', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
