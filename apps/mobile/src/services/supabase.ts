import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const rawSupabaseUrl = Constants.expoConfig?.extra?.supabaseUrl ?? '';
const rawSupabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey ?? '';

const isValidHttpUrl = (url: string) =>
  typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));

export const isSupabaseConfigured =
  isValidHttpUrl(rawSupabaseUrl) &&
  Boolean(rawSupabaseAnonKey) &&
  rawSupabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

const supabaseUrl = isSupabaseConfigured
  ? rawSupabaseUrl
  : 'https://placeholder-project.supabase.co';

const supabaseAnonKey = isSupabaseConfigured
  ? rawSupabaseAnonKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const CLOUDINARY_CLOUD_NAME =
  Constants.expoConfig?.extra?.cloudinaryCloudName &&
  Constants.expoConfig?.extra?.cloudinaryCloudName !== 'YOUR_CLOUDINARY_CLOUD_NAME'
    ? Constants.expoConfig.extra.cloudinaryCloudName
    : 'demo';

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'thumb';
  effect?: string;
  gravity?: 'auto' | 'face' | 'center';
}

export const getCloudinaryUrl = (
  publicIdOrUrl: string,
  options: CloudinaryTransformOptions = {}
): string => {
  if (!publicIdOrUrl) return '';

  // If it's a direct non-cloudinary external URL (e.g. unsplash), return directly
  if (publicIdOrUrl.startsWith('http') && !publicIdOrUrl.includes('cloudinary.com')) {
    return publicIdOrUrl;
  }

  // Extract clean public_id if full URL was supplied
  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.includes('/upload/')) {
    const parts = publicIdOrUrl.split('/upload/');
    const afterUpload = parts[1];
    const subParts = afterUpload.split('/');
    if (subParts.length > 1 && !subParts[0].startsWith('v') && subParts[0].includes('_')) {
      publicId = subParts.slice(1).join('/');
    } else {
      publicId = afterUpload;
    }
  }

  const params: string[] = [];
  if (options.crop) params.push(`c_${options.crop}`);
  if (options.width) params.push(`w_${options.width}`);
  if (options.height) params.push(`h_${options.height}`);
  if (options.gravity) params.push(`g_${options.gravity}`);
  if (options.quality) params.push(`q_${options.quality}`);
  if (options.format) params.push(`f_${options.format}`);
  if (options.effect) params.push(`e_${options.effect}`);

  const transformPath = params.length > 0 ? `${params.join(',')}/` : '';
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformPath}${publicId}`;
};
