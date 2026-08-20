import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Share, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Button } from '../../components/ui/Button';
import { WallpaperCard } from '../../components/WallpaperCard';
import { FloatingLivePreview } from '../../components/ui/FloatingLivePreview';
import { FloatingToast, ToastConfig } from '../../components/ui/FloatingToast';
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [toast, setToast] = useState<ToastConfig | null>(null);

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
    const next = !favorite;
    setFavorite(next);
    toggleFavorite(wallpaper.id);
    setToast({
      message: next ? 'Added to Favorites ❤️' : 'Removed from Favorites',
      type: 'info',
    });
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

      setToast({
        message: 'Wallpaper saved to Gallery! 📥',
        type: 'success',
      });
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.message ?? t('common.error'));
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${wallpaper.title} — Wallcraft Wallpaper`,
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
      {/* Floating Toast Notification */}
      <FloatingToast toast={toast} onHide={() => setToast(null)} />

      {/* Floating Interactive Live Simulator Modal */}
      <FloatingLivePreview
        visible={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        imageUrl={previewUrl}
        title={wallpaper.title}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Full-bleed wallpaper preview with live preview toggle */}
        <Pressable onPress={() => setIsPreviewOpen(true)} className="relative">
          <Image
            source={{ uri: previewUrl }}
            style={{ width: '100%', height: 520 }}
            contentFit="cover"
            transition={300}
          />

          {/* Floating Tap to Preview Badge */}
          <View className="absolute bottom-10 right-4 bg-black/60 border border-white/20 px-3 py-1.5 rounded-full flex-row items-center backdrop-blur-md">
            <Ionicons name="eye-outline" size={14} color="white" />
            <Text className="text-white text-xs font-semibold ml-1.5">
              Live Mockup Preview
            </Text>
          </View>
        </Pressable>

        {/* Floating Top Nav Bar (Back, Share, Heart) */}
        <View
          className="absolute top-0 left-0 right-0 flex-row justify-between px-4 z-30"
          style={{ paddingTop: Math.max(insets.top, 12) }}
          pointerEvents="box-none"
        >
          <Pressable
            className="w-11 h-11 rounded-full bg-black/50 border border-white/20 items-center justify-center backdrop-blur-md shadow-lg"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </Pressable>

          <View className="flex-row items-center gap-2">
            <Pressable
              className="w-11 h-11 rounded-full bg-black/50 border border-white/20 items-center justify-center backdrop-blur-md shadow-lg"
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={20} color="white" />
            </Pressable>

            <Pressable
              className="w-11 h-11 rounded-full bg-black/50 border border-white/20 items-center justify-center backdrop-blur-md shadow-lg"
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

        {/* Floating Card Info Sheet */}
        <View className="px-5 pt-6 -mt-6 rounded-t-3xl bg-bg-primary border-t border-white/10">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-3">
              <Text
                className="text-2xl font-bold text-text-primary tracking-wide"
                style={{ fontFamily: 'DMSerifDisplay_400Regular' }}
              >
                {wallpaper.title}
              </Text>
              <View className="flex-row items-center mt-2">
                {wallpaper.category && (
                  <View
                    className="rounded-full px-3 py-1 mr-2.5"
                    style={{
                      backgroundColor: `${wallpaper.category.color ?? '#7C6EF6'}25`,
                      borderWidth: 1,
                      borderColor: `${wallpaper.category.color ?? '#7C6EF6'}50`,
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: wallpaper.category.color ?? colors.accent.primary }}
                    >
                      {wallpaper.category.name}
                    </Text>
                  </View>
                )}
                <Text className="text-text-tertiary text-xs font-semibold">
                  ↓ {formatNumber(wallpaper.download_count)} downloads
                </Text>
              </View>
            </View>
          </View>

          {wallpaper.description && (
            <Text className="text-text-secondary text-sm mt-3 leading-5">
              {wallpaper.description}
            </Text>
          )}

          {/* Meta Specifications */}
          <View className="flex-row mt-5 py-3.5 rounded-2xl bg-bg-card border border-white/10">
            <MetaItem
              label={t('wallpaper.resolution')}
              value={
                wallpaper.width && wallpaper.height
                  ? `${wallpaper.width}×${wallpaper.height}`
                  : '4K Ultra HD'
              }
            />
            <View className="w-px bg-white/10" />
            <MetaItem
              label="Format"
              value="WebP / Cloudinary"
            />
            <View className="w-px bg-white/10" />
            <MetaItem
              label={t('wallpaper.category')}
              value={wallpaper.category?.name ?? 'General'}
            />
          </View>

          {/* Floating Action Buttons */}
          <View className="flex-row mt-5 mb-3 gap-3">
            <View className="flex-1">
              <Button
                title={downloading ? t('wallpaper.downloading') : t('wallpaper.download')}
                onPress={handleDownload}
                loading={downloading}
                size="lg"
                fullWidth
                icon={<Ionicons name="download-outline" size={20} color="white" />}
              />
            </View>
            <Pressable
              style={styles.actionBtn}
              className="w-14 h-14 rounded-2xl bg-bg-card border border-white/15 items-center justify-center shadow-lg"
              onPress={() => setIsPreviewOpen(true)}
            >
              <Ionicons name="phone-portrait-outline" size={24} color={colors.accent.primary} />
            </Pressable>
          </View>

          {/* Tags */}
          {wallpaper.tags && wallpaper.tags.length > 0 && (
            <View className="flex-row flex-wrap mt-3">
              {wallpaper.tags.map((tag) => (
                <View
                  key={tag}
                  className="bg-bg-card border border-white/10 rounded-full px-3 py-1 mr-2 mb-2"
                >
                  <Text className="text-text-secondary text-xs font-medium">#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Related Wallpapers */}
          {related.length > 0 && (
            <View className="mt-7">
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
                    height={190}
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
      <Text className="text-text-tertiary text-[11px]">{label}</Text>
      <Text className="text-text-primary text-xs font-bold mt-0.5">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actionBtn: {
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
