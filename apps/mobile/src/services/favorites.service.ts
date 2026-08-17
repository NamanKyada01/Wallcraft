import { supabase } from './supabase';
import type { Favorite } from '../types';

export const favoritesService = {
  async getAll(userId: string): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, wallpaper:wallpapers(*, category:categories(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async add(userId: string, wallpaperId: number): Promise<void> {
    const { error } = await supabase.from('favorites').insert({
      user_id: userId,
      wallpaper_id: wallpaperId,
    });
    if (error) throw error;
  },

  async remove(userId: string, wallpaperId: number): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('wallpaper_id', wallpaperId);
    if (error) throw error;
  },

  async isFavorite(userId: string, wallpaperId: number): Promise<boolean> {
    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('wallpaper_id', wallpaperId);
    if (error) throw error;
    return (count ?? 0) > 0;
  },

  async getCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) throw error;
    return count ?? 0;
  },
};
