import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { supabase } from '../../services/supabase';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import { useFavorites } from '../../hooks/useFavorites';
import { formatDate } from '../../utils/helpers';
import colors from '../../theme/colors';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import type { User } from '../../types';

export function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { user } = useAuth();
  const { favorites } = useFavorites(user?.id);
  const [profile, setProfile] = useState<User | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    authService.getProfile(user.id).then(setProfile).catch(console.error);

    supabase
      .from('downloads')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setDownloadCount(count ?? 0))
      .catch(console.error);
  }, [user?.id]);

  const menuItems = [
    { icon: 'settings-outline', label: t('settings.title'), screen: 'Settings' },
    { icon: 'help-circle-outline', label: t('help.title'), screen: 'Help' },
    { icon: 'mail-outline', label: t('contact.title'), screen: 'Contact' },
    { icon: 'information-circle-outline', label: t('about.title'), screen: 'About' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ScrollView contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 mb-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-text-primary">
            {t('tabs.profile')}
          </Text>
          <Pressable
            className="w-10 h-10 rounded-full bg-bg-card items-center justify-center"
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={20} color={colors.text.primary} />
          </Pressable>
        </View>

        {/* User card */}
        <View className="mx-4 p-5 rounded-3xl bg-bg-card border border-border-light mb-6">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-accent-primary items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
              ) : (
                <Text className="text-white text-2xl font-bold">
                  {(profile?.full_name?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()}
                </Text>
              )}
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-text-primary">
                {profile?.full_name ?? user?.user_metadata?.full_name ?? 'User'}
              </Text>
              <Text className="text-text-secondary text-sm" numberOfLines={1}>
                {user?.email}
              </Text>
              {profile?.created_at && (
                <Text className="text-text-tertiary text-xs mt-0.5">
                  {t('profile.memberSince', {
                    date: formatDate(profile.created_at),
                  })}
                </Text>
              )}
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row mt-5 pt-5 border-t border-border-light">
            <StatBlock
              value={String(downloadCount)}
              label={t('profile.downloads')}
            />
            <View className="w-px bg-border-light" />
            <StatBlock
              value={String(favorites.length)}
              label={t('profile.favorites')}
            />
          </View>
        </View>

        {/* Menu */}
        <View className="mx-4 rounded-3xl bg-bg-card border border-border-light overflow-hidden">
          {menuItems.map((item, index) => (
            <Pressable
              key={item.screen}
              className={`flex-row items-center px-5 py-4 ${
                index < menuItems.length - 1 ? 'border-b border-border-light' : ''
              }`}
              onPress={() => navigation.navigate(item.screen as any)}
            >
              <Ionicons name={item.icon as any} size={22} color={colors.accent.primary} />
              <Text className="text-text-primary text-base ml-3 flex-1">
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-2xl font-bold text-text-primary">{value}</Text>
      <Text className="text-text-tertiary text-xs mt-0.5">{label}</Text>
    </View>
  );
}
