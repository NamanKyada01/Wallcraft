import { useState, useEffect, useCallback } from 'react';
import type { Wallpaper } from '../types';
import { wallpaperService } from '../services/wallpaper.service';

export function useWallpapers(categoryId?: number) {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchWallpapers = useCallback(async (pageNum: number = 0) => {
    try {
      setLoading(true);
      let data: Wallpaper[];

      if (categoryId) {
        data = await wallpaperService.getByCategory(categoryId, pageNum);
      } else {
        data = pageNum === 0
          ? await wallpaperService.getNewArrivals()
          : await wallpaperService.getNewArrivals();
      }

      if (pageNum === 0) {
        setWallpapers(data);
      } else {
        setWallpapers((prev) => [...prev, ...data]);
      }
      setHasMore(data.length >= 20);
    } catch (error) {
      console.error('Failed to fetch wallpapers:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchWallpapers(nextPage);
    }
  }, [hasMore, loading, page, fetchWallpapers]);

  const refresh = useCallback(() => {
    setPage(0);
    fetchWallpapers(0);
  }, [fetchWallpapers]);

  useEffect(() => {
    fetchWallpapers(0);
  }, [fetchWallpapers]);

  return { wallpapers, loading, hasMore, loadMore, refresh };
}
