import React from 'react';
import { View, Text, Pressable, useWindowDimensions, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { Wallpaper } from '../types';
import { wallpaperService } from '../services/wallpaper.service';
import { formatNumber } from '../utils/helpers';
import colors from '../theme/colors';

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
  height = 230,
}: WallpaperCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth =
    typeof width === 'number'
      ? width
      : width === 'half'
        ? (screenWidth - 44) / 2
        : screenWidth - 32;

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    opacity.value = withDelay(index * 40, withSpring(1, { damping: 15 }));
    translateY.value = withDelay(index * 40, withSpring(0, { damping: 15 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const thumbnail = wallpaperService.getThumbnailUrl(wallpaper.cloudinary_url);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(wallpaper);
  };

  return (
    <AnimatedPressable
      className="rounded-3xl overflow-hidden bg-bg-card border border-white/10 mb-3.5"
      style={[
        { width: cardWidth, height },
        styles.cardShadow,
        animatedStyle,
      ]}
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 350 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 350 });
      }}
    >
      <Image
        source={{ uri: thumbnail }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={250}
        recyclingKey={wallpaper.cloudinary_id}
      />

      {/* Subtle top category tag */}
      {wallpaper.category && (
        <View className="absolute top-2.5 left-2.5 rounded-full px-2.5 py-0.5 bg-black/40 border border-white/10 backdrop-blur-md">
          <Text className="text-white/90 text-[10px] font-semibold">
            {wallpaper.category.name}
          </Text>
        </View>
      )}

      {/* Bottom Info Gradient */}
      <View className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8 bg-gradient-to-t bg-black/60">
        <Text className="text-white text-xs font-bold" numberOfLines={1}>
          {wallpaper.title}
        </Text>
        <View className="flex-row items-center justify-between mt-0.5">
          <Text className="text-white/70 text-[11px]" numberOfLines={1}>
            {wallpaper.width && wallpaper.height ? `${wallpaper.width}×${wallpaper.height}` : 'HD'}
          </Text>
          <Text className="text-accent-secondary text-[11px] font-semibold">
            ↓ {formatNumber(wallpaper.download_count)}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
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
