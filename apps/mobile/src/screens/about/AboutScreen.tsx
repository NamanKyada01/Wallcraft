import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import colors from '../../theme/colors';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'About'>;

export function AboutScreen({ navigation }: Props) {
  const { t } = useTranslation();

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const links = [
    { icon: 'shield-checkmark-outline', label: t('about.privacy'), url: '#' },
    { icon: 'document-text-outline', label: t('about.terms'), url: '#' },
    { icon: 'mail-outline', label: t('about.contact'), url: '#' },
    { icon: 'star-outline', label: t('about.rateApp'), url: '#' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <View className="flex-row items-center px-4 py-3">
        <Pressable
          className="w-10 h-10 rounded-full bg-bg-card items-center justify-center mr-3"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </Pressable>
        <Text className="text-xl font-bold text-text-primary">{t('about.title')}</Text>
      </View>

      <View className="px-6 pb-8">
        {/* App identity */}
        <View className="items-center mt-8 mb-8">
          <View className="w-20 h-20 rounded-3xl bg-accent-primary items-center justify-center mb-4">
            <Ionicons name="images" size={36} color="white" />
          </View>
          <Text className="text-2xl font-bold text-text-primary">
            {t('about.appName')}
          </Text>
          <Text className="text-text-secondary text-sm mt-1">
            {t('about.tagline')}
          </Text>
          <Text className="text-text-tertiary text-xs mt-3">
            {t('settings.version', { version: appVersion })}
          </Text>
        </View>

        <Text className="text-text-secondary text-center leading-6 mb-8">
          {t('about.description')}
        </Text>

        {/* Links */}
        <View className="rounded-3xl bg-bg-card border border-border-light overflow-hidden">
          {links.map((link, index) => (
            <Pressable
              key={index}
              className={`flex-row items-center px-5 py-4 ${
                index < links.length - 1 ? 'border-b border-border-light' : ''
              }`}
              onPress={() => link.url !== '#' && Linking.openURL(link.url)}
            >
              <Ionicons name={link.icon as any} size={22} color={colors.accent.primary} />
              <Text className="text-text-primary text-base ml-3 flex-1">{link.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
            </Pressable>
          ))}
        </View>

        <Text className="text-text-tertiary text-xs text-center mt-8">
          {t('about.developedBy')}
        </Text>
      </View>
    </SafeAreaView>
  );
}
