import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Lang, Theme, CartItem } from '@/lib/types';

interface AppContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string | null, color: string | null) => void;
  updateCartQty: (productId: string, qty: number, size: string | null, color: string | null) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  staffRole: 'superadmin' | 'owner' | 'cashier' | null;
  setStaffRole: (r: 'superadmin' | 'owner' | 'cashier' | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('bms_lang') as Lang) || 'fr';
  });
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('bms_theme') as Theme) || 'light';
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bms_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [staffRole, setStaffRole] = useState<AppContextValue['staffRole']>(null);

  useEffect(() => {
    localStorage.setItem('bms_lang', lang);
    document.documentElement.lang = lang === 'ar' ? 'ar' : lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('bms_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('bms_cart', JSON.stringify(cart));
  }, [cart]);

  const setLang = (l: Lang) => setLangState(l);
  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.product_id === item.product_id && i.size === item.size && i.color === item.color,
      );
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) } : i,
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string, size: string | null, color: string | null) => {
    setCart((prev) =>
      prev.filter(
        (i) => !(i.product_id === productId && i.size === size && i.color === color),
      ),
    );
  };

  const updateCartQty = (productId: string, qty: number, size: string | null, color: string | null) => {
    if (qty <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product_id === productId && i.size === size && i.color === color
          ? { ...i, quantity: Math.min(qty, i.stock) }
          : i,
      ),
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        theme,
        setTheme,
        toggleTheme,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartTotal,
        cartCount,
        staffRole,
        setStaffRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
