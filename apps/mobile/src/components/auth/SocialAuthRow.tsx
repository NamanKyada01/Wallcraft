import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { authService } from '../../services/auth.service';

interface SocialAuthRowProps {
  onSocialLogin?: (provider: string) => void;
}

export function SocialAuthRow({ onSocialLogin }: SocialAuthRowProps) {
  const handlePress = (provider: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onSocialLogin) {
      onSocialLogin(provider);
    } else {
      authService.signInDemo();
    }
  };

  return (
    <View className="mt-5">
      {/* OR Divider */}
      <View className="flex-row items-center justify-center my-4">
        <View className="flex-1 h-px bg-white/10" />
        <Text className="text-white/40 text-xs font-bold px-3 uppercase tracking-widest">
          OR
        </Text>
        <View className="flex-1 h-px bg-white/10" />
      </View>

      {/* 3 Social Buttons */}
      <View className="flex-row justify-between gap-3">
        {/* Google */}
        <Pressable
          onPress={() => handlePress('google')}
          style={{
            flex: 1,
            height: 50,
            borderRadius: 18,
            backgroundColor: '#181926',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="logo-google" size={18} color="#EA4335" />
          <Text className="text-white font-semibold text-xs ml-2">Google</Text>
        </Pressable>

        {/* Facebook */}
        <Pressable
          onPress={() => handlePress('facebook')}
          style={{
            flex: 1,
            height: 50,
            borderRadius: 18,
            backgroundColor: '#181926',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="logo-facebook" size={18} color="#1877F2" />
          <Text className="text-white font-semibold text-xs ml-2">Facebook</Text>
        </Pressable>

        {/* Apple */}
        <Pressable
          onPress={() => handlePress('apple')}
          style={{
            flex: 1,
            height: 50,
            borderRadius: 18,
            backgroundColor: '#181926',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="logo-apple" size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold text-xs ml-2">Apple</Text>
        </Pressable>
      </View>
    </View>
  );
}
