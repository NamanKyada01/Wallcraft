import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface ResolutionOption {
  id: 'mobile' | 'desktop' | 'watch' | 'amoled';
  title: string;
  resolution: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
}

const RESOLUTIONS: ResolutionOption[] = [
  {
    id: 'mobile',
    title: 'Mobile Portrait (9:16)',
    resolution: '1080 × 2400 • Original 4K',
    desc: 'Optimized for all flagship smartphone displays',
    icon: 'phone-portrait-outline',
    badge: 'Popular',
  },
  {
    id: 'desktop',
    title: 'Desktop & Tablet (16:9)',
    resolution: '3840 × 2160 • UHD 4K',
    desc: 'Wide-screen landscape format for Mac & PC',
    icon: 'laptop-outline',
  },
  {
    id: 'watch',
    title: 'Smartwatch Face (1:1)',
    resolution: '600 × 600 • Retina Square',
    desc: 'Centered square crop for Apple Watch & Wear OS',
    icon: 'watch-outline',
  },
  {
    id: 'amoled',
    title: 'AMOLED True-Black',
    desc: 'Pure #000000 deep black tuning for OLED battery saver',
    resolution: 'Custom HDR OLED',
    icon: 'contrast-outline',
    badge: 'Battery Saver',
  },
];

interface ResolutionExportModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmDownload: (format: 'mobile' | 'desktop' | 'watch' | 'amoled') => void;
  title: string;
}

export function ResolutionExportModal({
  visible,
  onClose,
  onConfirmDownload,
  title,
}: ResolutionExportModalProps) {
  const [selectedId, setSelectedId] = useState<'mobile' | 'desktop' | 'watch' | 'amoled'>('mobile');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      onConfirmDownload(selectedId);
      onClose();
    }, 1000);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/75 justify-end">
        {/* Dismiss Backdrop */}
        <Pressable className="flex-1" onPress={onClose} />

        {/* Modal Bottom Sheet Card */}
        <View className="bg-[#12131E] rounded-t-[36px] border-t border-white/15 px-6 pt-6 pb-8 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-xl bg-[#9747FF]/20 items-center justify-center mr-2.5">
                <Ionicons name="download-outline" size={18} color="#9747FF" />
              </View>
              <Text
                className="text-xl font-bold text-white tracking-wide"
                style={{ fontFamily: 'DMSerifDisplay_400Regular' }}
              >
                Choose Export Format
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
            >
              <Ionicons name="close" size={18} color="white" />
            </Pressable>
          </View>
          <Text className="text-white/50 text-xs mb-5 font-medium">
            Select the optimal aspect ratio & resolution for {title}
          </Text>

          {/* Options List */}
          <View className="gap-3 mb-6">
            {RESOLUTIONS.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedId(item.id);
                  }}
                  className={`p-4 rounded-2xl border flex-row items-center ${
                    isSelected
                      ? 'bg-[#1E1B33] border-[#9747FF]'
                      : 'bg-[#171827] border-white/10'
                  }`}
                >
                  <View
                    className={`w-11 h-11 rounded-2xl items-center justify-center mr-3.5 ${
                      isSelected ? 'bg-[#9747FF]' : 'bg-white/5'
                    }`}
                  >
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={isSelected ? 'white' : '#A78BFA'}
                    />
                  </View>
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center">
                      <Text className="text-white font-bold text-sm mr-2">
                        {item.title}
                      </Text>
                      {item.badge && (
                        <View className="px-2 py-0.5 rounded-full bg-[#FF4B93]/20 border border-[#FF4B93]/40">
                          <Text className="text-[#FF4B93] text-[9px] font-extrabold uppercase">
                            {item.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-[#9747FF] text-xs font-semibold mt-0.5">
                      {item.resolution}
                    </Text>
                    <Text className="text-white/45 text-[11px] mt-0.5 leading-4">
                      {item.desc}
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

          {/* Download Action Button */}
          <Pressable
            onPress={handleDownload}
            disabled={isDownloading}
            className="w-full rounded-2xl overflow-hidden active:opacity-90 shadow-lg shadow-[#FF4B93]/40"
          >
            <LinearGradient
              colors={['#FF4B93', '#9747FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 54,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 20,
                borderRadius: 20,
              }}
            >
              {isDownloading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <View className="flex-row items-center justify-center">
                  <Text className="text-white font-extrabold text-base mr-2">
                    Save Wallpaper to Gallery
                  </Text>
                  <Ionicons name="arrow-down-circle" size={20} color="white" />
                </View>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
