import { useState, useEffect, useCallback } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'shop' }
  | { name: 'product'; id: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'orderSuccess'; orderNumber: string }
  | { name: 'trackOrder' }
  | { name: 'tips' }
  | { name: 'contact' }
  | { name: 'admin' }
  | { name: 'pos' }
  | { name: 'staffLogin' };

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/');

  if (!parts[0] || parts[0] === 'home') return { name: 'home' };
  if (parts[0] === 'shop') return { name: 'shop' };
  if (parts[0] === 'product' && parts[1]) return { name: 'product', id: parts[1] };
  if (parts[0] === 'cart') return { name: 'cart' };
  if (parts[0] === 'checkout') return { name: 'checkout' };
  if (parts[0] === 'order-success' && parts[1]) return { name: 'orderSuccess', orderNumber: parts[1] };
  if (parts[0] === 'track') return { name: 'trackOrder' };
  if (parts[0] === 'tips') return { name: 'tips' };
  if (parts[0] === 'contact') return { name: 'contact' };
  if (parts[0] === 'admin') return { name: 'admin' };
  if (parts[0] === 'pos') return { name: 'pos' };
  if (parts[0] === 'login') return { name: 'staffLogin' };
  return { name: 'home' };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const handler = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  return { route, navigate };
}
