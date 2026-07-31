import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, Sun, Moon, Globe, Phone, MapPin } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { tr } from '@/lib/i18n';
import type { Lang } from '@/lib/types';

interface HeaderProps {
  navigate: (path: string) => void;
}

const WHATSAPP_NUMBER = '213542886457';
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=100067347612207';
const INSTAGRAM_URL = 'https://www.instagram.com/bebe.moda.style';

export function Header({ navigate }: HeaderProps) {
  const { lang, setLang, theme, toggleTheme, cartCount } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { key: 'home', path: '/' },
    { key: 'shop', path: '/shop' },
    { key: 'tips', path: '/tips' },
    { key: 'trackOrder', path: '/track' },
    { key: 'contact', path: '/contact' },
  ];

  const languages: { code: Lang; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇩🇿' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'dz', label: 'Darija', flag: '🇩🇿' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
            <img src="/image.png" alt="Bèbè Moda Style" className="h-12 lg:h-14 w-auto object-contain group-hover:scale-105 transition-transform" />
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button key={link.key} onClick={() => navigate(link.path)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                {tr(link.key, lang)}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Language */}
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-900/30 transition-colors" aria-label="Language">
                <Globe className="w-5 h-5" />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden">
                    {languages.map((l) => (
                      <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }} className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-pink-50 dark:hover:bg-pink-900/30 transition-colors ${lang === l.code ? 'text-pink-600 dark:text-pink-400 font-semibold bg-pink-50 dark:bg-pink-900/20' : 'text-gray-700 dark:text-gray-200'}`}>
                        <span className="text-lg">{l.flag}</span>{l.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-900/30 transition-colors" aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <button onClick={() => navigate('/cart')} className="relative p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-900/30 transition-colors" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in">{cartCount}</span>}
            </button>

            <button onClick={() => navigate('/admin')} className="hidden sm:block px-3 py-2 rounded-lg text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity">{tr('admin', lang)}</button>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-900/30" aria-label="Menu">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-100 dark:border-gray-700 pt-2">
            {navLinks.map((link) => (
              <button key={link.key} onClick={() => { navigate(link.path); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-900/30 transition-colors">{tr(link.key, lang)}</button>
            ))}
            <button onClick={() => { navigate('/admin'); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-900/30 transition-colors">{tr('admin', lang)}</button>
            <button onClick={() => { navigate('/pos'); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-900/30 transition-colors">{tr('pos', lang)}</button>
          </div>
        )}
      </div>
    </header>
  );
}

export function Footer({ navigate }: HeaderProps) {
  const { lang } = useApp();

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <img src="/image.png" alt="Bèbè Moda Style" className="h-16 w-auto object-contain" style={{ filter: 'brightness(1.2)' }} />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{tr('heroSubtitle', lang)}</p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{tr('shop', lang)}</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/shop')} className="hover:text-pink-400 transition-colors">{tr('allCategories', lang)}</button></li>
              <li><button onClick={() => navigate('/tips')} className="hover:text-pink-400 transition-colors">{tr('expertTips', lang)}</button></li>
              <li><button onClick={() => navigate('/track')} className="hover:text-pink-400 transition-colors">{tr('trackOrder', lang)}</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{tr('contact', lang)}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-400 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297.149-1.255.515-1.486.572-.222.058-.383.087-.543-.087-.16-.174-.543-.572-.734-.725-.174-.16-.349-.223-.6-.075-.252.149-.888.327-1.677-.515-.618-.515-1.035-1.153-1.155-1.348-.12-.195-.013-.301.131-.449.135-.149.297-.349.446-.515.149-.165.174-.287.262-.478.087-.192.044-.349-.044-.515-.131-.165-.543-1.348-.734-1.836-.193-.478-.383-.415-.543-.478-.12-.044-.262-.044-.403-.044-.149 0-.383.058-.588.287-.204.349-.734.725-.734 1.762 0 1.036.734 2.073.849 2.223.131.149 1.49 2.288 3.622 3.21 1.286.558 1.79.602 2.43.507.391-.058 1.194-.489 1.36-.961.174-.478.174-.888.131-.961-.044-.073-.174-.116-.418-.232z"/><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.3-1.25-2.81-1.25-4.36 0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42 1.56 1.56 2.42 3.63 2.42 5.82 0 4.54-3.7 8.24-8.24 8.24z"/></svg>
                  WhatsApp: +213 542 88 64 57
                </a>
              </li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /><span>+213 542 88 64 57</span></li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /><span>Algérie</span></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{tr('followUs', lang)}</h3>
            <div className="flex gap-3">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-green-600 flex items-center justify-center transition-colors" title="WhatsApp">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297.149-1.255.515-1.486.572-.222.058-.383.087-.543-.087-.16-.174-.543-.572-.734-.725-.174-.16-.349-.223-.6-.075-.252.149-.888.327-1.677-.515-.618-.515-1.035-1.153-1.155-1.348-.12-.195-.013-.301.131-.449.135-.149.297-.349.446-.515.149-.165.174-.287.262-.478.087-.192.044-.349-.044-.515-.131-.165-.543-1.348-.734-1.836-.193-.478-.383-.415-.543-.478-.12-.044-.262-.044-.403-.044-.149 0-.383.058-.588.287-.204.349-.734.725-.734 1.762 0 1.036.734 2.073.849 2.223.131.149 1.49 2.288 3.622 3.21 1.286.558 1.79.602 2.43.507.391-.058 1.194-.489 1.36-.961.174-.478.174-.888.131-.961-.044-.073-.174-.116-.418-.232z"/><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2z"/></svg>
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition-colors" title="Instagram">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.43-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.38C1.35 2.68.94 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.67.66 1.34 1.07 2.13 1.38.76.3 1.64.5 2.91.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.38.66-.67 1.07-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.38-2.13C21.32 1.35 20.65.94 19.86.63 19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0z"/><path d="M12 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4z"/><circle cx="18.41" cy="5.59" r="1.44"/></svg>
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors" title="Facebook">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Bèbè Moda Style — {tr('allRights', lang)}
        </div>
      </div>
    </footer>
  );
}
