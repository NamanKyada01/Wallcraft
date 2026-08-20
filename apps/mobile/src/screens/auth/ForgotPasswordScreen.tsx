import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { AuthHeroLayout } from '../../components/auth/AuthHeroLayout';
import { AuthTextInput } from '../../components/auth/AuthTextInput';
import { AuthGradientButton } from '../../components/auth/AuthGradientButton';
import { authService } from '../../services/auth.service';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    setEmailError(null);
    setServerError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      setLoading(true);
      await authService.sendOtp(email.trim(), 'recovery');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('OTPVerification', {
        email: email.trim(),
        type: 'forgot_password',
      });
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setServerError(err?.message || 'Failed to send recovery code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthHeroLayout
      tag="Account recovery"
      cardTitle="Reset your password"
      cardSubtitle="Enter your email to receive a 6-digit recovery code"
      showBackButton
      onBackPress={() => navigation.goBack()}
    >
      {/* Server Error Message */}
      {serverError && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="mb-4 flex-row items-center bg-status-error/15 border border-status-error/40 px-4 py-3 rounded-2xl"
        >
          <Ionicons name="alert-circle" size={18} color="#EF4444" />
          <Text className="text-status-error text-xs font-semibold ml-2.5 flex-1">
            {serverError}
          </Text>
        </Animated.View>
      )}

      {/* Email Input */}
      <AuthTextInput
        placeholder="Email address"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (emailError) setEmailError(null);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIconName="mail-outline"
        error={emailError}
      />

      {/* Send Recovery Code Button */}
      <AuthGradientButton
        title="Send Recovery Code"
        onPress={handleSendCode}
        loading={loading}
      />

      {/* Back to Login */}
      <View className="flex-row justify-center items-center mt-7">
        <Text className="text-white/50 text-xs">Remember your password? </Text>
        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
          <Text className="text-[#A78BFA] font-bold text-xs">
            Log In
          </Text>
        </Pressable>
      </View>
    </AuthHeroLayout>
  );
}
