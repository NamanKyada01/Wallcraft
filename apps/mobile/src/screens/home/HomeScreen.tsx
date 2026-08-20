import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { FeaturedCarousel } from '../../components/FeaturedCarousel';
import { CategoryChip } from '../../components/CategoryChip';
import { WallpaperCard } from '../../components/WallpaperCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { FloatingCard } from '../../components/ui/FloatingCard';
import { FloatingActionButton, ActionItem } from '../../components/ui/FloatingActionButton';
import { FloatingToast, ToastConfig } from '../../components/ui/FloatingToast';
import { wallpaperService } from '../../services/wallpaper.service';
import { categoryService } from '../../services/category.service';
import { useAuth } from '../../hooks/useAuth';
import colors from '../../theme/colors';
import type { Category, Wallpaper } from '../../types';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavProp = NativeStackNavigationProp<MainStackParamList>;

export function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  const [featured, setFeatured] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trending, setTrending] = useState<Wallpaper[]>([]);
  const [dailyPick, setDailyPick] = useState<Wallpaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<ToastConfig | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [featuredData, categoriesData, trendingData, randomData] = await Promise.all([
        wallpaperService.getFeatured(5),
        categoryService.getAll(),
        wallpaperService.getTrending(10),
        wallpaperService.getRandomWallpaper(),
      ]);
      setFeatured(featuredData);
      setCategories(categoriesData);
      setTrending(trendingData);
      setDailyPick(randomData);
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

  const handleRandomWallpaper = async () => {
    try {
      const randomW = await wallpaperService.getRandomWallpaper();
      if (randomW) {
        setToast({ message: `🎲 Surprise Pick: ${randomW.title}`, type: 'info' });
        navigation.navigate('WallpaperDetail', { wallpaper: randomW });
      }
    } catch {
      setToast({ message: 'Could not fetch random wallpaper', type: 'error' });
    }
  };

  // Speed Dial Floating Actions
  const floatingActions: ActionItem[] = [
    {
      id: 'random',
      icon: 'shuffle-outline',
      label: 'Surprise Wallpaper',
      color: colors.accent.primary,
      onPress: handleRandomWallpaper,
    },
    {
      id: 'explore',
      icon: 'compass-outline',
      label: 'Explore Categories',
      color: '#06B6D4',
      onPress: () => (navigation as any).navigate('MainTabs', { screen: 'Explore' }),
    },
    {
      id: 'favorites',
      icon: 'heart-outline',
      label: 'My Favorites',
      color: '#EC4899',
      onPress: () => (navigation as any).navigate('MainTabs', { screen: 'Favorites' }),
    },
    {
      id: 'support',
      icon: 'help-circle-outline',
      label: 'Support Tickets',
      color: '#F59E0B',
      onPress: () => navigation.navigate('Help'),
    },
  ];

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
      {/* Floating Toast */}
      <FloatingToast toast={toast} onHide={() => setToast(null)} />

      {/* Main Scrollable Content */}
      <FlatList
        data={[{ key: 'content' }]}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingBottom: 110 }}
        renderItem={() => (
          <View>
            {/* Top Animated Header */}
            <View className="flex-row items-center justify-between px-4 mb-4 mt-2">
              <View>
                <Text className="text-text-secondary text-xs font-medium tracking-wide">
                  {greeting()}
                </Text>
                <Text
                  className="text-3xl font-bold text-text-primary tracking-wide"
                  style={{ fontFamily: 'DMSerifDisplay_400Regular' }}
                >
                  {t('about.appName')}
                </Text>
              </View>
              <Pressable
                className="w-10 h-10 rounded-full bg-bg-card border border-white/10 items-center justify-center shadow-md"
                onPress={() =>
                  (navigation as any).navigate('MainTabs', {
                    screen: 'Explore',
                  })
                }
              >
                <Ionicons name="search" size={19} color={colors.text.primary} />
              </Pressable>
            </View>

            {/* Featured Carousel */}
            <View className="mb-7">
              <SectionHeader title={t('home.featured')} />
              <FeaturedCarousel wallpapers={featured} onPress={openWallpaper} />
            </View>

            {/* Floating Daily Pick Card */}
            {dailyPick && (
              <View className="px-4 mb-8">
                <SectionHeader title="✨ Daily Spotlight" />
                <FloatingCard
                  onPress={() => openWallpaper(dailyPick)}
                  className="h-44 flex-row items-center p-3.5 relative"
                  glowColor={colors.accent.primary}
                >
                  <Image
                    source={{ uri: wallpaperService.getThumbnailUrl(dailyPick.cloudinary_url) }}
                    style={{ width: 110, height: '100%', borderRadius: 16 }}
                    contentFit="cover"
                    transition={250}
                  />
                  <View className="flex-1 ml-4 justify-between py-1">
                    <View>
                      <View className="self-start rounded-full px-2.5 py-0.5 bg-accent-primary/20 border border-accent-primary/40 mb-1.5">
                        <Text className="text-accent-secondary text-[10px] font-bold">
                          EDITOR'S CHOICE
                        </Text>
                      </View>
                      <Text className="text-white text-base font-bold" numberOfLines={1}>
                        {dailyPick.title}
                      </Text>
                      <Text className="text-text-secondary text-xs mt-1" numberOfLines={2}>
                        {dailyPick.description || 'Tap to preview in live Lock Screen mockup & download in 4K.'}
                      </Text>
                    </View>
                    <View className="flex-row items-center text-accent-primary font-semibold">
                      <Text className="text-accent-primary text-xs font-bold mr-1">
                        Preview Now
                      </Text>
                      <Ionicons name="arrow-forward" size={14} color={colors.accent.primary} />
                    </View>
                  </View>
                </FloatingCard>
              </View>
            )}

            {/* Categories Grid */}
            <View className="mb-7">
              <SectionHeader
                title={t('home.categories')}
                onSeeAll={() => (navigation as any).navigate('MainTabs', { screen: 'Explore' })}
              />
              <View className="flex-row flex-wrap px-4 justify-between">
                {categories.map((category, index) => (
                  <View key={category.id} style={{ width: '48%', marginBottom: 12 }}>
                    <CategoryChip
                      category={category}
                      onPress={openCategory}
                      index={index}
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* Trending Grid */}
            <View className="mb-4">
              <SectionHeader title={t('home.trending')} />
              <View className="flex-row flex-wrap justify-between px-4">
                {trending.slice(0, 6).map((wallpaper, index) => (
                  <WallpaperCard
                    key={wallpaper.id}
                    wallpaper={wallpaper}
                    onPress={openWallpaper}
                    index={index}
                    width="half"
                    height={230}
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

      {/* Floating Action Button Speed Dial */}
      <FloatingActionButton actions={floatingActions} bottomOffset={90} rightOffset={20} />
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
    <View className="flex-row items-center justify-between px-4 mb-3">
      <Text
        className="text-xl font-bold text-text-primary tracking-wide"
        style={{ fontFamily: 'DMSerifDisplay_400Regular' }}
      >
        {title}
      </Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text className="text-accent-primary text-xs font-bold">
            {t('home.seeAll')} →
          </Text>
        </Pressable>
      )}
    </View>
  );
}
