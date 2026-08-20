import React, { useState, useMemo } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { authService } from '../../services/auth.service';
import colors from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Inline Validation States
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  // Live Password Strength Calculations
  const passwordCriteria = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialOrUpper = /[A-Z!@#$%^&*(),.?":{}|<>]/.test(password);
    const score = [hasMinLength, hasNumber, hasSpecialOrUpper].filter(Boolean).length;

    let strengthLabel = 'Too Weak';
    let strengthColor: string = colors.status.error;
    if (score === 2) {
      strengthLabel = 'Medium';
      strengthColor = colors.status.warning;
    } else if (score === 3) {
      strengthLabel = 'Strong';
      strengthColor = colors.status.success;
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

  const validate = (): boolean => {
    let isValid = true;
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);
    setServerError(null);

    if (fullName.trim().length < 2) {
      setNameError('Full name must be at least 2 characters');
      isValid = false;
    }

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
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else if (!passwordCriteria.hasNumber) {
      setPasswordError('Password must contain at least 1 number');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleSignup = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      setLoading(true);
      setServerError(null);
      await authService.signUp(email.trim(), password, fullName.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setServerSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigation.replace('Login');
      }, 1200);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setServerError(e?.message || 'Failed to create account. Please check details.');
    } finally {
      setLoading(false);
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
          {/* Back button */}
          <Pressable
            className="w-10 h-10 rounded-full bg-bg-card border border-white/10 items-center justify-center mt-2 mb-4"
            onPress={() => navigation.goBack()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
          </Pressable>

          {/* Title Header */}
          <View className="mb-6">
            <Text
              className="text-3xl font-extrabold text-text-primary tracking-wide"
              style={{ fontFamily: 'DMSerifDisplay_400Regular' }}
            >
              Create Account
            </Text>
            <Text className="text-text-secondary text-xs mt-1 font-medium">
              Join Wallcraft to collect and personalize wallpapers
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

          {/* Full Name */}
          <TextInput
            label={t('auth.fullName')}
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (nameError) setNameError(null);
            }}
            placeholder="John Doe"
            autoCapitalize="words"
            error={nameError}
            leftIcon={
              <Ionicons
                name="person-outline"
                size={19}
                color={nameError ? colors.status.error : colors.text.tertiary}
              />
            }
          />

          {/* Email */}
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

          {/* Password */}
          <TextInput
            label={t('auth.password')}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            placeholder="Min 8 chars, 1 number"
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

          {/* Real-time Password Strength Meter */}
          {password.length > 0 && (
            <View className="mb-4 bg-bg-card p-3 rounded-2xl border border-white/10">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[11px] text-text-secondary font-medium">
                  Password Strength:
                </Text>
                <Text
                  className="text-[11px] font-bold"
                  style={{ color: passwordCriteria.strengthColor }}
                >
                  {passwordCriteria.strengthLabel}
                </Text>
              </View>

              {/* Strength Bars */}
              <View className="flex-row gap-1.5 mb-2.5">
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

              {/* Requirement Badges */}
              <View className="flex-row flex-wrap gap-2">
                <RequirementBadge
                  met={passwordCriteria.hasMinLength}
                  label="8+ characters"
                />
                <RequirementBadge
                  met={passwordCriteria.hasNumber}
                  label="1+ number"
                />
                <RequirementBadge
                  met={passwordCriteria.hasSpecialOrUpper}
                  label="Upper / Symbol"
                />
              </View>
            </View>
          )}

          {/* Confirm Password */}
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (confirmError) setConfirmError(null);
            }}
            placeholder="Re-type password"
            secureTextEntry={!showConfirmPassword}
            error={confirmError}
            leftIcon={
              <Ionicons
                name="shield-checkmark-outline"
                size={19}
                color={confirmError ? colors.status.error : colors.text.tertiary}
              />
            }
            rightIcon={
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.text.tertiary}
              />
            }
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          {/* Submit Button */}
          <View className="mt-2">
            <Button
              title={t('auth.signup')}
              onPress={handleSignup}
              loading={loading}
              size="lg"
              fullWidth
            />
          </View>

          {/* Switch to Login */}
          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-text-secondary text-sm">{t('auth.hasAccount')} </Text>
            <Pressable onPress={() => navigation.replace('Login')} hitSlop={8}>
              <Text className="text-accent-primary font-bold text-sm">
                {t('auth.login')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RequirementBadge({ met, label }: { met: boolean; label: string }) {
  return (
    <View
      className={`flex-row items-center px-2 py-0.5 rounded-full ${
        met ? 'bg-status-success/15' : 'bg-white/5'
      }`}
    >
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={11}
        color={met ? colors.status.success : '#6B6B80'}
      />
      <Text
        className={`text-[10px] ml-1 font-medium ${
          met ? 'text-status-success' : 'text-text-tertiary'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}
