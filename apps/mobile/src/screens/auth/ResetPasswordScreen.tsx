import React, { useState, useMemo } from 'react';
import { View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { AuthHeroLayout } from '../../components/auth/AuthHeroLayout';
import { AuthTextInput } from '../../components/auth/AuthTextInput';
import { AuthGradientButton } from '../../components/auth/AuthGradientButton';
import { authService } from '../../services/auth.service';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ route, navigation }: Props) {
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordCriteria = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialOrUpper = /[A-Z!@#$%^&*(),.?":{}|<>]/.test(password);
    const score = [hasMinLength, hasNumber, hasSpecialOrUpper].filter(Boolean).length;

    let strengthLabel = 'Too Weak';
    let strengthColor: string = '#EF4444';
    if (score === 2) {
      strengthLabel = 'Medium';
      strengthColor = '#F59E0B';
    } else if (score === 3) {
      strengthLabel = 'Strong';
      strengthColor = '#22C55E';
    }

    return {
      hasMinLength,
      hasNumber,
      hasSpecialOrUpper,
      score,
      strengthLabel,
      strengthColor,
    };
  }, [password]);

  const handleReset = async () => {
    setPasswordError(null);
    setConfirmError(null);
    setServerError(null);

    let valid = true;
    if (!password || password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      valid = false;
    } else if (!passwordCriteria.hasNumber) {
      setPasswordError('Password must contain at least 1 number');
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your new password');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      valid = false;
    }

    if (!valid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      setLoading(true);
      await authService.updatePassword(password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess('Password updated! Redirecting to login...');
      setTimeout(() => {
        navigation.replace('Login');
      }, 1000);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setServerError(err?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthHeroLayout
      tag="Security"
      cardTitle="Set New Password"
      cardSubtitle={`Create a strong password for ${email}`}
      showBackButton
      onBackPress={() => navigation.navigate('Login')}
    >
      {/* Error / Success Message */}
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

      {success && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="mb-4 flex-row items-center bg-status-success/15 border border-status-success/40 px-4 py-3 rounded-2xl"
        >
          <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
          <Text className="text-status-success text-xs font-semibold ml-2.5 flex-1">
            {success}
          </Text>
        </Animated.View>
      )}

      {/* New Password */}
      <AuthTextInput
        placeholder="New password (Min 8 chars, 1 number)"
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

      {/* Strength Bar */}
      {password.length > 0 && (
        <View className="mb-4 bg-[#1A1B29] p-3 rounded-2xl border border-white/10">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[11px] text-white/50 font-medium">
              Strength:
            </Text>
            <Text
              className="text-[11px] font-bold"
              style={{ color: passwordCriteria.strengthColor }}
            >
              {passwordCriteria.strengthLabel}
            </Text>
          </View>

          <View className="flex-row gap-1.5">
            {[1, 2, 3].map((step) => (
              <View
                key={step}
                className="flex-1 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    passwordCriteria.score >= step
                      ? passwordCriteria.strengthColor
                      : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </View>
        </View>
      )}

      {/* Confirm Password */}
      <AuthTextInput
        placeholder="Confirm new password"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (confirmError) setConfirmError(null);
        }}
        secureTextEntry={!showConfirmPassword}
        leftIconName="shield-checkmark-outline"
        rightIconName={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
        onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
        error={confirmError}
      />

      {/* Update Action */}
      <AuthGradientButton
        title="Update Password"
        onPress={handleReset}
        loading={loading}
      />
    </AuthHeroLayout>
  );
}
