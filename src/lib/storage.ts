import { supabase } from './supabase';

const BUCKET = 'product-images';
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export interface UploadResult {
  url: string | null;
  error: string | null;
}

/**
 * Uploads a single image file (from a phone camera, gallery, or computer)
 * to the public "product-images" Supabase Storage bucket and returns its
 * public URL. Requires the caller to be authenticated (RLS on the bucket
 * restricts uploads to active staff — see the storage migration).
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: null, error: 'Format non supporté. Utilisez JPG, PNG, WEBP ou GIF.' };
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { url: null, error: `Image trop lourde (max ${MAX_SIZE_MB} Mo).` };
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
  });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export async function uploadImages(files: FileList | File[]): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = [];
  const errors: string[] = [];
  for (const file of Array.from(files)) {
    const { url, error } = await uploadImage(file);
    if (url) urls.push(url);
    if (error) errors.push(`${file.name}: ${error}`);
  }
  return { urls, errors };
}
