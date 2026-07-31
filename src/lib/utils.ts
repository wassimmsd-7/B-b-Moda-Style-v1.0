import type { Lang } from './types';
export { tr } from './i18n';

export function formatPrice(amount: number, currency = 'DZD'): string {
  const formatted = new Intl.NumberFormat('fr-DZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return currency === 'DZD' ? `${formatted} DA` : `${formatted} ${currency}`;
}

export function formatDate(date: string | null, lang: Lang = 'fr'): string {
  if (!date) return '';
  const d = new Date(date);
  const locale = lang === 'ar' ? 'ar-DZ' : lang === 'en' ? 'en-US' : 'fr-DZ';
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | null, lang: Lang = 'fr'): string {
  if (!date) return '';
  const d = new Date(date);
  const locale = lang === 'ar' ? 'ar-DZ' : lang === 'en' ? 'en-US' : 'fr-DZ';
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getProductName(p: {
  name_fr: string;
  name_ar: string | null;
  name_en: string | null;
  name_dz: string | null;
}, lang: Lang): string {
  const key = `name_${lang}` as keyof typeof p;
  return (p[key] as string | null) || p.name_fr;
}

export function getCategoryName(c: {
  name_fr: string;
  name_ar: string | null;
  name_en: string | null;
  name_dz: string | null;
}, lang: Lang): string {
  const key = `name_${lang}` as keyof typeof c;
  return (c[key] as string | null) || c.name_fr;
}

export function getStockStatus(stock: number, min: number): 'in' | 'low' | 'out' {
  if (stock <= 0) return 'out';
  if (stock <= min) return 'low';
  return 'in';
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateOrderNumber(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${ymd}-${rand}`;
}

export function generateSaleNumber(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `POS-${ymd}-${rand}`;
}
