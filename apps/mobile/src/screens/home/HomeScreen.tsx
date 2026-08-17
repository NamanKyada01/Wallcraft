import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { FeaturedCarousel } from '../../components/FeaturedCarousel';
import { CategoryChip } from '../../components/CategoryChip';
import { WallpaperCard } from '../../components/WallpaperCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { wallpaperService } from '../../services/wallpaper.service';
import { categoryService } from '../../services/category.service';
import { useAuth } from '../../hooks/useAuth';
import colors from '../../theme/colors';
import type { Category, Wallpaper } from '../../types';
import type { MainStackParamList, TabParamList } from '../../navigation/MainNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavProp = NativeStackNavigationProp<MainStackParamList>;

export function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  const [featured, setFeatured] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trending, setTrending] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [featuredData, categoriesData, trendingData] = await Promise.all([
        wallpaperService.getFeatured(5),
        categoryService.getAll(),
        wallpaperService.getTrending(10),
      ]);
      setFeatured(featuredData);
      setCategories(categoriesData);
      setTrending(trendingData);
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const openWallpaper = (wallpaper: Wallpaper) => {
    navigation.navigate('WallpaperDetail', { wallpaper });
  };

  const openCategory = (category: Category) => {
    navigation.navigate('CategoryDetail', { category });
  };

  const greeting = () => {
    const hour = new Date().getHours();
    const name = user?.user_metadata?.full_name?.split(' ')[0];
    if (hour < 12) return `Good Morning${name ? `, ${name}` : ''} ☀️`;
    if (hour < 18) return `Good Afternoon${name ? `, ${name}` : ''} 🌤️`;
    return `Good Evening${name ? `, ${name}` : ''} 🌙`;
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <FlatList
        data={[{ key: 'content' }]}
        keyExtractor={(item) => item.key}
        renderItem={() => (
          <View className="pb-8">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 mb-5">
              <View>
                <Text className="text-text-secondary text-sm">{greeting()}</Text>
                <Text className="text-2xl font-bold text-text-primary">
                  {t('about.appName')}
                </Text>
              </View>
              <Pressable
                className="w-10 h-10 rounded-full bg-bg-card items-center justify-center"
                onPress={() =>
                  (navigation as any).navigate('MainTabs', {
                    screen: 'Explore',
                  })
                }
              >
                <Ionicons name="search" size={20} color={colors.text.primary} />
              </Pressable>
            </View>

            {/* Featured Carousel */}
            <View className="mb-8">
              <SectionHeader title={t('home.featured')} />
              <FeaturedCarousel wallpapers={featured} onPress={openWallpaper} />
            </View>

            {/* Categories */}
            <View className="mb-8">
              <SectionHeader
                title={t('home.categories')}
                onSeeAll={() => (navigation as any).navigate('MainTabs', { screen: 'Explore' })}
              />
              <View className="flex-row flex-wrap px-4">
                {categories.map((category, index) => (
                  <View key={category.id} className="mr-3">
                    <CategoryChip
                      category={category}
                      onPress={openCategory}
                      index={index}
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* Trending */}
            <View>
              <SectionHeader title={t('home.trending')} />
              <View className="flex-row flex-wrap justify-between px-4">
                {trending.slice(0, 6).map((wallpaper, index) => (
                  <WallpaperCard
                    key={wallpaper.id}
                    wallpaper={wallpaper}
                    onPress={openWallpaper}
                    index={index}
                    width="half"
                    height={220}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.primary}
            colors={[colors.accent.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center justify-between px-4 mb-4">
      <Text className="text-lg font-bold text-text-primary">{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text className="text-accent-primary text-sm font-medium">
            {t('home.seeAll')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
