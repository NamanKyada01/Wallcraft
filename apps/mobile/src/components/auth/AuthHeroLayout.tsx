import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface AuthHeroLayoutProps {
  children: React.ReactNode;
  tag?: string;
  subtitle?: string;
  cardTitle: string;
  cardSubtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export function AuthHeroLayout({
  children,
  tag = 'Welcome back',
  subtitle = 'Explore thousands of stunning wallpapers and make your screen truly yours.',
  cardTitle,
  cardSubtitle,
  showBackButton = false,
  onBackPress,
}: AuthHeroLayoutProps) {
  const insets = useSafeAreaInsets();

  // Gentle floating levitation for the right mockup cards
  const floatY = useSharedValue(0);

  React.useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(4, { duration: 2200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const floatingCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <View className="flex-1 bg-[#0D0E17]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Top Hero with Mountain Sunset Background */}
          <ImageBackground
            source={require('../../../assets/auth_mountain_sunset.jpg')}
            style={{ width: '100%', minHeight: 280, height: 300 }}
            resizeMode="cover"
          >
            {/* Gradient Overlays for Smooth Dark Transition */}
            <LinearGradient
              colors={['rgba(13,14,23,0.3)', 'rgba(13,14,23,0.15)', '#0D0E17']}
              locations={[0, 0.5, 1]}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            <View style={{ paddingTop: insets.top + 8 }} className="px-6 flex-1 justify-between pb-4">
              {/* Brand Top Header */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  {showBackButton && (
                    <Pressable
                      onPress={onBackPress}
                      className="w-9 h-9 rounded-full bg-black/40 border border-white/15 items-center justify-center mr-3"
                      hitSlop={8}
                    >
                      <Ionicons name="arrow-back" size={18} color="white" />
                    </Pressable>
                  )}
                  <View className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary items-center justify-center overflow-hidden border border-white/20 mr-2.5">
                    <Image
                      source={require('../../../assets/nano-banana-logo.png')}
                      style={{ width: 28, height: 28 }}
                      contentFit="cover"
                    />
                  </View>
                  <Text className="text-white font-extrabold text-lg tracking-wide">
                    Wallcraft
                  </Text>
                </View>
              </View>

              {/* Hero Row: Left text + Right Floating Wallpaper Cards */}
              <View className="flex-row items-end justify-between mt-2">
                {/* Left Text Block */}
                <View className="flex-1 pr-2">
                  <Text className="text-[#A78BFA] font-bold text-xs uppercase tracking-wider mb-1">
                    {tag}
                  </Text>
                  <View className="mb-1.5">
                    <Text className="text-white text-[27px] font-black tracking-tight leading-7">
                      Discover<Text className="text-[#8B5CF6]">.</Text>
                    </Text>
                    <Text className="text-white text-[27px] font-black tracking-tight leading-7">
                      Personalize<Text className="text-[#8B5CF6]">.</Text>
                    </Text>
                    <Text className="text-white text-[27px] font-black tracking-tight leading-7">
                      Inspire<Text className="text-[#EC4899]">.</Text>
                    </Text>
                  </View>
                  <Text className="text-white/60 text-[11px] font-medium leading-4" numberOfLines={2}>
                    {subtitle}
                  </Text>
                </View>

                {/* Right Overlapping Floating Mockup Cards */}
                <Animated.View style={[floatingCardStyle, { width: 130, height: 160, position: 'relative' }]}>
                  {/* Top Layer Card (Angled right) */}
                  <View
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: 80,
                      height: 135,
                      borderRadius: 16,
                      borderWidth: 1.5,
                      borderColor: 'rgba(167, 139, 250, 0.5)',
                      transform: [{ rotate: '9deg' }],
                      overflow: 'hidden',
                      shadowColor: '#8B5CF6',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.5,
                      shadowRadius: 10,
                      elevation: 8,
                    }}
                  >
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=400&q=80' }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  </View>

                  {/* Middle Layer Card (Angled left) */}
                  <View
                    style={{
                      position: 'absolute',
                      right: 28,
                      top: 25,
                      width: 78,
                      height: 125,
                      borderRadius: 16,
                      borderWidth: 1.5,
                      borderColor: 'rgba(236, 72, 153, 0.6)',
                      transform: [{ rotate: '-7deg' }],
                      overflow: 'hidden',
                      shadowColor: '#EC4899',
                      shadowOffset: { width: 0, height: 5 },
                      shadowOpacity: 0.45,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  </View>

                  {/* Bottom Foreground Card */}
                  <View
                    style={{
                      position: 'absolute',
                      right: 12,
                      bottom: 0,
                      width: 72,
                      height: 108,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: 'rgba(255, 255, 255, 0.35)',
                      transform: [{ rotate: '4deg' }],
                      overflow: 'hidden',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.6,
                      shadowRadius: 8,
                      elevation: 10,
                    }}
                  >
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80' }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  </View>
                </Animated.View>
              </View>
            </View>
          </ImageBackground>

          {/* Bottom Elevated Dark Sheet Card */}
          <View
            style={{
              flex: 1,
              backgroundColor: '#11121E',
              borderTopLeftRadius: 36,
              borderTopRightRadius: 36,
              borderTopWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              marginTop: -16,
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 36,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -6 },
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 16,
            }}
          >
            {/* Card Titles */}
            <View className="mb-5">
              <Text
                className="text-[23px] font-bold text-white tracking-wide"
                style={{ fontFamily: 'DMSerifDisplay_400Regular' }}
              >
                {cardTitle}
              </Text>
              {cardSubtitle && (
                <Text className="text-white/45 text-xs mt-1 font-medium">
                  {cardSubtitle}
                </Text>
              )}
            </View>

            {/* Form & Children */}
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
