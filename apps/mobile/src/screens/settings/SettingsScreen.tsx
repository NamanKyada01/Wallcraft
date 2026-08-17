import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { changeLanguage } from '../../i18n';
import { authService } from '../../services/auth.service';
import colors from '../../theme/colors';
import type { Language } from '../../types';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'Settings'>;

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export function SettingsScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const currentLanguage = i18n.language as Language;

  const handleLanguageSelect = async (code: Language) => {
    await changeLanguage(code);
    setShowLanguagePicker(false);
  };

  const handleLogout = () => {
    Alert.alert(t('drawer.logout'), t('settings.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        style: 'destructive',
        onPress: () => authService.signOut(),
      },
    ]);
  };

  const appVersion =
    Platform.OS === 'ios'
      ? Constants.expoConfig?.ios?.buildNumber ?? '1.0.0'
      : Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      {/* Header */}
      <View style={{ paddingTop: 0 }} className="flex-row items-center px-4 py-3">
        <Pressable
          className="w-10 h-10 rounded-full bg-bg-card items-center justify-center mr-3"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </Pressable>
        <Text className="text-xl font-bold text-text-primary">
          {t('settings.title')}
        </Text>
      </View>

      <ScrollView contentContainerClassName="px-4 pb-8" showsVerticalScrollIndicator={false}>
        {/* Language */}
        <Text className="text-text-tertiary text-xs font-semibold uppercase mb-2 mt-4 tracking-wider">
          {t('settings.language')}
        </Text>
        <View className="rounded-3xl bg-bg-card border border-border-light overflow-hidden mb-6">
          <Pressable
            className="flex-row items-center px-5 py-4 border-b border-border-light"
            onPress={() => setShowLanguagePicker(!showLanguagePicker)}
          >
            <Ionicons name="language-outline" size={22} color={colors.accent.primary} />
            <Text className="text-text-primary text-base ml-3 flex-1">
              {LANGUAGES.find((l) => l.code === currentLanguage)?.label ?? 'English'}
            </Text>
            <Ionicons
              name={showLanguagePicker ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.text.tertiary}
            />
          </Pressable>

          {showLanguagePicker &&
            LANGUAGES.map((lang) => (
              <Pressable
                key={lang.code}
                className="flex-row items-center px-5 py-3.5 border-b border-border-light"
                onPress={() => handleLanguageSelect(lang.code)}
              >
                <Text className="text-lg mr-3">{lang.flag}</Text>
                <Text
                  className={`text-base flex-1 ${
                    currentLanguage === lang.code
                      ? 'text-accent-primary font-semibold'
                      : 'text-text-primary'
                  }`}
                >
                  {lang.label}
                </Text>
                {currentLanguage === lang.code && (
                  <Ionicons name="checkmark" size={20} color={colors.accent.primary} />
                )}
              </Pressable>
            ))}
        </View>

        {/* Notifications */}
        <Text className="text-text-tertiary text-xs font-semibold uppercase mb-2 tracking-wider">
          {t('settings.notifications')}
        </Text>
        <View className="rounded-3xl bg-bg-card border border-border-light mb-6">
          <View className="flex-row items-center px-5 py-4">
            <Ionicons name="notifications-outline" size={22} color={colors.accent.primary} />
            <Text className="text-text-primary text-base ml-3 flex-1">
              {t('settings.pushNotifications')}
            </Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: colors.accent.primary, false: colors.bg.tertiary }}
              thumbColor="white"
            />
          </View>
        </View>

        {/* About section */}
        <Text className="text-text-tertiary text-xs font-semibold uppercase mb-2 tracking-wider">
          {t('settings.about')}
        </Text>
        <View className="rounded-3xl bg-bg-card border border-border-light overflow-hidden mb-6">
          <MenuRow
            icon="information-circle-outline"
            label={t('about.title')}
            onPress={() => navigation.navigate('About')}
          />
          <MenuRow
            icon="mail-outline"
            label={t('contact.title')}
            onPress={() => navigation.navigate('Contact')}
          />
          <MenuRow
            icon="help-circle-outline"
            label={t('help.title')}
            onPress={() => navigation.navigate('Help')}
          />
        </View>

        {/* Logout */}
        <Pressable
          className="flex-row items-center justify-center rounded-3xl bg-bg-card border border-border-light py-4"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.status.error} />
          <Text className="text-status-error text-base font-semibold ml-2">
            {t('settings.logout')}
          </Text>
        </Pressable>

        <Text className="text-center text-text-tertiary text-xs mt-6">
          {t('settings.version', { version: appVersion })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  last = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      className={`flex-row items-center px-5 py-4 ${
        !last ? 'border-b border-border-light' : ''
      }`}
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={22} color={colors.accent.primary} />
      <Text className="text-text-primary text-base ml-3 flex-1">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
    </Pressable>
  );
}
