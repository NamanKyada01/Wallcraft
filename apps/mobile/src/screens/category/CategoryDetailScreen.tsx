import React from 'react';
import { View, Text, Pressable, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { WallpaperCard } from '../../components/WallpaperCard';
import { EmptyState } from '../../components/EmptyState';
import { useWallpapers } from '../../hooks/useWallpapers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'CategoryDetail'>;

export function CategoryDetailScreen({ route, navigation }: Props) {
  const { category } = route.params;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { wallpapers, loading, hasMore, loadMore, refresh } = useWallpapers(
    category.id,
  );

  const openWallpaper = (wallpaper: any) => {
    navigation.navigate('WallpaperDetail', { wallpaper });
  };

  return (
    <View className="flex-1 bg-bg-primary">
      <FlatList
        data={wallpapers}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperClassName="justify-between px-4 mb-3"
        contentContainerClassName="pb-8"
        renderItem={({ item, index }) => (
          <WallpaperCard
            wallpaper={item}
            onPress={openWallpaper}
            index={index}
            width="half"
            height={220}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title={t('search.noResults')}
              description={t('search.noResultsDesc')}
            />
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={loading && wallpapers.length === 0}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refresh}
            tintColor={colors.accent.primary}
            colors={[colors.accent.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        // Parallax-ish header
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top }}>
            <View className="flex-row items-center px-4 py-3">
              <Pressable
                className="w-10 h-10 rounded-full bg-bg-card items-center justify-center mr-3"
                onPress={() => navigation.goBack()}
                hitSlop={8}
              >
                <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
              </Pressable>
              <View className="flex-1">
                <Text className="text-xl font-bold text-text-primary">
                  {t(`category.${category.slug}`, category.name)}
                </Text>
                <Text className="text-text-tertiary text-xs">
                  {t('home.wallpapersCount', { count: wallpapers.length })}
                </Text>
              </View>
              <View
                className="w-11 h-11 rounded-2xl items-center justify-center"
                style={{ backgroundColor: `${category.color ?? '#7C6EF6'}26` }}
              >
                <Text className="text-xl">{category.icon ?? '🖼️'}</Text>
              </View>
            </View>
          </View>
        }
      />
    </View>
  );
}
