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

export const getCloudinaryUrl = (publicId: string, options: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
  crop?: string;
} = {}): string => {
  const params: string[] = [];
  if (options.width) params.push(`w_${options.width}`);
  if (options.height) params.push(`h_${options.height}`);
  if (options.quality) params.push(`q_${options.quality}`);
  if (options.format) params.push(`f_${options.format}`);
  if (options.crop) params.push(`c_${options.crop}`);
  if (params.length === 0) return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${params.join(',')}/${publicId}`;
};
