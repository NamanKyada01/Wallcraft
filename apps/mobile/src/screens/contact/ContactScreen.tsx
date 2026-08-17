import React, { useState } from 'react';
import { View, Text, Pressable, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import colors from '../../theme/colors';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'Contact'>;

export function ContactScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const socialLinks = [
    { icon: 'logo-twitter', label: 'Twitter', url: 'https://twitter.com/wallcraft' },
    { icon: 'logo-instagram', label: 'Instagram', url: 'https://instagram.com/wallcraft' },
    { icon: 'globe-outline', label: 'Website', url: 'https://wallcraft.app' },
  ];

  const handleSend = async () => {
    if (!name.trim() || !email.includes('@') || !message.trim()) {
      Alert.alert(t('common.warning'), 'Please fill all fields');
      return;
    }
    try {
      setSending(true);
      // In production, integrate with Supabase edge function or email API
      await new Promise((r) => setTimeout(r, 1000));
      Alert.alert(t('common.success'), t('contact.sent'));
      navigation.goBack();
    } catch {
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <View className="flex-row items-center px-4 py-3">
        <Pressable
          className="w-10 h-10 rounded-full bg-bg-card items-center justify-center mr-3"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </Pressable>
        <Text className="text-xl font-bold text-text-primary">{t('contact.title')}</Text>
      </View>

      <View className="flex-1 px-6 pb-8">
        {/* Social links */}
        <Text className="text-text-tertiary text-xs font-semibold uppercase mb-2 mt-4 tracking-wider">
          {t('contact.followUs')}
        </Text>
        <View className="flex-row flex-wrap mb-8">
          {socialLinks.map((link) => (
            <Pressable
              key={link.label}
              className="flex-row items-center bg-bg-card border border-border-light rounded-2xl px-4 py-3 mr-3 mb-2"
              onPress={() => Linking.openURL(link.url)}
            >
              <Ionicons name={link.icon as any} size={20} color={colors.accent.primary} />
              <Text className="text-text-primary text-sm ml-2">{link.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Contact form */}
        <Text className="text-text-tertiary text-xs font-semibold uppercase mb-2 tracking-wider">
          {t('contact.emailUs')}
        </Text>
        <Pressable
          className="flex-row items-center bg-bg-card border border-border-light rounded-2xl px-4 py-3.5 mb-6"
          onPress={() => Linking.openURL('mailto:support@wallcraft.app')}
        >
          <Ionicons name="mail-outline" size={22} color={colors.accent.primary} />
          <Text className="text-accent-primary text-sm ml-3">
            support@wallcraft.app
          </Text>
        </Pressable>

        <TextInput
          label={t('auth.fullName')}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
        />
        <TextInput
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
        />
        <TextInput
          label={t('contact.message')}
          value={message}
          onChangeText={setMessage}
          placeholder={t('contact.message')}
          multiline
          numberOfLines={5}
        />

        <Button
          title={t('contact.send')}
          onPress={handleSend}
          loading={sending}
          size="lg"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
