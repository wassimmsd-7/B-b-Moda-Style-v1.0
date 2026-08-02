import { useEffect, useState } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'bms_install_banner_dismissed';

export function InstallPrompt() {
  const { lang } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');

  useEffect(() => {
    // Already installed (standalone display mode) → never show.
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isSafari = /safari/.test(window.navigator.userAgent.toLowerCase()) && !/crios|fxios/.test(window.navigator.userAgent.toLowerCase());

    if (isIos && isSafari) {
      setShowIosHint(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (dismissed || (!deferredPrompt && !showIosHint)) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-start gap-3 animate-in slide-in-from-bottom">
      <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center shrink-0">
        <Download className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-gray-900 dark:text-white">
          {lang === 'ar' ? 'ثبت التطبيق' : 'Installer l\'application'}
        </div>
        {deferredPrompt ? (
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Accès rapide depuis votre écran d'accueil, comme une vraie app.
            </p>
            <button onClick={handleInstall} className="mt-2 px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold">
              Installer
            </button>
          </>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex flex-wrap items-center gap-1">
            Appuyez sur <Share className="w-3.5 h-3.5 inline" /> puis
            <PlusSquare className="w-3.5 h-3.5 inline" /> "Sur l'écran d'accueil"
          </p>
        )}
      </div>
      <button onClick={dismiss} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
