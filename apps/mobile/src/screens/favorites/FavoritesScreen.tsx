import React from 'react';
import { View, Text, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  LinearTransition,
} from 'react-native-reanimated';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';
import { wallpaperService } from '../../services/wallpaper.service';
import colors from '../../theme/colors';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import type { Favorite } from '../../types';

export function FavoritesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { user } = useAuth();
  const { favorites, loading, toggleFavorite } = useFavorites(user?.id);

  const openWallpaper = (favorite: Favorite) => {
    if (favorite.wallpaper) {
      navigation.navigate('WallpaperDetail', { wallpaper: favorite.wallpaper });
    }
  };

  const confirmRemove = (favorite: Favorite) => {
    Alert.alert(t('wallpaper.unfavorite'), favorite.wallpaper?.title ?? '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          toggleFavorite(favorite.wallpaper_id);
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (favorites.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
        <EmptyState
          title={t('favorites.empty')}
          description={t('favorites.emptyDesc')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <View className="px-4 mb-4 mt-2 flex-row items-center justify-between">
        <Text className="text-2xl font-extrabold text-text-primary tracking-tight">
          {t('favorites.title')}
        </Text>
        <View className="bg-accent-primary/20 px-3 py-1 rounded-full border border-accent-primary/30">
          <Text className="text-accent-secondary text-xs font-bold">
            {t('profile.totalFavorites', { count: favorites.length })}
          </Text>
        </View>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperClassName="justify-between px-4 mb-3"
        contentContainerStyle={{ paddingBottom: 110 }}
        renderItem={({ item, index }) => (
          <FavoriteCard
            favorite={item}
            index={index}
            onPress={openWallpaper}
            onRemove={confirmRemove}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function FavoriteCard({
  favorite,
  index,
  onPress,
  onRemove,
}: {
  favorite: Favorite;
  index: number;
  onPress: (favorite: Favorite) => void;
  onRemove: (favorite: Favorite) => void;
}) {
  const scale = useSharedValue(1);
  const height = 210 + ((index % 3) * 20);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const thumbnail = favorite.wallpaper
    ? wallpaperService.getThumbnailUrl(favorite.wallpaper.cloudinary_url)
    : null;

  return (
    <Animated.View
      layout={LinearTransition.springify()}
      style={[animatedStyle, styles.cardShadow]}
      className="rounded-3xl overflow-hidden bg-bg-card border border-white/10"
    >
      <Pressable
        onPress={() => onPress(favorite)}
        onPressIn={() => {
          scale.value = withSpring(0.95, { damping: 15, stiffness: 350 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 350 });
        }}
      >
        {thumbnail && (
          <Image
            source={{ uri: thumbnail }}
            style={{ width: 170, height }}
            contentFit="cover"
            transition={200}
          />
        )}

        {/* Heart remove overlay */}
        <Pressable
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/50 border border-white/15 items-center justify-center backdrop-blur-md"
          onPress={() => onRemove(favorite)}
          hitSlop={4}
        >
          <Ionicons name="heart" size={16} color={colors.status.error} />
        </Pressable>

        {favorite.wallpaper && (
          <View className="absolute bottom-0 left-0 right-0 px-3 py-2.5 bg-black/60 backdrop-blur-sm">
            <Text className="text-white text-xs font-semibold" numberOfLines={1}>
              {favorite.wallpaper.title}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
});
