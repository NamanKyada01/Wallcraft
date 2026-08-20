import { supabase, getCloudinaryUrl, CloudinaryTransformOptions } from './supabase';
import type { Wallpaper } from '../types';

export const wallpaperService = {
  async getFeatured(limit = 10): Promise<Wallpaper[]> {
    const { data, error } = await supabase
      .from('wallpapers')
      .select('*, category:categories(*)')
      .eq('is_featured', true)
      .order('download_count', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async getTrending(limit = 20): Promise<Wallpaper[]> {
    const { data, error } = await supabase
      .from('wallpapers')
      .select('*, category:categories(*)')
      .order('download_count', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async getNewArrivals(limit = 20): Promise<Wallpaper[]> {
    const { data, error } = await supabase
      .from('wallpapers')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async getByCategory(categoryId: number, page = 0, limit = 20): Promise<Wallpaper[]> {
    const from = page * limit;
    const to = from + limit - 1;
    const { data, error } = await supabase
      .from('wallpapers')
      .select('*, category:categories(*)')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: number): Promise<Wallpaper | null> {
    const { data, error } = await supabase
      .from('wallpapers')
      .select('*, category:categories(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getRandomWallpaper(): Promise<Wallpaper | null> {
    const { data, error } = await supabase
      .from('wallpapers')
      .select('*, category:categories(*)')
      .limit(30);
    if (error || !data || data.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  },

  async search(query: string, limit = 20): Promise<Wallpaper[]> {
    const { data, error } = await supabase
      .from('wallpapers')
      .select('*, category:categories(*)')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('download_count', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async getRelated(wallpaperId: number, categoryId: number | null, limit = 10): Promise<Wallpaper[]> {
    if (!categoryId) return [];
    const { data, error } = await supabase
      .from('wallpapers')
      .select('*, category:categories(*)')
      .eq('category_id', categoryId)
      .neq('id', wallpaperId)
      .order('download_count', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async recordDownload(wallpaperId: number, userId: string): Promise<void> {
    await supabase.from('downloads').insert({
      wallpaper_id: wallpaperId,
      user_id: userId,
    });
  },

  getCustomTransformUrl(cloudinaryUrl: string, options: CloudinaryTransformOptions): string {
    return getCloudinaryUrl(cloudinaryUrl, options);
  },

  getThumbnailUrl(cloudinaryUrl: string): string {
    return getCloudinaryUrl(cloudinaryUrl, {
      width: 400,
      height: 600,
      quality: 'auto:good',
      format: 'webp',
      crop: 'fill',
    });
  },

  getPreviewUrl(cloudinaryUrl: string): string {
    return getCloudinaryUrl(cloudinaryUrl, {
      width: 1080,
      quality: 'auto:best',
      format: 'webp',
    });
  },

  getLockScreenPreviewUrl(cloudinaryUrl: string): string {
    return getCloudinaryUrl(cloudinaryUrl, {
      width: 1080,
      height: 2400,
      crop: 'fill',
      quality: 'auto:best',
      format: 'webp',
    });
  },

  getBlurredBackdropUrl(cloudinaryUrl: string): string {
    return getCloudinaryUrl(cloudinaryUrl, {
      width: 400,
      quality: 'auto:eco',
      format: 'webp',
      effect: 'blur:600',
    });
  },

  getDownloadUrl(cloudinaryUrl: string): string {
    return getCloudinaryUrl(cloudinaryUrl, {
      quality: '100',
    });
  },
};
