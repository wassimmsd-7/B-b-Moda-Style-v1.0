import { useState } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

const DISMISS_KEY = 'bms_install_banner_dismissed';

/** Bannière discrète en bas d'écran, proposée une fois puis mémorisée comme "vue". */
export function InstallPrompt() {
  const { canInstall, hasNativePrompt, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  if (dismissed || !canInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-start gap-3 animate-in slide-in-from-bottom">
      <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center shrink-0">
        <Download className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-gray-900 dark:text-white">
          Installer l'application
        </div>
        {hasNativePrompt ? (
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Accès rapide depuis votre écran d'accueil, comme une vraie app.
            </p>
            <button onClick={promptInstall} className="mt-2 px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold">
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
