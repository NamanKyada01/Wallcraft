import React from 'react';
import { View, Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TAB_CONFIG = [
  { name: 'Home', icon: 'home-outline', iconActive: 'home', labelKey: 'tabs.home' },
  { name: 'Explore', icon: 'compass-outline', iconActive: 'compass', labelKey: 'tabs.explore' },
  { name: 'Favorites', icon: 'heart-outline', iconActive: 'heart', labelKey: 'tabs.favorites' },
  { name: 'Profile', icon: 'person-outline', iconActive: 'person', labelKey: 'tabs.profile' },
];

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View
      className="flex-row bg-bg-secondary/95 border-t border-border-light"
      style={{ paddingBottom: Math.max(insets.bottom, 8), paddingTop: 8 }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const config = TAB_CONFIG[index];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.key}
            isFocused={isFocused}
            icon={config.icon}
            iconActive={config.iconActive}
            label={t(config.labelKey)}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

function TabItem({
  isFocused,
  icon,
  iconActive,
  label,
  onPress,
}: {
  isFocused: boolean;
  icon: string;
  iconActive: string;
  label: string;
  onPress: () => void;
}) {
  const pillScale = useSharedValueSafe(isFocused);
  const labelOpacity = useLabelOpacity(isFocused);

  return (
    <AnimatedPressable
      className="flex-1 items-center justify-center py-1"
      onPress={onPress}
    >
      <View className="flex-row items-center bg-bg-card rounded-full px-4 py-1.5">
        <Animated.View style={pillScale}>
          <Ionicons
            name={isFocused ? (iconActive as any) : (icon as any)}
            size={22}
            color={isFocused ? '#7C6EF6' : '#6B6B80'}
          />
        </Animated.View>

        <Animated.View style={labelOpacity}>
          {isFocused && (
            <Text className="text-accent-primary text-xs font-semibold ml-1.5">
              {label}
            </Text>
          )}
        </Animated.View>
      </View>
    </AnimatedPressable>
  );
}

// Helpers to keep worklet animation logic tidy
import { useSharedValue } from 'react-native-reanimated';

function useSharedValueSafe(isFocused: boolean) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  scale.value = withSpring(isFocused ? 1.1 : 1, { damping: 12, stiffness: 300 });
  return style;
}

function useLabelOpacity(isFocused: boolean) {
  const opacity = useSharedValue(0);
  const width = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    maxWidth: width.value,
  }));
  opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  width.value = withTiming(isFocused ? 100 : 0, { duration: 200 });
  return style;
}
