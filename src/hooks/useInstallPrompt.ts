import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Centralise la détection "l'app est installable" pour toute l'app :
 * - Android/Chrome/Edge : écoute l'événement natif `beforeinstallprompt`
 * - iOS/Safari : ne supporte pas cet événement, on détecte l'OS pour
 *   afficher l'instruction manuelle ("Partager → Sur l'écran d'accueil")
 * - Détecte aussi si l'app tourne déjà en mode standalone (déjà installée)
 *   pour ne jamais proposer d'installer une app déjà installée.
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua);
    const safari = /safari/.test(ua) && !/crios|fxios/.test(ua);
    setIsIos(iosDevice && safari);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => setIsInstalled(true);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  // "Installable" = soit le navigateur propose le prompt natif (Android/Desktop Chrome),
  // soit on est sur iOS/Safari où seule l'instruction manuelle est possible.
  const canInstall = !isInstalled && (!!deferredPrompt || isIos);

  return { canInstall, isInstalled, isIos, hasNativePrompt: !!deferredPrompt, promptInstall };
}
