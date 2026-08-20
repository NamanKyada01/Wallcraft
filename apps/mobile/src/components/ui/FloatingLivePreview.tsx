import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface FloatingLivePreviewProps {
  visible: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

type ClockStyle = 'serif' | 'minimal' | 'bold' | 'cyber';

export function FloatingLivePreview({
  visible,
  onClose,
  imageUrl,
  title,
}: FloatingLivePreviewProps) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'lock' | 'home'>('lock');
  const [clockStyle, setClockStyle] = useState<ClockStyle>('serif');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'short',
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

  const cycleClockStyle = () => {
    Haptics.selectionAsync();
    const styles: ClockStyle[] = ['serif', 'minimal', 'bold', 'cyber'];
    const next = styles[(styles.indexOf(clockStyle) + 1) % styles.length];
    setClockStyle(next);
  };

  const getClockStyle = () => {
    switch (clockStyle) {
      case 'serif':
        return { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 76, letterSpacing: 2 };
      case 'minimal':
        return { fontWeight: '200' as const, fontSize: 80, letterSpacing: -2 };
      case 'bold':
        return { fontWeight: '900' as const, fontSize: 74, letterSpacing: 1 };
      case 'cyber':
        return { fontFamily: 'monospace', fontWeight: '700' as const, fontSize: 70, letterSpacing: 3 };
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black items-center justify-center">
        {/* Fullscreen Wallpaper Background */}
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />

        {/* Subtle Dark Gradient Overlay for Readability */}
        <View
          style={StyleSheet.absoluteFill}
          className="bg-black/25 pointer-events-none"
        />

        {/* Floating Top Control Dock */}
        <View
          className="absolute top-0 left-0 right-0 z-50 flex-row items-center justify-between px-5"
          style={{ paddingTop: Math.max(insets.top, 16) }}
        >
          {/* Mode Switcher Pill */}
          <View className="flex-row bg-black/60 border border-white/20 rounded-full p-1 shadow-lg">
            <Pressable
              onPress={() => toggleMode('lock')}
              className={`px-3 py-1.5 rounded-full ${
                mode === 'lock' ? 'bg-[#9747FF]' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  mode === 'lock' ? 'text-white' : 'text-white/70'
                }`}
              >
                🔒 Lock Screen
              </Text>
            </Pressable>
            <Pressable
              onPress={() => toggleMode('home')}
              className={`px-3 py-1.5 rounded-full ${
                mode === 'home' ? 'bg-[#9747FF]' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  mode === 'home' ? 'text-white' : 'text-white/70'
                }`}
              >
                📱 Home Screen
              </Text>
            </Pressable>
          </View>

          {/* Action Row: Clock Font Toggle + Close Button */}
          <View className="flex-row items-center gap-2">
            {mode === 'lock' && (
              <Pressable
                onPress={cycleClockStyle}
                className="px-2.5 py-1.5 rounded-full bg-black/60 border border-white/20 flex-row items-center"
              >
                <Ionicons name="text-outline" size={14} color="#A78BFA" />
                <Text className="text-white text-[11px] font-bold ml-1 uppercase">
                  {clockStyle}
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={onClose}
              className="w-9 h-9 rounded-full bg-black/60 border border-white/20 items-center justify-center active:bg-white/20"
            >
              <Ionicons name="close" size={20} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Mode 1: Lock Screen Simulator */}
        {mode === 'lock' && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            className="flex-1 w-full justify-between px-6 pb-8"
            style={{ paddingTop: Math.max(insets.top + 60, 80) }}
          >
            {/* Lock Header & Clock */}
            <View className="items-center">
              <View className="flex-row items-center mb-1 bg-black/30 border border-white/10 px-3 py-0.5 rounded-full">
                <Ionicons name="lock-closed" size={12} color="#A78BFA" />
                <Text className="text-white/80 text-[11px] ml-1 font-semibold">Wallcraft 4K</Text>
              </View>

              <Text className="text-white/90 text-sm font-semibold tracking-wide">
                {currentDate}
              </Text>

              <Text
                className="text-white text-center mt-0.5 text-shadow-lg"
                style={getClockStyle()}
              >
                {currentTime}
              </Text>

              {/* Dynamic Live Widgets Row */}
              <View className="flex-row items-center gap-2 mt-2">
                {/* Weather Widget */}
                <View className="flex-row items-center bg-black/40 border border-white/15 px-3 py-1.5 rounded-xl">
                  <Ionicons name="partly-sunny" size={14} color="#FBBF24" />
                  <Text className="text-white text-[11px] font-bold ml-1.5">72° Sunny</Text>
                </View>

                {/* Battery Widget */}
                <View className="flex-row items-center bg-black/40 border border-white/15 px-3 py-1.5 rounded-xl">
                  <Ionicons name="battery-charging" size={14} color="#22C55E" />
                  <Text className="text-white text-[11px] font-bold ml-1.5">98%</Text>
                </View>

                {/* Title Badge */}
                <View className="flex-row items-center bg-black/40 border border-white/15 px-3 py-1.5 rounded-xl">
                  <Ionicons name="sparkles" size={13} color="#EC4899" />
                  <Text className="text-white text-[11px] font-bold ml-1" numberOfLines={1}>
                    {title}
                  </Text>
                </View>
              </View>
            </View>

            {/* Middle: Simulated Lock Screen Notification Pill */}
            {showNotification && (
              <Animated.View
                entering={SlideInUp.duration(300)}
                exiting={SlideOutUp.duration(200)}
                className="mx-1 p-3.5 rounded-2xl bg-black/50 border border-white/15 shadow-xl flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF4B93] to-[#9747FF] items-center justify-center mr-3">
                    <Ionicons name="color-palette" size={18} color="white" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-white font-bold text-xs">Wallcraft Spotlight</Text>
                      <Text className="text-white/40 text-[10px]">now</Text>
                    </View>
                    <Text className="text-white/80 text-xs mt-0.5" numberOfLines={1}>
                      Wallpaper preview applied in Ultra HD 4K
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => setShowNotification(false)}
                  className="w-6 h-6 rounded-full bg-white/10 items-center justify-center"
                >
                  <Ionicons name="close" size={12} color="white" />
                </Pressable>
              </Animated.View>
            )}

            {/* Bottom Flashlight & Camera Shortcuts */}
            <View className="flex-row items-center justify-between px-2">
              <View className="w-12 h-12 rounded-full bg-black/50 border border-white/20 items-center justify-center shadow-lg">
                <Ionicons name="flashlight" size={20} color="white" />
              </View>
              <View className="items-center">
                <View className="w-32 h-1 rounded-full bg-white/70 mb-1" />
                <Text className="text-white/60 text-[10px] font-medium">Swipe up to unlock</Text>
              </View>
              <View className="w-12 h-12 rounded-full bg-black/50 border border-white/20 items-center justify-center shadow-lg">
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </View>
          </Animated.View>
        )}

        {/* Mode 2: Home Screen Simulator */}
        {mode === 'home' && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            className="flex-1 w-full justify-between px-6 pb-6"
            style={{ paddingTop: Math.max(insets.top + 70, 90) }}
          >
            {/* App Grid */}
            <View className="flex-row flex-wrap justify-between gap-y-7 pt-4">
              {[
                { name: 'Photos', icon: 'images', color: '#38BDF8' },
                { name: 'Messages', icon: 'chatbubbles', color: '#22C55E' },
                { name: 'Music', icon: 'musical-notes', color: '#EC4899' },
                { name: 'Camera', icon: 'camera', color: '#475569' },
                { name: 'Safari', icon: 'compass', color: '#3B82F6' },
                { name: 'Maps', icon: 'map', color: '#10B981' },
                { name: 'Settings', icon: 'settings', color: '#64748B' },
                { name: 'Wallcraft', icon: 'sparkles', color: '#9747FF' },
              ].map((app, idx) => (
                <View key={idx} style={{ width: '22%' }} className="items-center">
                  <View
                    style={{ backgroundColor: app.color }}
                    className="w-14 h-14 rounded-2xl items-center justify-center shadow-lg border border-white/25"
                  >
                    <Ionicons name={app.icon as any} size={26} color="white" />
                  </View>
                  <Text className="text-white text-[11px] font-bold mt-1.5 shadow">
                    {app.name}
                  </Text>
                </View>
              ))}
            </View>

            {/* Bottom Frosted Glass Dock */}
            <View className="bg-black/50 border border-white/20 rounded-3xl p-3 flex-row justify-around shadow-2xl">
              {[
                { icon: 'call', color: '#22C55E' },
                { icon: 'mail', color: '#3B82F6' },
                { icon: 'globe', color: '#06B6D4' },
                { icon: 'color-palette', color: '#9747FF' },
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
