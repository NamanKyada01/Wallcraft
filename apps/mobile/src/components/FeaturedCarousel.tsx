import React, { useRef, useState } from 'react';
import { View, Text, Pressable, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import type { Wallpaper } from '../types';
import { wallpaperService } from '../services/wallpaper.service';
import colors from '../theme/colors';

interface FeaturedCarouselProps {
  wallpapers: Wallpaper[];
  onPress: (wallpaper: Wallpaper) => void;
}

export function FeaturedCarousel({ wallpapers, onPress }: FeaturedCarouselProps) {
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / (width - 32)));
  };

  return (
    <View>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        snapToInterval={width - 32}
        decelerationRate="fast"
      >
        {wallpapers.map((wallpaper, index) => {
          const previewUrl = wallpaperService.getPreviewUrl(
            wallpaper.cloudinary_url,
          );

          return (
            <CarouselItem
              key={wallpaper.id}
              wallpaper={wallpaper}
              previewUrl={previewUrl}
              index={index}
              scrollX={scrollX}
              width={width - 32}
              onPress={() => onPress(wallpaper)}
            />
          );
        })}
      </Animated.ScrollView>

      {/* Pagination dots */}
      <View className="flex-row justify-center mt-3">
        {wallpapers.map((_, index) => (
          <View
            key={index}
            className="h-1.5 rounded-full mx-0.5 transition-all"
            style={{
              width: activeIndex === index ? 20 : 6,
              backgroundColor:
                activeIndex === index
                  ? colors.accent.primary
                  : 'rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </View>
    </View>
  );
}

function CarouselItem({
  wallpaper,
  previewUrl,
  index,
  scrollX,
  width,
  onPress,
}: {
  wallpaper: Wallpaper;
  previewUrl: string;
  index: number;
  scrollX: any;
  width: number;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0.9, 1, 0.9],
      Extrapolation.CLAMP,
    );
    return { transform: [{ scale }] };
  });

  return (
    <Pressable onPress={onPress} className="mr-4">
      <Animated.View
        className="rounded-3xl overflow-hidden"
        style={[{ width, height: 320 }, animatedStyle]}
      >
        <Image
          source={{ uri: previewUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={300}
        />
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 bg-black/50">
          <Text className="text-white text-lg font-bold" numberOfLines={1}>
            {wallpaper.title}
          </Text>
          {wallpaper.description && (
            <Text className="text-white/70 text-xs mt-0.5" numberOfLines={1}>
              {wallpaper.description}
            </Text>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}
