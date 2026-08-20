import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { AuthHeroLayout } from '../../components/auth/AuthHeroLayout';
import { AuthGradientButton } from '../../components/auth/AuthGradientButton';
import { authService } from '../../services/auth.service';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerification'>;

export function OTPVerificationScreen({ route, navigation }: Props) {
  const { email, type = 'login', pendingPassword } = route.params;

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    setError(null);
    const cleaned = text.replace(/[^0-9]/g, '');

    if (cleaned.length >= 6) {
      const newOtp = cleaned.slice(0, 6).split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleaned.slice(-1);
    setOtp(newOtp);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit code');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authService.verifyOtp(email, fullOtp, type === 'forgot_password' ? 'recovery' : type);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (type === 'forgot_password') {
        navigation.replace('ResetPassword', { email });
      } else if (type === 'signup') {
        navigation.replace('Login');
      } else {
        if (pendingPassword) {
          await authService.signIn(email, pendingPassword);
        }
      }
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      setError(null);
      await authService.sendOtp(email, type === 'forgot_password' ? 'recovery' : type);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess('A new verification code was sent!');
      setTimer(45);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code.');
    }
  };

  return (
    <AuthHeroLayout
      tag="Security Check"
      cardTitle="Enter 6-Digit Code"
      cardSubtitle={`We sent a verification code to ${email}`}
      showBackButton
      onBackPress={() => navigation.goBack()}
    >
      {/* Error / Success Feedback */}
      {error && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="mb-4 flex-row items-center bg-status-error/15 border border-status-error/40 px-4 py-3 rounded-2xl"
        >
          <Ionicons name="alert-circle" size={18} color="#EF4444" />
          <Text className="text-status-error text-xs font-semibold ml-2.5 flex-1">
            {error}
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

      {/* 6-Digit OTP Box Row */}
      <View className="flex-row justify-between mb-6 px-1">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={6}
            selectTextOnFocus
            className={`w-12 h-14 text-center text-xl font-bold rounded-2xl border bg-[#1A1B29] text-white ${
              error
                ? 'border-status-error'
                : digit
                ? 'border-[#8B5CF6] bg-[#8B5CF6]/15'
                : 'border-white/10'
            }`}
          />
        ))}
      </View>

      {/* Submit Button */}
      <AuthGradientButton
        title="Verify Code"
        onPress={handleVerify}
        loading={loading}
      />

      {/* Resend Action */}
      <View className="flex-row justify-center items-center mt-6">
        {canResend ? (
          <Pressable onPress={handleResendOtp} hitSlop={8}>
            <Text className="text-[#A78BFA] font-bold text-xs">
              Resend Code ↻
            </Text>
          </Pressable>
        ) : (
          <Text className="text-white/40 text-xs">
            Resend code in <Text className="text-[#A78BFA] font-bold">{timer}s</Text>
          </Text>
        )}
      </View>
    </AuthHeroLayout>
  );
}
