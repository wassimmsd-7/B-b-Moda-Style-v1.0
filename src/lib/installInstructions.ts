import type { InstallPlatform } from '@/hooks/useInstallPrompt';

export interface InstallStep {
  text: string;
}

/** Instructions manuelles quand aucun prompt natif n'est disponible pour la plateforme détectée. */
export function getInstallInstructions(platform: InstallPlatform): { title: string; steps: string[] } {
  switch (platform) {
    case 'ios-safari':
      return {
        title: 'Installer sur iPhone / iPad',
        steps: [
          'Appuyez sur l\'icône Partager (le carré avec une flèche) en bas de Safari',
          'Faites défiler et appuyez sur "Sur l\'écran d\'accueil"',
          'Appuyez sur "Ajouter" en haut à droite',
        ],
      };
    case 'android-chrome':
      return {
        title: 'Installer sur Android',
        steps: [
          'Appuyez sur le menu ⋮ en haut à droite de Chrome',
          'Appuyez sur "Installer l\'application" ou "Ajouter à l\'écran d\'accueil"',
          'Confirmez l\'installation',
        ],
      };
    case 'firefox':
      return {
        title: 'Installer avec Firefox',
        steps: [
          'Appuyez sur le menu ⋮ (ou ≡) de Firefox',
          'Choisissez "Installer" ou "Ajouter à l\'écran d\'accueil"',
          'Si l\'option n\'apparaît pas, essayez d\'ouvrir ce site avec Chrome pour l\'installer',
        ],
      };
    case 'desktop-chrome':
      return {
        title: 'Installer sur ordinateur',
        steps: [
          'Repérez l\'icône d\'installation ⊕ dans la barre d\'adresse (à droite de l\'URL)',
          'Ou ouvrez le menu ⋮ en haut à droite → "Installer Bèbè Moda Style..."',
          'Confirmez dans la fenêtre qui s\'ouvre',
        ],
      };
    default:
      return {
        title: 'Installer l\'application',
        steps: [
          'Ouvrez le menu de votre navigateur',
          'Cherchez une option "Installer l\'application" ou "Ajouter à l\'écran d\'accueil"',
          'Sur mobile, vous pouvez aussi essayer avec Chrome pour la meilleure compatibilité',
        ],
      };
  }
}
