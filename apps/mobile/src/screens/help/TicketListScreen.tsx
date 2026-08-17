import React from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { Layout } from 'react-native-reanimated';

import { TicketStatusBadge } from '../../components/TicketStatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useTickets } from '../../hooks/useTickets';
import { useAuth } from '../../hooks/useAuth';
import { timeAgo } from '../../utils/helpers';
import colors from '../../theme/colors';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import type { Ticket } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'TicketList'>;

export function TicketListScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { tickets, loading } = useTickets(user?.id);

  const openTicket = (ticket: Ticket) => {
    navigation.navigate('TicketDetail', { ticketId: ticket.id });
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <Pressable
            className="w-10 h-10 rounded-full bg-bg-card items-center justify-center mr-3"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </Pressable>
          <Text className="text-xl font-bold text-text-primary">
            {t('help.myTickets')}
          </Text>
        </View>
        <Pressable
          className="w-10 h-10 rounded-full bg-accent-primary items-center justify-center"
          onPress={() => navigation.navigate('CreateTicket')}
        >
          <Ionicons name="add" size={22} color="white" />
        </Pressable>
      </View>

      {tickets.length === 0 ? (
        <EmptyState
          title={t('ticket.noTickets')}
          description={t('ticket.noTicketsDesc')}
          actionLabel={t('help.createTicket')}
          onAction={() => navigation.navigate('CreateTicket')}
        />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName="px-4 pb-8 pt-2"
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => <TicketRow ticket={item} onPress={openTicket} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function TicketRow({ ticket, onPress }: { ticket: Ticket; onPress: (t: Ticket) => void }) {
  return (
    <Animated.View layout={Layout.springAnim()}>
      <Pressable
        className="bg-bg-card border border-border-light rounded-2xl px-4 py-4"
        onPress={() => onPress(ticket)}
      >
        <View className="flex-row items-start justify-between mb-2">
          <Text className="text-text-primary font-semibold flex-1 mr-3" numberOfLines={1}>
            {ticket.subject}
          </Text>
          <TicketStatusBadge status={ticket.status} />
        </View>

        <View className="flex-row items-center">
          <Ionicons name="pricetag-outline" size={14} color={colors.text.tertiary} />
          <Text className="text-text-tertiary text-xs ml-1 mr-4 capitalize">
            {ticket.category}
          </Text>
          <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
          <Text className="text-text-tertiary text-xs ml-1">
            {timeAgo(ticket.updated_at)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
