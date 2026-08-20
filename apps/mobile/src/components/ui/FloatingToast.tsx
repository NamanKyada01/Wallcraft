import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';

export interface ToastConfig {
  message: string;
  type?: 'success' | 'info' | 'error';
  icon?: keyof typeof Ionicons.glyphMap;
  duration?: number;
}

interface FloatingToastProps {
  toast: ToastConfig | null;
  onHide: () => void;
}

export function FloatingToast({ toast, onHide }: FloatingToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (toast) {
      // Entrance
      translateY.value = withSpring(0, { damping: 14, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });

      // Exit after duration
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 250 });
        opacity.value = withTiming(0, { duration: 250 }, (finished) => {
          if (finished) {
            runOnJS(onHide)();
          }
        });
      }, toast.duration || 2600);

      return () => clearTimeout(timer);
    } else {
      translateY.value = -100;
      opacity.value = 0;
    }
  }, [toast]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!toast) return null;

  const iconName =
    toast.icon ||
    (toast.type === 'error'
      ? 'alert-circle'
      : toast.type === 'info'
      ? 'information-circle'
      : 'checkmark-circle');

  const iconColor =
    toast.type === 'error'
      ? colors.status.error
      : toast.type === 'info'
      ? colors.status.info
      : colors.status.success;

  return (
    <Animated.View
      style={[
        styles.toastShadow,
        animatedStyle,
        { top: Math.max(insets.top, 12) },
      ]}
      className="absolute left-6 right-6 z-50 flex-row items-center bg-bg-secondary/95 border border-white/15 px-4 py-3 rounded-2xl backdrop-blur-md"
      pointerEvents="none"
    >
      <Ionicons name={iconName} size={22} color={iconColor} />
      <Text className="text-white text-sm font-semibold ml-3 flex-1">
        {toast.message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
});
