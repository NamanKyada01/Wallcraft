import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { authService } from '../../services/auth.service';
import colors from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Inline Validation States
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

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
      setServerError(e?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setEmailError('Please enter your email to reset password');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    try {
      setEmailError(null);
      setServerError(null);
      await authService.resetPassword(email.trim());
      setServerSuccess('Password reset link sent to your email!');
    } catch (e: any) {
      setServerError(e?.message || 'Failed to send password reset email.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-10"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Brand Hero */}
          <View className="items-center mt-6 mb-8">
            <View className="relative items-center justify-center mb-3">
              <View className="w-20 h-20 rounded-3xl bg-accent-primary/20 border border-accent-primary/30 items-center justify-center shadow-lg shadow-accent-primary/25">
                <Image
                  source={require('../../../assets/nano-banana-logo.png')}
                  style={{ width: 64, height: 64, borderRadius: 16 }}
                  contentFit="cover"
                />
              </View>
            </View>

            <Text
              className="text-3xl font-extrabold text-text-primary tracking-wide text-center"
              style={{ fontFamily: 'DMSerifDisplay_400Regular' }}
            >
              Welcome Back
            </Text>
            <Text className="text-text-secondary text-xs mt-1 text-center font-medium">
              Log in to sync your 4K wallpapers and favorites
            </Text>
          </View>

          {/* Server Error / Success Banners (Rendered in UI) */}
          {serverError && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              className="mb-5 flex-row items-center bg-status-error/15 border border-status-error/40 px-4 py-3 rounded-2xl"
            >
              <Ionicons name="alert-circle" size={20} color={colors.status.error} />
              <Text className="text-status-error text-xs font-semibold ml-2.5 flex-1 leading-4">
                {serverError}
              </Text>
            </Animated.View>
          )}

          {serverSuccess && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              className="mb-5 flex-row items-center bg-status-success/15 border border-status-success/40 px-4 py-3 rounded-2xl"
            >
              <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
              <Text className="text-status-success text-xs font-semibold ml-2.5 flex-1 leading-4">
                {serverSuccess}
              </Text>
            </Animated.View>
          )}

          {/* Form Inputs with Inline Errors */}
          <TextInput
            label={t('auth.email')}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError(null);
            }}
            placeholder="your.email@domain.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
            leftIcon={
              <Ionicons
                name="mail-outline"
                size={19}
                color={emailError ? colors.status.error : colors.text.tertiary}
              />
            }
          />

          <TextInput
            label={t('auth.password')}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            placeholder="••••••••••••"
            secureTextEntry={!showPassword}
            error={passwordError}
            leftIcon={
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color={passwordError ? colors.status.error : colors.text.tertiary}
              />
            }
            rightIcon={
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.text.tertiary}
              />
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          {/* Forgot Password Link */}
          <Pressable
            className="self-end mb-6 py-1"
            onPress={handleForgotPassword}
            hitSlop={8}
          >
            <Text className="text-accent-primary text-xs font-bold">
              {t('auth.forgotPassword')}
            </Text>
          </Pressable>

          {/* Login Action Button */}
          <Button
            title={t('auth.login')}
            onPress={handleLogin}
            loading={loading}
            size="lg"
            fullWidth
          />

          {/* Sign up Switch */}
          <View className="flex-row justify-center items-center mt-7">
            <Text className="text-text-secondary text-sm">{t('auth.noAccount')} </Text>
            <Pressable onPress={() => navigation.navigate('Signup')} hitSlop={8}>
              <Text className="text-accent-primary font-bold text-sm">
                {t('auth.signup')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
