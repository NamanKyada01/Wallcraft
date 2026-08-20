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
import { SocialAuthRow } from '../../components/auth/SocialAuthRow';
import { authService } from '../../services/auth.service';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Inline Validation States
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setServerError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email address is required');
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    try {
      setLoading(true);
      setServerError(null);
      await authService.signIn(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setServerError(e?.message || 'Failed to log in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthHeroLayout
      tag="Welcome back"
      cardTitle="Login to continue"
      cardSubtitle="Access your collection and favorites"
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

      {/* Password Input */}
      <AuthTextInput
        placeholder="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (passwordError) setPasswordError(null);
        }}
        secureTextEntry={!showPassword}
        leftIconName="lock-closed-outline"
        rightIconName={showPassword ? 'eye-off-outline' : 'eye-outline'}
        onRightIconPress={() => setShowPassword(!showPassword)}
        error={passwordError}
      />

      {/* Forgot Password Link */}
      <Pressable
        className="self-end mb-4 py-1"
        onPress={() => navigation.navigate('ForgotPassword')}
        hitSlop={8}
      >
        <Text className="text-[#A78BFA] text-xs font-semibold">
          Forgot password?
        </Text>
      </Pressable>

      {/* Main Login Gradient Button */}
      <AuthGradientButton
        title="Login"
        onPress={handleLogin}
        loading={loading}
      />

      {/* Social Logins */}
      <SocialAuthRow />

      {/* Bottom Switch to Register & Quick Demo */}
      <View className="items-center mt-6">
        <View className="flex-row items-center justify-center">
          <Text className="text-white/50 text-xs">New here? </Text>
          <Pressable onPress={() => navigation.navigate('Signup')} hitSlop={8}>
            <Text className="text-[#A78BFA] font-bold text-xs">
              Create an account
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => authService.signInDemo()}
          className="mt-3 py-1 px-3 rounded-full bg-white/5 active:bg-white/10"
          hitSlop={8}
        >
          <Text className="text-white/40 font-semibold text-[11px]">
            ⚡ Instant Demo Login (Alex Rivera)
          </Text>
        </Pressable>
      </View>
    </AuthHeroLayout>
  );
}
