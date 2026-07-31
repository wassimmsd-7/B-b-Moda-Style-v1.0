import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Without these, createClient() throws and the app renders a blank white
  // page with no explanation. This makes the real problem visible instead.
  const msg =
    'Supabase n\'est pas configuré : VITE_SUPABASE_URL et/ou VITE_SUPABASE_ANON_KEY sont manquants. ' +
    'En local, vérifiez le fichier .env. Sur votre hébergeur (Vercel/Netlify), ajoutez ces variables ' +
    'dans les paramètres du projet (Environment Variables) puis redéployez.';
  console.error(msg);
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    if (root && !root.hasChildNodes()) {
      root.innerHTML = `<div style="font-family:sans-serif;max-width:600px;margin:60px auto;padding:24px;background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;color:#881337">${msg}</div>`;
    }
  });
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
