import React, { useEffect } from 'react';
import { View, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FloatingCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  style?: ViewStyle | ViewStyle[];
  floatAmplitude?: number; // Distance of levitation oscillation (default 4px)
  floatDuration?: number; // Speed of one hover cycle in ms (default 2600ms)
  enableFloating?: boolean; // Enable idle floating levitation (default true)
  glowColor?: string; // Optional ambient colored glow
}

export function FloatingCard({
  children,
  onPress,
  className = '',
  style,
  floatAmplitude = 4,
  floatDuration = 2600,
  enableFloating = true,
  glowColor,
}: FloatingCardProps) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (enableFloating) {
      // Smooth continuous floating levitation oscillation
      translateY.value = withRepeat(
        withSequence(
          withTiming(-floatAmplitude, {
            duration: floatDuration / 2,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(floatAmplitude, {
            duration: floatDuration / 2,
            easing: Easing.inOut(Easing.quad),
          })
        ),
        -1,
        true
      );
    } else {
      translateY.value = 0;
    }
  }, [enableFloating, floatAmplitude, floatDuration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 350 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 350 });
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const glowStyle: ViewStyle = glowColor
    ? {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
      }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      };

  if (!onPress) {
    return (
      <Animated.View
        className={`bg-bg-card border border-white/10 rounded-3xl overflow-hidden ${className}`}
        style={[glowStyle, animatedStyle, style]}
      >
        {children}
      </Animated.View>
    );
  }

  return (
    <AnimatedPressable
      className={`bg-bg-card border border-white/10 rounded-3xl overflow-hidden ${className}`}
      style={[glowStyle, animatedStyle, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {children}
    </AnimatedPressable>
  );
}
