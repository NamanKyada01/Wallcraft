import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import colors from '../theme/colors';

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
      style={[
        styles.floatingContainer,
        {
          bottom: Math.max(insets.bottom, 12),
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={styles.floatingDock}
        className="flex-row items-center justify-around bg-bg-secondary/95 border border-white/15 rounded-full px-2 py-2"
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIG[index];

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1.08 : 1, { damping: 14, stiffness: 300 });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center py-2 px-3.5 rounded-full transition ${
        isFocused ? 'bg-accent-primary' : 'bg-transparent'
      }`}
    >
      <Animated.View style={animatedStyle} className="flex-row items-center">
        <Ionicons
          name={isFocused ? (iconActive as any) : (icon as any)}
          size={20}
          color={isFocused ? '#FFFFFF' : '#8E8EA0'}
        />
        {isFocused && (
          <Text className="text-white text-xs font-bold ml-1.5">{label}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 40,
  },
  floatingDock: {
    width: '100%',
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
  },
});
