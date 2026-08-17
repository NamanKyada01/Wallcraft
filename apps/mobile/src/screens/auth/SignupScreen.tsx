import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
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
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (fullName.trim().length < 2) return t('auth.fullName');
    if (!email.includes('@')) return t('auth.email');
    if (password.length < 6) return t('auth.password');
    if (password !== confirmPassword) return t('auth.password');
    return null;
  };

  const handleSignup = async () => {
    const validationError = validate();
    if (validationError) {
      Alert.alert(t('common.warning'), validationError);
      return;
    }

    try {
      setLoading(true);
      await authService.signUp(email.trim(), password, fullName.trim());
      Alert.alert(t('auth.signupSuccess'), t('auth.login'), [
        { text: 'OK', onPress: () => navigation.replace('Login') },
      ]);
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.message ?? t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <Pressable
            className="w-10 h-10 rounded-full bg-bg-card items-center justify-center mt-2 mb-4"
            onPress={() => navigation.goBack()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </Pressable>

          <Text className="text-2xl font-bold text-text-primary mb-6 mt-4">
            {t('auth.signup')}
          </Text>

          <TextInput
            label={t('auth.fullName')}
            value={fullName}
            onChangeText={setFullName}
            placeholder="John Doe"
            leftIcon={<Ionicons name="person-outline" size={20} color={colors.text.tertiary} />}
          />

          <TextInput
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            placeholder="john@example.com"
            keyboardType="email-address"
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.text.tertiary} />}
          />

          <TextInput
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.text.tertiary} />}
          />

          <TextInput
            label={t('auth.password')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSignup}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.text.tertiary} />}
          />

          <Button
            title={t('auth.signup')}
            onPress={handleSignup}
            loading={loading}
            size="lg"
            fullWidth
          />

          {/* Login link */}
          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-text-secondary">{t('auth.hasAccount')} </Text>
            <Pressable onPress={() => navigation.replace('Login')}>
              <Text className="text-accent-primary font-semibold">
                {t('auth.login')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
