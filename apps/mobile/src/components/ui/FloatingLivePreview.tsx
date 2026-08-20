import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import colors from '../../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FloatingLivePreviewProps {
  visible: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export function FloatingLivePreview({
  visible,
  onClose,
  imageUrl,
  title,
}: FloatingLivePreviewProps) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'lock' | 'home'>('lock');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      };
      setCurrentDate(now.toLocaleDateString(undefined, options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMode = (newMode: 'lock' | 'home') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(newMode);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/90 items-center justify-center">
        {/* Fullscreen Wallpaper */}
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />

        {/* Dark subtle gradient overlay for readability */}
        <View
          style={StyleSheet.absoluteFill}
          className="bg-black/25 pointer-events-none"
        />

        {/* Floating Top Bar with Mode Switcher & Close */}
        <View
          className="absolute top-0 left-0 right-0 z-50 flex-row items-center justify-between px-5"
          style={{ paddingTop: Math.max(insets.top, 16) }}
        >
          {/* Mode Switcher Pill */}
          <View className="flex-row bg-black/50 border border-white/20 rounded-full p-1 backdrop-blur-md">
            <Pressable
              onPress={() => toggleMode('lock')}
              className={`px-3 py-1.5 rounded-full ${
                mode === 'lock' ? 'bg-accent-primary' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  mode === 'lock' ? 'text-white' : 'text-white/70'
                }`}
              >
                🔒 Lock Screen
              </Text>
            </Pressable>
            <Pressable
              onPress={() => toggleMode('home')}
              className={`px-3 py-1.5 rounded-full ${
                mode === 'home' ? 'bg-accent-primary' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  mode === 'home' ? 'text-white' : 'text-white/70'
                }`}
              >
                📱 Home Screen
              </Text>
            </Pressable>
          </View>

          {/* Close Button */}
          <Pressable
            onPress={onClose}
            className="w-9 h-9 rounded-full bg-black/50 border border-white/20 items-center justify-center"
          >
            <Ionicons name="close" size={20} color="white" />
          </Pressable>
        </View>

        {/* Mode 1: Lock Screen Simulation */}
        {mode === 'lock' && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            className="flex-1 w-full justify-between px-6 pb-8"
            style={{ paddingTop: Math.max(insets.top + 70, 90) }}
          >
            {/* Clock & Date */}
            <View className="items-center">
              <View className="flex-row items-center mb-1">
                <Ionicons name="lock-closed" size={14} color="rgba(255,255,255,0.8)" />
                <Text className="text-white/80 text-xs ml-1 font-medium">Wallcraft</Text>
              </View>
              <Text className="text-white/90 text-sm font-medium tracking-wide">
                {currentDate}
              </Text>
              <Text className="text-white text-7xl font-extralight tracking-tighter mt-1">
                {currentTime}
              </Text>

              {/* Floating Widget */}
              <View className="mt-4 flex-row items-center bg-black/30 border border-white/15 px-4 py-2 rounded-2xl backdrop-blur-md">
                <Ionicons name="sparkles" size={16} color={colors.accent.secondary} />
                <Text className="text-white text-xs font-semibold ml-2" numberOfLines={1}>
                  {title}
                </Text>
              </View>
            </View>

            {/* Bottom Flashlight & Camera shortcuts */}
            <View className="flex-row items-center justify-between px-4">
              <View className="w-12 h-12 rounded-full bg-black/40 border border-white/20 items-center justify-center">
                <Ionicons name="flashlight" size={20} color="white" />
              </View>
              <View className="items-center">
                <View className="w-32 h-1 rounded-full bg-white/70 mb-1" />
                <Text className="text-white/60 text-[10px]">Swipe up to open</Text>
              </View>
              <View className="w-12 h-12 rounded-full bg-black/40 border border-white/20 items-center justify-center">
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </View>
          </Animated.View>
        )}

        {/* Mode 2: Home Screen Simulation */}
        {mode === 'home' && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            className="flex-1 w-full justify-between px-6 pb-6"
            style={{ paddingTop: Math.max(insets.top + 70, 90) }}
          >
            {/* App Grid */}
            <View className="grid grid-cols-4 gap-y-6 pt-4">
              {[
                { name: 'Photos', icon: 'images', color: '#38BDF8' },
                { name: 'Messages', icon: 'chatbubbles', color: '#22C55E' },
                { name: 'Music', icon: 'musical-notes', color: '#EC4899' },
                { name: 'Camera', icon: 'camera', color: '#64748B' },
                { name: 'Safari', icon: 'compass', color: '#3B82F6' },
                { name: 'Maps', icon: 'map', color: '#10B981' },
                { name: 'Settings', icon: 'settings', color: '#94A3B8' },
                { name: 'Wallcraft', icon: 'color-palette', color: '#7C6EF6' },
              ].map((app, idx) => (
                <View key={idx} className="items-center w-1/4">
                  <View
                    style={{ backgroundColor: app.color }}
                    className="w-14 h-14 rounded-2xl items-center justify-center shadow-lg border border-white/20"
                  >
                    <Ionicons name={app.icon as any} size={26} color="white" />
                  </View>
                  <Text className="text-white text-[11px] font-medium mt-1.5 shadow">
                    {app.name}
                  </Text>
                </View>
              ))}
            </View>

            {/* Bottom Dock */}
            <View className="bg-white/20 border border-white/25 rounded-3xl p-3 flex-row justify-around backdrop-blur-xl">
              {[
                { icon: 'call', color: '#22C55E' },
                { icon: 'mail', color: '#3B82F6' },
                { icon: 'globe', color: '#06B6D4' },
                { icon: 'sparkles', color: '#7C6EF6' },
              ].map((app, idx) => (
                <View
                  key={idx}
                  style={{ backgroundColor: app.color }}
                  className="w-13 h-13 rounded-2xl items-center justify-center shadow-md border border-white/20"
                >
                  <Ionicons name={app.icon as any} size={24} color="white" />
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}
