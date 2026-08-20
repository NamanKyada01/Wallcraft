import { supabase, getCloudinaryUrl, CloudinaryTransformOptions, isSupabaseConfigured } from './supabase';
import type { Wallpaper } from '../types';

const FALLBACK_WALLPAPERS: Wallpaper[] = [
  {
    id: 1,
    title: 'Neon Crystal Horizon',
    description: 'Stunning futuristic crystal geometry with neon purple and cyan illumination.',
    cloudinary_id: 'samples/landscapes/beach-boat',
    cloudinary_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&q=80',
    category_id: 2,
    category: { id: 2, name: 'Abstract', slug: 'abstract', icon: '🔮', color: '#A855F7', sort_order: 2 },
    tags: ['abstract', 'neon', 'cyberpunk', '4k'],
    is_featured: true,
    is_premium: false,
    download_count: 1420,
    width: 2160,
    height: 3840,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Cosmic Nebula Odyssey',
    description: 'Deep space galactic stars and luminous stellar dust.',
    cloudinary_id: 'samples/landscapes/nature-mountains',
    cloudinary_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1080&q=80',
    category_id: 5,
    category: { id: 5, name: 'Space & Cyber', slug: 'space', icon: '🚀', color: '#1E40AF', sort_order: 5 },
    tags: ['space', 'nebula', 'galaxy', 'dark'],
    is_featured: true,
    is_premium: false,
    download_count: 980,
    width: 1440,
    height: 3120,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Minimalist Alpine Dusk',
    description: 'Serene mountain peaks silhouetted against glowing twilight.',
    cloudinary_id: 'samples/animals/kitten-playing',
    cloudinary_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1080&q=80',
    category_id: 1,
    category: { id: 1, name: 'Nature', slug: 'nature', icon: '🌿', color: '#22C55E', sort_order: 1 },
    tags: ['nature', 'mountains', 'minimal', 'calm'],
    is_featured: true,
    is_premium: false,
    download_count: 2310,
    width: 1080,
    height: 2400,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Cyberpunk Tokyo Night',
    description: 'Vibrant neon street lights reflecting in rain puddles in Shinjuku.',
    cloudinary_id: 'samples/people/smiling-man',
    cloudinary_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1080&q=80',
    category_id: 7,
    category: { id: 7, name: 'City & Neon', slug: 'city', icon: '🏙️', color: '#F97316', sort_order: 7 },
    tags: ['city', 'neon', 'tokyo', 'cyberpunk'],
    is_featured: true,
    is_premium: false,
    download_count: 3150,
    width: 1080,
    height: 2400,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    title: 'Obsidian Velvet Waves',
    description: 'Sleek dark fluid silk ribbons for OLED dark mode screens.',
    cloudinary_id: 'samples/food/pot-mussels',
    cloudinary_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1080&q=80',
    category_id: 4,
    category: { id: 4, name: 'Dark Mode', slug: 'dark', icon: '🌑', color: '#374151', sort_order: 4 },
    tags: ['dark', 'oled', 'minimal', 'black'],
    is_featured: false,
    is_premium: false,
    download_count: 4200,
    width: 1440,
    height: 3200,
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    title: 'Sakura Anime Dreams',
    description: 'Cherry blossom petals floating gracefully over traditional Japanese pagoda.',
    cloudinary_id: 'samples/food/spices',
    cloudinary_url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?w=1080&q=80',
    category_id: 6,
    category: { id: 6, name: 'Anime & Art', slug: 'anime', icon: '🎨', color: '#EC4899', sort_order: 6 },
    tags: ['anime', 'sakura', 'japan', 'pink'],
    is_featured: false,
    is_premium: false,
    download_count: 1890,
    width: 1080,
    height: 2400,
    created_at: new Date().toISOString(),
  },
];

export const wallpaperService = {
  async getFeatured(limit = 10): Promise<Wallpaper[]> {
    if (!isSupabaseConfigured) return FALLBACK_WALLPAPERS.slice(0, limit);
    try {
      const { data, error } = await supabase
        .from('wallpapers')
        .select('*, category:categories(*)')
        .eq('is_featured', true)
        .order('download_count', { ascending: false })
        .limit(limit);
      if (error || !data || data.length === 0) return FALLBACK_WALLPAPERS.slice(0, limit);
      return data;
    } catch {
      return FALLBACK_WALLPAPERS.slice(0, limit);
    }
  },

  async getTrending(limit = 20): Promise<Wallpaper[]> {
    if (!isSupabaseConfigured) return FALLBACK_WALLPAPERS.slice(0, limit);
    try {
      const { data, error } = await supabase
        .from('wallpapers')
        .select('*, category:categories(*)')
        .order('download_count', { ascending: false })
        .limit(limit);
      if (error || !data || data.length === 0) return FALLBACK_WALLPAPERS.slice(0, limit);
      return data;
    } catch {
      return FALLBACK_WALLPAPERS.slice(0, limit);
    }
  },

  async getNewArrivals(limit = 20): Promise<Wallpaper[]> {
    if (!isSupabaseConfigured) return FALLBACK_WALLPAPERS.slice(0, limit);
    try {
      const { data, error } = await supabase
        .from('wallpapers')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error || !data || data.length === 0) return FALLBACK_WALLPAPERS.slice(0, limit);
      return data;
    } catch {
      return FALLBACK_WALLPAPERS.slice(0, limit);
    }
  },

  async getByCategory(categoryId: number, page = 0, limit = 20): Promise<Wallpaper[]> {
    if (!isSupabaseConfigured) {
      return FALLBACK_WALLPAPERS.filter((w) => w.category_id === categoryId).slice(0, limit);
    }
    try {
      const from = page * limit;
      const to = from + limit - 1;
      const { data, error } = await supabase
        .from('wallpapers')
        .select('*, category:categories(*)')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error || !data || data.length === 0) {
        return FALLBACK_WALLPAPERS.filter((w) => w.category_id === categoryId).slice(0, limit);
      }
      return data;
    } catch {
      return FALLBACK_WALLPAPERS.filter((w) => w.category_id === categoryId).slice(0, limit);
    }
  },

  async getById(id: number): Promise<Wallpaper | null> {
    if (!isSupabaseConfigured) {
      return FALLBACK_WALLPAPERS.find((w) => w.id === id) ?? FALLBACK_WALLPAPERS[0];
    }
    try {
      const { data, error } = await supabase
        .from('wallpapers')
        .select('*, category:categories(*)')
        .eq('id', id)
        .single();
      if (error || !data) return FALLBACK_WALLPAPERS.find((w) => w.id === id) ?? FALLBACK_WALLPAPERS[0];
      return data;
    } catch {
      return FALLBACK_WALLPAPERS.find((w) => w.id === id) ?? FALLBACK_WALLPAPERS[0];
    }
  },

  async getRandomWallpaper(): Promise<Wallpaper | null> {
    try {
      const list = await this.getTrending(20);
      if (!list || list.length === 0) return FALLBACK_WALLPAPERS[0];
      const randomIndex = Math.floor(Math.random() * list.length);
      return list[randomIndex];
    } catch {
      return FALLBACK_WALLPAPERS[0];
    }
  },

  async search(query: string, limit = 20): Promise<Wallpaper[]> {
    if (!isSupabaseConfigured) {
      const q = query.toLowerCase();
      return FALLBACK_WALLPAPERS.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.description?.toLowerCase().includes(q) ||
          w.tags.some((t) => t.toLowerCase().includes(q))
      ).slice(0, limit);
    }
    try {
      const { data, error } = await supabase
        .from('wallpapers')
        .select('*, category:categories(*)')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('download_count', { ascending: false })
        .limit(limit);
      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  },

  async getRelated(wallpaperId: number, categoryId: number | null, limit = 10): Promise<Wallpaper[]> {
    const list = await this.getTrending(10);
    return list.filter((w) => w.id !== wallpaperId).slice(0, limit);
  },

  async recordDownload(wallpaperId: number, userId: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('downloads').insert({
        wallpaper_id: wallpaperId,
        user_id: userId,
      });
    } catch {
      // ignore
    }
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
