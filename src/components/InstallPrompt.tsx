import { useState } from 'react';
import { X, Download } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { getInstallInstructions } from '@/lib/installInstructions';

const DISMISS_KEY = 'bms_install_banner_dismissed';

/** Bannière discrète en bas d'écran, proposée une fois puis mémorisée comme "vue". */
export function InstallPrompt() {
  const { canInstall, hasNativePrompt, platform, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');
  const [showSteps, setShowSteps] = useState(false);

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  if (dismissed || !canInstall) return null;

  const instructions = getInstallInstructions(platform);

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 animate-in slide-in-from-bottom">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 dark:text-white">
            Installer l'application
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Accès rapide depuis votre écran d'accueil, comme une vraie app.
          </p>
          <button
            onClick={() => (hasNativePrompt ? promptInstall() : setShowSteps((v) => !v))}
            className="mt-2 px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold"
          >
            Installer
          </button>
        </div>
        <button onClick={dismiss} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
      {showSteps && !hasNativePrompt && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
          <p className="font-semibold mb-1.5">{instructions.title}</p>
          <ol className="space-y-1 list-decimal list-inside">
            {instructions.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}
