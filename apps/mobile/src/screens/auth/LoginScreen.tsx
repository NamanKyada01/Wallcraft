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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!email.includes('@')) {
      setError(t('auth.email'));
      return false;
    }
    if (password.length < 6) {
      setError(t('auth.password'));
      return false;
    }
    setError(null);
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await authService.signIn(email.trim(), password);
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.message ?? t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.includes('@')) {
      Alert.alert(t('common.warning'), t('auth.email'));
      return;
    }
    try {
      await authService.resetPassword(email.trim());
      Alert.alert(t('auth.resetPassword'), t('auth.resetSent'));
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.message ?? t('common.error'));
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
          {/* Header */}
          <View className="items-center mt-12 mb-10">
            <View className="w-20 h-20 rounded-3xl bg-accent-primary items-center justify-center mb-4">
              <Ionicons name="images" size={36} color="white" />
            </View>
            <Text className="text-3xl font-bold text-text-primary">
              {t('about.appName')}
            </Text>
            <Text className="text-text-secondary text-sm mt-1">
              {t('about.tagline')}
            </Text>
          </View>

          <Text className="text-2xl font-bold text-text-primary mb-6">
            {t('auth.login')}
          </Text>

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

          <Pressable className="self-end mb-6" onPress={handleForgotPassword} hitSlop={8}>
            <Text className="text-accent-primary text-sm font-medium">
              {t('auth.forgotPassword')}
            </Text>
          </Pressable>

          <Button
            title={t('auth.login')}
            onPress={handleLogin}
            loading={loading}
            size="lg"
            fullWidth
          />

          {/* Sign up link */}
          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-text-secondary">{t('auth.noAccount')} </Text>
            <Pressable onPress={() => navigation.navigate('Signup')}>
              <Text className="text-accent-primary font-semibold">
                {t('auth.signup')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
