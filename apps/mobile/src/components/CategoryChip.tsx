import React from 'react';
import { Text, Pressable, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { Category } from '../types';
import { useTranslation } from 'react-i18next';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CategoryChipProps {
  category: Category;
  onPress: (category: Category) => void;
  index?: number;
}

export function CategoryChip({ category, onPress, index = 0 }: CategoryChipProps) {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardWidth = (width - 16 * 2 - 12) / 2;

  return (
    <AnimatedPressable
      className="rounded-2xl p-4 mb-3 overflow-hidden"
      style={[
        {
          width: cardWidth,
          backgroundColor: `${category.color ?? '#7C6EF6'}22`,
          borderWidth: 1,
          borderColor: `${category.color ?? '#7C6EF6'}44`,
        },
        animatedStyle,
      ]}
      onPress={() => onPress(category)}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      }}
    >
      <Text className="text-2xl mb-2">{category.icon ?? '🖼️'}</Text>
      <Text className="text-base font-semibold text-text-primary">
        {t(`category.${category.slug}`, category.name)}
      </Text>
      <View
        className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-20"
        style={{ backgroundColor: category.color ?? '#7C6EF6' }}
      />
    </AnimatedPressable>
  );
}
