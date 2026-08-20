import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInRight,
  FadeOutLeft,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { AuthGradientButton } from '../../components/auth/AuthGradientButton';
import colors from '../../theme/colors';

const { width } = Dimensions.get('window');

export const PREFERENCES_KEY = 'user_wallpaper_preferences';

interface PreferenceGenre {
  id: string;
  name: string;
  image: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const GENRES: PreferenceGenre[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk & Neon',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    icon: 'flash-outline',
  },
  {
    id: 'nature',
    name: 'Mountains & Nature',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
    icon: 'leaf-outline',
  },
  {
    id: 'abstract',
    name: '3D Glass & Abstract',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    icon: 'cube-outline',
  },
  {
    id: 'space',
    name: 'Galaxy & Deep Space',
    image: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=400&q=80',
    icon: 'planet-outline',
  },
  {
    id: 'minimal',
    name: 'Obsidian Minimal',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80',
    icon: 'contrast-outline',
  },
  {
    id: 'cars',
    name: 'Supercars & Speed',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80',
    icon: 'car-sport-outline',
  },
];

const RESOLUTION_MODES = [
  {
    id: 'amoled',
    title: 'AMOLED True Black',
    desc: 'Deep obsidian blacks optimized for battery saving',
    icon: 'moon-outline',
  },
  {
    id: 'uhd_4k',
    title: 'Ultra HD 4K Fidelity',
    desc: 'Maximum sharpness for flagship high-DPI displays',
    icon: 'sparkles-outline',
  },
  {
    id: 'vibrant',
    title: 'Dynamic HDR Colors',
    desc: 'Punchy vivid gradients and luminous high contrast',
    icon: 'color-palette-outline',
  },
];

interface UserPreferencesScreenProps {
  onComplete: () => void;
}

export function UserPreferencesScreen({ onComplete }: UserPreferencesScreenProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['cyberpunk', 'space', 'minimal']);
  const [selectedResolution, setSelectedResolution] = useState('uhd_4k');
  const [dailyNotification, setDailyNotification] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggleGenre = (id: string) => {
    Haptics.selectionAsync();
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    try {
      setSaving(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const preferences = {
        genres: selectedGenres,
        resolutionMode: selectedResolution,
        dailySpotlight: dailyNotification,
        completedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
      onComplete();
    } catch {
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0D0E17]">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        {/* Top Header Navigation */}
        <View className="px-6 py-3 flex-row items-center justify-between">
          {step === 2 ? (
            <Pressable
              onPress={() => setStep(1)}
              className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
              hitSlop={8}
            >
              <Ionicons name="arrow-back" size={18} color="white" />
            </Pressable>
          ) : (
            <View className="w-9" />
          )}

          {/* Progress Indicator */}
          <View className="flex-row items-center gap-1.5">
            <View
              className={`h-1.5 rounded-full ${
                step >= 1 ? 'w-8 bg-[#FF4B93]' : 'w-4 bg-white/20'
              }`}
            />
            <View
              className={`h-1.5 rounded-full ${
                step >= 2 ? 'w-8 bg-[#9747FF]' : 'w-4 bg-white/20'
              }`}
            />
          </View>

          {/* Skip Button */}
          <Pressable onPress={handleFinish} hitSlop={8}>
            <Text className="text-white/50 text-xs font-bold uppercase tracking-wider">
              Skip
            </Text>
          </Pressable>
        </View>

        {step === 1 ? (
          <Animated.View
            key="step1"
            entering={FadeInRight.duration(250)}
            exiting={FadeOutLeft.duration(200)}
            className="flex-1"
          >
            <ScrollView
              className="flex-1 px-6"
              contentContainerStyle={{ paddingBottom: 110 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Title & Subtitle */}
              <View className="my-4">
                <Text className="text-[#A78BFA] text-xs font-bold uppercase tracking-widest mb-1">
                  Personalize (1/2)
                </Text>
                <Text
                  className="text-3xl font-bold text-white tracking-wide leading-9"
                  style={{ fontFamily: 'DMSerifDisplay_400Regular' }}
                >
                  Choose your wallpaper styles
                </Text>
                <Text className="text-white/50 text-xs mt-1.5 font-medium leading-5">
                  Select 2 or more genres so our AI can curate your personalized daily 4K spotlight.
                </Text>
              </View>

              {/* Genre Grid */}
              <View className="flex-row flex-wrap justify-between gap-y-3.5 mt-2">
                {GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre.id);
                  return (
                    <Pressable
                      key={genre.id}
                      onPress={() => toggleGenre(genre.id)}
                      style={{
                        width: (width - 48 - 12) / 2,
                        height: 140,
                        borderRadius: 20,
                        overflow: 'hidden',
                        borderWidth: 2,
                        borderColor: isSelected ? '#FF4B93' : 'rgba(255,255,255,0.08)',
                      }}
                      className="relative active:opacity-90 shadow-md"
                    >
                      <ImageBackground
                        source={{ uri: genre.image }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      >
                        <LinearGradient
                          colors={
                            isSelected
                              ? ['rgba(255, 75, 147, 0.4)', 'rgba(151, 71, 255, 0.85)']
                              : ['rgba(0,0,0,0.1)', 'rgba(13,14,23,0.9)']
                          }
                          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                        />

                        {/* Top Checkmark Pill */}
                        <View className="p-3 flex-row justify-between items-start">
                          <View className="w-7 h-7 rounded-full bg-black/40 items-center justify-center">
                            <Ionicons name={genre.icon} size={15} color="white" />
                          </View>
                          <View
                            className={`w-6 h-6 rounded-full items-center justify-center border ${
                              isSelected
                                ? 'bg-white border-white'
                                : 'bg-black/30 border-white/30'
                            }`}
                          >
                            {isSelected && (
                              <Ionicons name="checkmark" size={15} color="#FF4B93" />
                            )}
                          </View>
                        </View>

                        {/* Bottom Label */}
                        <View className="p-3 justify-end flex-1">
                          <Text className="text-white font-extrabold text-sm tracking-wide">
                            {genre.name}
                          </Text>
                        </View>
                      </ImageBackground>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Bottom Fixed Action Dock */}
            <View
              className="absolute bottom-0 left-0 right-0 px-6 pt-3 pb-6 bg-[#0D0E17]/95 border-t border-white/10"
              style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
              <AuthGradientButton
                title={`Continue (${selectedGenres.length} selected)`}
                onPress={() => {
                  if (selectedGenres.length === 0) {
                    setSelectedGenres(['cyberpunk', 'space']);
                  }
                  setStep(2);
                }}
              />
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            key="step2"
            entering={FadeInRight.duration(250)}
            exiting={FadeOutLeft.duration(200)}
            className="flex-1"
          >
            <ScrollView
              className="flex-1 px-6"
              contentContainerStyle={{ paddingBottom: 110 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Title & Subtitle */}
              <View className="my-4">
                <Text className="text-[#9747FF] text-xs font-bold uppercase tracking-widest mb-1">
                  Quality & Feed (2/2)
                </Text>
                <Text
                  className="text-3xl font-bold text-white tracking-wide leading-9"
                  style={{ fontFamily: 'DMSerifDisplay_400Regular' }}
                >
                  Screen & Daily Drop Setup
                </Text>
                <Text className="text-white/50 text-xs mt-1.5 font-medium leading-5">
                  Tune wallpaper rendering quality and daily curation updates.
                </Text>
              </View>

              {/* Resolution Options */}
              <Text className="text-white/70 text-xs font-bold uppercase tracking-wider mb-3 mt-2">
                Display Optimization
              </Text>
              <View className="gap-3 mb-6">
                {RESOLUTION_MODES.map((mode) => {
                  const isSelected = selectedResolution === mode.id;
                  return (
                    <Pressable
                      key={mode.id}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedResolution(mode.id);
                      }}
                      className={`p-4 rounded-2xl border flex-row items-center ${
                        isSelected
                          ? 'bg-[#1D1B33] border-[#9747FF]'
                          : 'bg-[#151624] border-white/10'
                      }`}
                    >
                      <View
                        className={`w-11 h-11 rounded-2xl items-center justify-center mr-3.5 ${
                          isSelected ? 'bg-[#9747FF]' : 'bg-white/5'
                        }`}
                      >
                        <Ionicons
                          name={mode.icon as any}
                          size={22}
                          color={isSelected ? 'white' : colors.text.secondary}
                        />
                      </View>
                      <View className="flex-1 pr-2">
                        <Text className="text-white font-bold text-sm">
                          {mode.title}
                        </Text>
                        <Text className="text-white/45 text-xs mt-0.5 font-medium leading-4">
                          {mode.desc}
                        </Text>
                      </View>
                      <View
                        className={`w-6 h-6 rounded-full items-center justify-center border ${
                          isSelected
                            ? 'bg-[#9747FF] border-[#9747FF]'
                            : 'border-white/20'
                        }`}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={15} color="white" />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Daily Spotlight Toggle */}
              <Text className="text-white/70 text-xs font-bold uppercase tracking-wider mb-3">
                Daily Curation
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setDailyNotification(!dailyNotification);
                }}
                className="p-4 rounded-2xl bg-[#151624] border border-white/10 flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 pr-3">
                  <View className="w-11 h-11 rounded-2xl bg-[#FF4B93]/20 items-center justify-center mr-3.5 border border-[#FF4B93]/40">
                    <Ionicons name="notifications" size={22} color="#FF4B93" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-sm">
                      Daily 4K Spotlight Alert
                    </Text>
                    <Text className="text-white/45 text-xs mt-0.5 font-medium leading-4">
                      Notify when today's premium featured wallpaper drops
                    </Text>
                  </View>
                </View>
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center border ${
                    dailyNotification
                      ? 'bg-[#FF4B93] border-[#FF4B93]'
                      : 'border-white/20'
                  }`}
                >
                  {dailyNotification && (
                    <Ionicons name="checkmark" size={15} color="white" />
                  )}
                </View>
              </Pressable>
            </ScrollView>

            {/* Bottom Fixed Action Dock */}
            <View
              className="absolute bottom-0 left-0 right-0 px-6 pt-3 pb-6 bg-[#0D0E17]/95 border-t border-white/10"
              style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
              <AuthGradientButton
                title="Finish & Launch Wallcraft 🚀"
                onPress={handleFinish}
                loading={saving}
              />
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}
