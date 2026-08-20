import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, KeyboardAvoidingView, Platform, Alert, TextInput as RNTextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../components/ui/Button';
import { TicketStatusBadge } from '../../components/TicketStatusBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ticketService } from '../../services/ticket.service';
import { useAuth } from '../../hooks/useAuth';
import { useTicketMessages } from '../../hooks/useTickets';
import { timeAgo } from '../../utils/helpers';
import colors from '../../theme/colors';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import type { TicketMessage } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'TicketDetail'>;

export function TicketDetailScreen({ route, navigation }: Props) {
  const { ticketId } = route.params;
  const { t } = useTranslation();
  const { user } = useAuth();
  const { messages, loading } = useTicketMessages(ticketId);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  // Find the ticket subject from first user message or use ID
  const ticket = messages.length > 0 ? messages[0] : null;

  const handleSendReply = async () => {
    if (!replyText.trim() || !user) return;
    try {
      setSending(true);
      await ticketService.sendMessage(ticketId, user.id, 'user', replyText.trim());
      setReplyText('');
      // Refresh messages by re-rendering
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.message ?? t('common.error'));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border-light">
        <Pressable
          className="w-10 h-10 rounded-full bg-bg-card items-center justify-center mr-3"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-lg font-bold text-text-primary" numberOfLines={1}>
            Ticket #{ticketId}
          </Text>
          <Text className="text-text-tertiary text-xs">
            {t('ticket.createdAt', { date: '' })}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="px-4 py-4"
        inverted
        renderItem={({ item }) => (
          <MessageBubble message={item} userId={user?.id ?? ''} />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Reply input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="border-t border-border-light px-4 py-3"
      >
        <View className="flex-row items-end gap-3">
          <View className="flex-1 bg-bg-card border border-border-light rounded-2xl px-4 py-2.5">
            <RNTextInput
              value={replyText}
              onChangeText={setReplyText}
              placeholder={t('ticket.replyPlaceholder')}
              placeholderTextColor={colors.text.tertiary}
              multiline
              className="text-text-primary text-sm"
            />
          </View>
          <Pressable
            className="w-11 h-11 rounded-2xl bg-accent-primary items-center justify-center"
            onPress={handleSendReply}
            disabled={sending || !replyText.trim()}
          >
            <Ionicons
              name="send"
              size={18}
              color={replyText.trim() ? 'white' : 'rgba(255,255,255,0.3)'}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MessageBubble({
  message,
  userId,
}: {
  message: TicketMessage;
  userId: string;
}) {
  const isMe = message.sender_type === 'user';
  const { t } = useTranslation();

  return (
    <View
      className={`mb-3 ${isMe ? 'self-end' : 'self-start'}`}
      style={{ maxWidth: '85%' }}
    >
      <View
        className={`rounded-2xl px-4 py-3 ${
          isMe ? 'bg-accent-primary rounded-br-md' : 'bg-bg-card border border-border-light rounded-bl-md'
        }`}
      >
        {!isMe && (
          <Text className="text-accent-secondary text-xs font-semibold mb-1">
            {t('about.appName')} Support
          </Text>
        )}
        <Text
          className={`text-sm leading-5 ${isMe ? 'text-white' : 'text-text-primary'}`}
        >
          {message.message}
        </Text>
      </View>
      <Text
        className={`text-text-tertiary text-xs mt-1 ${isMe ? 'text-right' : 'text-left'}`}
      >
        {timeAgo(message.created_at)}
      </Text>
    </View>
  );
}
