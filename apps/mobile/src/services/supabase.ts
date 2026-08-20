import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl ?? '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL and Anon Key are not set. Update app.json extra field with your Supabase credentials.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const CLOUDINARY_CLOUD_NAME =
  Constants.expoConfig?.extra?.cloudinaryCloudName ?? '';

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

  // Extract clean public_id if full URL was supplied
  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.includes('/upload/')) {
    const parts = publicIdOrUrl.split('/upload/');
    const afterUpload = parts[1];
    const subParts = afterUpload.split('/');
    // Check if subParts[0] is transformation params (doesn't start with 'v' and contains _)
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

  const cloudName = CLOUDINARY_CLOUD_NAME || 'demo';
  const transformPath = params.length > 0 ? `${params.join(',')}/` : '';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformPath}${publicId}`;
};
