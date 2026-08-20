import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface ColorSwatch {
  name: string;
  hex: string;
}

interface ColorPaletteExtractorProps {
  seedTitle?: string;
  onColorCopied?: (hex: string) => void;
}

// Deterministic harmonic color palette generator for wallpapers
function generatePalette(seed: string): ColorSwatch[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const palettes: ColorSwatch[][] = [
    [
      { name: 'Dominant', hex: '#0F1026' },
      { name: 'Electric', hex: '#9747FF' },
      { name: 'Neon Rose', hex: '#FF4B93' },
      { name: 'Cyan Glow', hex: '#38BDF8' },
      { name: 'Muted Sky', hex: '#6366F1' },
    ],
    [
      { name: 'Obsidian', hex: '#0B0C10' },
      { name: 'Gold Pulse', hex: '#FDB813' },
      { name: 'Amber Core', hex: '#F59E0B' },
      { name: 'Deep Bronze', hex: '#78350F' },
      { name: 'Starlight', hex: '#FEF3C7' },
    ],
    [
      { name: 'Midnight', hex: '#0A0F1D' },
      { name: 'Emerald', hex: '#10B981' },
      { name: 'Teal Mint', hex: '#2DD4BF' },
      { name: 'Forest Dark', hex: '#064E3B' },
      { name: 'Soft Moss', hex: '#6EE7B7' },
    ],
    [
      { name: 'Abyss', hex: '#111827' },
      { name: 'Crimson', hex: '#EF4444' },
      { name: 'Flame Orange', hex: '#F97316' },
      { name: 'Sunset Glow', hex: '#FB7185' },
      { name: 'Charcoal', hex: '#1F2937' },
    ],
  ];

  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}

export function ColorPaletteExtractor({
  seedTitle = 'Wallcraft',
  onColorCopied,
}: ColorPaletteExtractorProps) {
  const palette = generatePalette(seedTitle);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopy = (hex: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiedHex(hex);
    onColorCopied?.(hex);
    setTimeout(() => {
      setCopiedHex(null);
    }, 2000);
  };

  return (
    <View className="my-4 p-4 rounded-3xl bg-[#151624] border border-white/10">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-7 h-7 rounded-lg bg-[#9747FF]/20 items-center justify-center mr-2">
            <Ionicons name="color-palette-outline" size={16} color="#9747FF" />
          </View>
          <Text className="text-white font-bold text-sm">
            Extracted Theme Palette
          </Text>
        </View>

        {copiedHex ? (
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(150)}
            className="flex-row items-center bg-[#22C55E]/15 border border-[#22C55E]/40 px-2 py-0.5 rounded-full"
          >
            <Ionicons name="checkmark" size={11} color="#22C55E" />
            <Text className="text-[#22C55E] text-[10px] font-bold ml-1">Copied {copiedHex}</Text>
          </Animated.View>
        ) : (
          <Text className="text-white/40 text-[11px] font-medium">Tap to copy HEX</Text>
        )}
      </View>

      {/* 5 Color Swatches Row */}
      <View className="flex-row justify-between gap-2">
        {palette.map((swatch, idx) => (
          <Pressable
            key={idx}
            onPress={() => handleCopy(swatch.hex)}
            className="flex-1 items-center active:scale-95 transition"
          >
            <View
              style={{ backgroundColor: swatch.hex }}
              className="w-full h-11 rounded-2xl border border-white/15 shadow-md items-center justify-center mb-1.5"
            >
              {copiedHex === swatch.hex && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <Text className="text-white font-extrabold text-[10px] tracking-tight">
              {swatch.hex}
            </Text>
            <Text className="text-white/40 text-[9px] font-medium" numberOfLines={1}>
              {swatch.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
