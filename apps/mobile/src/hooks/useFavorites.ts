import { useState, useEffect, useCallback } from 'react';
import type { Favorite } from '../types';
import { favoritesService } from '../services/favorites.service';

export function useFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await favoritesService.getAll(userId);
      setFavorites(data);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = useCallback(async (wallpaperId: number) => {
    if (!userId) return;
    try {
      const isFav = favorites.some((f) => f.wallpaper_id === wallpaperId);
      if (isFav) {
        await favoritesService.remove(userId, wallpaperId);
        setFavorites((prev) => prev.filter((f) => f.wallpaper_id !== wallpaperId));
      } else {
        await favoritesService.add(userId, wallpaperId);
        const newFav: Favorite = {
          id: Date.now(),
          user_id: userId,
          wallpaper_id: wallpaperId,
          created_at: new Date().toISOString(),
        };
        setFavorites((prev) => [newFav, ...prev]);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, [userId, favorites]);

  const isFavorite = useCallback((wallpaperId: number) => {
    return favorites.some((f) => f.wallpaper_id === wallpaperId);
  }, [favorites]);

  return { favorites, loading, toggleFavorite, isFavorite, refresh: fetchFavorites };
}
