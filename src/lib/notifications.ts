import { supabase } from './supabase';

export async function createNotification(
  type: 'new_order' | 'new_sale' | 'low_stock' | 'out_of_stock' | 'custom',
  translations: { fr: string; ar?: string; en?: string; dz?: string }[] /* [title, message] */,
  refId?: string,
  refType?: string,
) {
  const [title, message] = translations;
  await supabase.from('notifications').insert({
    type,
    title_fr: title.fr,
    title_ar: title.ar || null,
    title_en: title.en || null,
    title_dz: title.dz || null,
    message_fr: message?.fr || null,
    message_ar: message?.ar || null,
    message_en: message?.en || null,
    message_dz: message?.dz || null,
    ref_id: refId || null,
    ref_type: refType || null,
  });
}
