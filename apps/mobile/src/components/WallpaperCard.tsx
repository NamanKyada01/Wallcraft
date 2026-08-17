import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import type { Wallpaper } from '../types';
import { wallpaperService } from '../services/wallpaper.service';
import { formatNumber } from '../utils/helpers';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  onPress: (wallpaper: Wallpaper) => void;
  index?: number;
  width?: number | string;
  height?: number;
}

export function WallpaperCard({
  wallpaper,
  onPress,
  index = 0,
  width,
  height = 220,
}: WallpaperCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth =
    typeof width === 'number'
      ? width
      : width === 'half'
        ? (screenWidth - 48) / 2
        : screenWidth - 32;

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withDelay(index * 60, withSpring(1, { damping: 15 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: (1 - opacity.value) * 20 }],
    opacity: opacity.value,
  }));

  const thumbnail = wallpaperService.getThumbnailUrl(wallpaper.cloudinary_url);

  return (
    <AnimatedPressable
      className="rounded-2xl overflow-hidden bg-bg-card"
      style={[{ width: cardWidth, height }, animatedStyle]}
      onPress={() => onPress(wallpaper)}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      }}
    >
      <Image
        source={{ uri: thumbnail }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={200}
        recyclingKey={wallpaper.cloudinary_id}
      />

      <View className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-8 bg-black/50">
        <Text className="text-white text-sm font-semibold" numberOfLines={1}>
          {wallpaper.title}
        </Text>
        <View className="flex-row items-center justify-between mt-0.5">
          <Text className="text-white/70 text-xs" numberOfLines={1}>
            {wallpaper.category?.name ?? ''}
          </Text>
          <Text className="text-white/70 text-xs">
            ↓ {formatNumber(wallpaper.download_count)}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}
