import React, { useState } from 'react';
import { View, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { ticketService } from '../../services/ticket.service';
import { useAuth } from '../../hooks/useAuth';
import colors from '../../theme/colors';
import type { TicketCategory, TicketPriority } from '../../types';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'CreateTicket'>;

const CATEGORIES: { key: TicketCategory; labelKey: string }[] = [
  { key: 'bug', labelKey: 'ticket.bug' },
  { key: 'feature', labelKey: 'ticket.feature' },
  { key: 'billing', labelKey: 'ticket.billing' },
  { key: 'other', labelKey: 'ticket.other' },
];

const PRIORITIES: { key: TicketPriority; labelKey: string; color: string }[] = [
  { key: 'low', labelKey: 'ticket.low', color: '#22C55E' },
  { key: 'medium', labelKey: 'ticket.medium', color: '#F59E0B' },
  { key: 'high', labelKey: 'ticket.high', color: '#EF4444' },
];

export function CreateTicketScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('other');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert(t('common.warning'), t('help.subject'));
      return;
    }
    if (!description.trim()) {
      Alert.alert(t('common.warning'), t('help.description'));
      return;
    }
    if (!user) return;

    try {
      setLoading(true);
      await ticketService.create(user.id, subject.trim(), category, priority);
      Alert.alert(t('common.success'), t('help.ticketCreated'), [
        { text: 'OK', onPress: () => navigation.replace('TicketList') },
      ]);
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.message ?? t('common.error'));
    } finally {
      setLoading(false);
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
        <Text className="text-xl font-bold text-text-primary">
          {t('help.createTicket')}
        </Text>
      </View>

      <ScrollView contentContainerClassName="px-4 pb-8" keyboardShouldPersistTaps="handled">
        <TextInput
          label={t('help.subject')}
          value={subject}
          onChangeText={setSubject}
          placeholder="Brief summary of your issue"
        />

        {/* Category picker */}
        <Text className="text-text-secondary text-sm font-medium mb-2">
          {t('help.category')}
        </Text>
        <View className="flex-row flex-wrap mb-4">
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              className={`flex-row items-center rounded-full px-3.5 py-2 mr-2 mb-2 border ${
                category === cat.key
                  ? 'border-accent-primary bg-accent-primary/20'
                  : 'border-border-light bg-bg-card'
              }`}
              onPress={() => setCategory(cat.key)}
            >
              <Text
                className={`text-sm ${
                  category === cat.key ? 'text-accent-primary font-semibold' : 'text-text-primary'
                }`}
              >
                {t(cat.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Priority picker */}
        <Text className="text-text-secondary text-sm font-medium mb-2">
          {t('help.priority')}
        </Text>
        <View className="flex-row gap-3 mb-4">
          {PRIORITIES.map((p) => (
            <Pressable
              key={p.key}
              className={`flex-1 items-center rounded-2xl py-3 border ${
                priority === p.key
                  ? 'border-transparent'
                  : 'border-border-light bg-bg-card'
              }`}
              style={
                priority === p.key ? { backgroundColor: `${p.color}22`, borderWidth: 1, borderColor: p.color } : undefined
              }
              onPress={() => setPriority(p.key)}
            >
              <View className="w-2.5 h-2.5 rounded-full mb-1" style={{ backgroundColor: p.color }} />
              <Text
                className={`text-xs font-medium ${
                  priority === p.key ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                {t(p.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          label={t('help.description')}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your issue in detail..."
          multiline
          numberOfLines={6}
        />

        <Button
          title={t('help.submit')}
          onPress={handleSubmit}
          loading={loading}
          size="lg"
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}
