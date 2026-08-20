import React from 'react';
import { Text, Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { Category } from '../types';
import { useTranslation } from 'react-i18next';
import colors from '../theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CategoryChipProps {
  category: Category;
  onPress: (category: Category) => void;
  index?: number;
}

export function CategoryChip({ category, onPress, index = 0 }: CategoryChipProps) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(category);
  };

  const accentColor = category.color || colors.accent.primary;

  return (
    <AnimatedPressable
      className="rounded-2xl p-4 overflow-hidden relative"
      style={[
        {
          backgroundColor: `${accentColor}18`,
          borderWidth: 1,
          borderColor: `${accentColor}35`,
        },
        styles.chipShadow,
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
      <Text className="text-2xl mb-1.5">{category.icon ?? '🖼️'}</Text>
      <Text className="text-sm font-bold text-text-primary">
        {t(`category.${category.slug}`, category.name)}
      </Text>
      
      {/* Decorative ambient glowing orb */}
      <View
        className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full opacity-20"
        style={{ backgroundColor: accentColor }}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chipShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
