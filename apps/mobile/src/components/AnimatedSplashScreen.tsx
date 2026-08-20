import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  runOnJS,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import colors from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  onFinish: () => void;
}

export function AnimatedSplashScreen({ onFinish }: AnimatedSplashScreenProps) {
  const logoScale = useSharedValue(0.4);
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(0);
  const glowPulse = useSharedValue(1);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const progressWidth = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Logo scale & fade in
    logoScale.value = withSpring(1, { damping: 12, stiffness: 150 });
    logoOpacity.value = withTiming(1, { duration: 600 });

    // 2. Idle floating levitation for the nano banana logo
    logoTranslateY.value = withSequence(
      withTiming(0, { duration: 600 }),
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
          withTiming(8, { duration: 1200, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );

    // 3. Ambient glow pulse
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // 4. Text slide and fade in
    textOpacity.value = withTiming(1, { duration: 800 });
    textTranslateY.value = withSpring(0, { damping: 14 });

    // 5. Progress bar animation
    progressWidth.value = withTiming(200, { duration: 1800, easing: Easing.out(Easing.quad) });

    // 6. Smooth exit transition after 2.4s
    const timer = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 400 }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      });
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { translateY: logoTranslateY.value },
    ],
    opacity: logoOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowPulse.value }],
    opacity: glowPulse.value * 0.45,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.container, containerAnimatedStyle]}
      className="bg-bg-primary items-center justify-center z-50"
    >
      {/* Ambient glowing backdrop circles */}
      <Animated.View
        style={[styles.glowOrb, glowAnimatedStyle]}
        className="absolute w-72 h-72 rounded-full bg-accent-primary blur-3xl pointer-events-none"
      />
      <View className="absolute w-60 h-60 rounded-full bg-[#EC4899]/20 blur-3xl top-1/4 pointer-events-none" />

      {/* Main Nano Banana Logo */}
      <Animated.View style={[logoAnimatedStyle, styles.logoWrapper]}>
        <View style={styles.logoShadow} className="rounded-3xl p-1 bg-black/40 border border-white/20">
          <Image
            source={require('../../assets/nano-banana-logo.png')}
            style={{ width: 140, height: 140, borderRadius: 24 }}
            contentFit="cover"
            transition={300}
          />
        </View>
      </Animated.View>

      {/* Brand Title & Subtitle */}
      <Animated.View style={[textAnimatedStyle, styles.textWrapper]} className="items-center mt-6">
        <Text className="text-3xl font-extrabold text-white tracking-widest uppercase">
          WALLCRAFT
        </Text>
        <View className="flex-row items-center mt-2 px-3 py-1 rounded-full bg-accent-primary/20 border border-accent-primary/30">
          <Text className="text-xs">🍌</Text>
          <Text className="text-accent-secondary text-xs font-bold ml-1.5 tracking-wider uppercase">
            Nano Banana Edition
          </Text>
        </View>
      </Animated.View>

      {/* Futuristic Progress Bar */}
      <View className="absolute bottom-16 w-52 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <Animated.View
          style={[progressAnimatedStyle, { height: '100%' }]}
          className="bg-accent-primary rounded-full"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoShadow: {
    shadowColor: '#7C6EF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  glowOrb: {
    backgroundColor: '#7C6EF6',
    opacity: 0.3,
  },
  textWrapper: {
    alignItems: 'center',
  },
});
