import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Share, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '../../components/ui/Button';
import { WallpaperCard } from '../../components/WallpaperCard';
import { wallpaperService } from '../../services/wallpaper.service';
import { storageService } from '../../services/storage.service';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';
import { formatNumber } from '../../utils/helpers';
import colors from '../../theme/colors';
import type { Wallpaper } from '../../types';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'WallpaperDetail'>;

export function WallpaperDetailScreen({ route, navigation }: Props) {
  const { wallpaper } = route.params;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites(user?.id);

  const [downloading, setDownloading] = useState(false);
  const [related, setRelated] = useState<Wallpaper[]>([]);
  const [favorite, setFavorite] = useState(false);

  const heartScale = useSharedValue(1);

  useEffect(() => {
    setFavorite(isFavorite(wallpaper.id));
    if (wallpaper.category_id) {
      wallpaperService
        .getRelated(wallpaper.id, wallpaper.category_id)
        .then(setRelated)
        .catch(console.error);
    }
  }, [wallpaper.id]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    heartScale.value = withSpring(1.4, { damping: 8 }, () => {
      heartScale.value = withSpring(1);
    });
    setFavorite(!favorite);
    toggleFavorite(wallpaper.id);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const downloadUrl = wallpaperService.getDownloadUrl(wallpaper.cloudinary_url);
      await storageService.downloadAndSave(
        downloadUrl,
        `wallcraft_${wallpaper.id}.jpg`,
      );

      if (user) {
        await wallpaperService.recordDownload(wallpaper.id, user.id);
      }

      Alert.alert(t('common.success'), t('wallpaper.downloadSuccess'));
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.message ?? t('common.error'));
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${wallpaper.title} — Wallcraft`,
        url: wallpaper.cloudinary_url,
      });
    } catch {
      // user cancelled
    }
  };

  const openRelated = (w: Wallpaper) => {
    navigation.replace('WallpaperDetail', { wallpaper: w });
  };

  const previewUrl = wallpaperService.getPreviewUrl(wallpaper.cloudinary_url);

  return (
    <View className="flex-1 bg-bg-primary">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Full-screen image */}
        <Pressable onPress={() => navigation.goBack()}>
          <Image
            source={{ uri: previewUrl }}
            style={{ width: '100%', height: 500 }}
            contentFit="cover"
            transition={300}
          />
        </Pressable>

        {/* Floating back + action buttons over image */}
        <View
          className="absolute top-0 left-0 right-0 flex-row justify-between px-4"
          style={{ paddingTop: insets.top + 8 }}
        >
          <Pressable
            className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </Pressable>

          <View className="flex-row">
            <Pressable
              className="w-10 h-10 rounded-full bg-black/40 items-center justify-center mr-2"
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={20} color="white" />
            </Pressable>
            <Pressable
              className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
              onPress={handleFavorite}
            >
              <Animated.View style={heartStyle}>
                <Ionicons
                  name={favorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={favorite ? colors.status.error : 'white'}
                />
              </Animated.View>
            </Pressable>
          </View>
        </View>

        {/* Info section */}
        <View className="px-5 pt-5 -mt-6 rounded-t-3xl bg-bg-primary">
          <Text className="text-2xl font-bold text-text-primary">
            {wallpaper.title}
          </Text>

          <View className="flex-row items-center mt-2">
            {wallpaper.category && (
              <View
                className="rounded-full px-3 py-1 mr-2"
                style={{
                  backgroundColor: `${wallpaper.category.color ?? '#7C6EF6'}22`,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: wallpaper.category.color ?? colors.accent.primary }}
                >
                  {wallpaper.category.name}
                </Text>
              </View>
            )}
            <Text className="text-text-tertiary text-sm">
              ↓ {formatNumber(wallpaper.download_count)}
            </Text>
          </View>

          {wallpaper.description && (
            <Text className="text-text-secondary text-sm mt-3 leading-5">
              {wallpaper.description}
            </Text>
          )}

          {/* Meta row */}
          <View className="flex-row mt-4 py-3 rounded-2xl bg-bg-card border border-border-light">
            <MetaItem
              label={t('wallpaper.resolution')}
              value={
                wallpaper.width && wallpaper.height
                  ? `${wallpaper.width}×${wallpaper.height}`
                  : '—'
              }
            />
            <View className="w-px bg-border-light" />
            <MetaItem
              label={t('wallpaper.category')}
              value={wallpaper.category?.name ?? '—'}
            />
          </View>

          {/* Action buttons */}
          <View className="flex-row mt-5 mb-2">
            <View className="flex-1 mr-3">
              <Button
                title={
                  downloading ? t('wallpaper.downloading') : t('wallpaper.download')
                }
                onPress={handleDownload}
                loading={downloading}
                size="lg"
                fullWidth
                icon={
                  <Ionicons name="download-outline" size={20} color="white" />
                }
              />
            </View>
            <Pressable
              className="w-14 h-14 rounded-xl bg-bg-card border border-border-light items-center justify-center"
              onPress={handleDownload}
            >
              <Ionicons name="phone-portrait-outline" size={24} color={colors.accent.primary} />
            </Pressable>
          </View>

          {/* Tags */}
          {wallpaper.tags.length > 0 && (
            <View className="flex-row flex-wrap mt-3">
              {wallpaper.tags.map((tag) => (
                <View
                  key={tag}
                  className="bg-bg-card border border-border-light rounded-full px-3 py-1 mr-2 mb-2"
                >
                  <Text className="text-text-secondary text-xs">#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Related */}
          {related.length > 0 && (
            <View className="mt-6">
              <Text className="text-lg font-bold text-text-primary mb-4">
                {t('wallpaper.related')}
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {related.slice(0, 4).map((w, index) => (
                  <WallpaperCard
                    key={w.id}
                    wallpaper={w}
                    onPress={openRelated}
                    index={index}
                    width="half"
                    height={180}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-text-tertiary text-xs">{label}</Text>
      <Text className="text-text-primary text-sm font-semibold mt-0.5">{value}</Text>
    </View>
  );
}
