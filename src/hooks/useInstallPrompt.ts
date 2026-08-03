import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallPlatform = 'ios-safari' | 'android-chrome' | 'desktop-chrome' | 'firefox' | 'other';

/**
 * Centralise la détection "l'app est installable" pour toute l'app.
 *
 * IMPORTANT : l'événement natif `beforeinstallprompt` (Chrome/Edge/Android)
 * ne se déclenche PAS toujours immédiatement (heuristiques d'engagement de
 * Chrome), et n'existe carrément PAS sur iOS Safari, Safari Desktop, ni
 * Firefox. Si on cache le bouton tant que cet événement n'est pas reçu,
 * une grande partie des visiteurs ne voit jamais aucun moyen d'installer,
 * même si l'app EST installable manuellement chez eux.
 *
 * On affiche donc TOUJOURS le bouton "Installer l'app" (sauf si l'app est
 * déjà installée), et on adapte le comportement au clic :
 * - Si le prompt natif est disponible → on l'ouvre directement.
 * - Sinon → on affiche des instructions adaptées à la plateforme détectée.
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform>('other');

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
    const isAndroid = /android/.test(ua);
    const isFirefox = /firefox|fxios/.test(ua);
    const isChromium = /chrome|crios|edg/.test(ua);

    if (isIosDevice && isSafari) setPlatform('ios-safari');
    else if (isAndroid && isChromium) setPlatform('android-chrome');
    else if (isFirefox) setPlatform('firefox');
    else if (isChromium) setPlatform('desktop-chrome');
    else setPlatform('other');

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

  // Toujours affichable tant que l'app n'est pas déjà installée : on ne
  // dépend plus uniquement de la disponibilité du prompt natif.
  const canInstall = !isInstalled;
  const hasNativePrompt = !!deferredPrompt;

  return { canInstall, isInstalled, platform, hasNativePrompt, promptInstall };
}
