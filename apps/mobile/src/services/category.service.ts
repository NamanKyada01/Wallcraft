import { supabase, isSupabaseConfigured } from './supabase';
import type { Category } from '../types';

const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, name: 'Nature', slug: 'nature', icon: '🌿', color: '#22C55E', sort_order: 1 },
  { id: 2, name: 'Abstract', slug: 'abstract', icon: '🔮', color: '#A855F7', sort_order: 2 },
  { id: 3, name: 'Minimal', slug: 'minimal', icon: '⚪', color: '#6366F1', sort_order: 3 },
  { id: 4, name: 'Dark Mode', slug: 'dark', icon: '🌑', color: '#374151', sort_order: 4 },
  { id: 5, name: 'Space & Cyber', slug: 'space', icon: '🚀', color: '#1E40AF', sort_order: 5 },
  { id: 6, name: 'Anime & Art', slug: 'anime', icon: '🎨', color: '#EC4899', sort_order: 6 },
  { id: 7, name: 'City & Neon', slug: 'city', icon: '🏙️', color: '#F97316', sort_order: 7 },
  { id: 8, name: 'Technology', slug: 'technology', icon: '⚡', color: '#06B6D4', sort_order: 8 },
];

export const categoryService = {
  async getAll(): Promise<Category[]> {
    if (!isSupabaseConfigured) return FALLBACK_CATEGORIES;
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error || !data || data.length === 0) return FALLBACK_CATEGORIES;
      return data;
    } catch {
      return FALLBACK_CATEGORIES;
    }
  },

  async getById(id: number): Promise<Category | null> {
    if (!isSupabaseConfigured) {
      return FALLBACK_CATEGORIES.find((c) => c.id === id) ?? null;
    }
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) return FALLBACK_CATEGORIES.find((c) => c.id === id) ?? null;
      return data;
    } catch {
      return FALLBACK_CATEGORIES.find((c) => c.id === id) ?? null;
    }
  },
};
