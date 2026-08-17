import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { styled } from 'nativewind';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  className = '',
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    'worklet';
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 rounded-lg',
    md: 'px-5 py-3 rounded-xl',
    lg: 'px-7 py-4 rounded-xl',
  };

  const textClasses = {
    sm: 'text-sm font-medium',
    md: 'text-base font-medium',
    lg: 'text-lg font-semibold',
  };

  const variantClasses = {
    primary: 'bg-accent-primary',
    secondary: 'bg-bg-elevated',
    outline: 'border border-border-medium bg-transparent',
    ghost: 'bg-transparent',
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-text-primary',
    outline: 'text-text-primary',
    ghost: 'text-accent-primary',
  };

  return (
    <AnimatedTouchableOpacity
      className={[
        'flex-row items-center justify-center',
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-40',
        fullWidth && 'w-full',
        className,
      ]}
      style={animatedStyle}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={[textClasses[size], textVariantClasses[variant]]}>
            {title}
          </Text>
        </>
      )}
    </AnimatedTouchableOpacity>
  );
}
