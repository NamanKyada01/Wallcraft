import React from 'react';
import { Text, Pressable, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface AuthGradientButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export function AuthGradientButton({
  title,
  onPress,
  loading = false,
  iconName = 'arrow-forward',
}: AuthGradientButtonProps) {
  const handlePress = () => {
    if (loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      className="w-full active:opacity-90 mt-2"
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#EC4899',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
      }}
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
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <View className="flex-row items-center justify-center">
            <Text className="text-white font-extrabold text-base mr-2 tracking-wide">
              {title}
            </Text>
            <Ionicons name={iconName} size={19} color="white" />
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}
