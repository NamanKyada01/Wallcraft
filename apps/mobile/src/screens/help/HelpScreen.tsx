import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Button } from '../../components/ui/Button';
import colors from '../../theme/colors';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'Help'>;

export function HelpScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <View className="flex-row items-center px-4 py-3">
        <Pressable
          className="w-10 h-10 rounded-full bg-bg-card items-center justify-center mr-3"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </Pressable>
        <Text className="text-xl font-bold text-text-primary">{t('help.title')}</Text>
      </View>

      <ScrollView contentContainerClassName="px-4 pb-8" showsVerticalScrollIndicator={false}>
        {/* Quick actions */}
        <View className="flex-row gap-3 mb-6 mt-4">
          <Pressable
            className="flex-1 rounded-2xl bg-accent-primary py-4 items-center"
            onPress={() => navigation.navigate('CreateTicket')}
          >
            <Ionicons name="add-circle-outline" size={24} color="white" />
            <Text className="text-white text-sm font-semibold mt-1">
              {t('help.createTicket')}
            </Text>
          </Pressable>
          <Pressable
            className="flex-1 rounded-2xl bg-bg-card border border-border-light py-4 items-center"
            onPress={() => navigation.navigate('TicketList')}
          >
            <Ionicons name="list-outline" size={24} color={colors.accent.primary} />
            <Text className="text-text-primary text-sm font-semibold mt-1">
              {t('help.myTickets')}
            </Text>
          </Pressable>
        </View>

        {/* FAQ */}
        <Text className="text-text-tertiary text-xs font-semibold uppercase mb-3 tracking-wider">
          {t('help.faq')}
        </Text>

        <FAQItem questionKey="faq1_q" answerKey="faq1_a" />
        <FAQItem questionKey="faq2_q" answerKey="faq2_a" />
        <FAQItem questionKey="faq3_q" answerKey="faq3_a" />
        <FAQItem questionKey="faq4_q" answerKey="faq4_a" />
        <FAQItem questionKey="faq5_q" answerKey="faq5_a" />
      </ScrollView>
    </SafeAreaView>
  );
}

function FAQItem({ questionKey, answerKey }: { questionKey: string; answerKey: string }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const rotate = useSharedValue(0);
  const height = useSharedValue(0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    height: height.value,
    overflow: 'hidden',
  }));

  const toggle = () => {
    setExpanded(!expanded);
    rotate.value = withTiming(expanded ? 0 : 180, { duration: 200 });
    height.value = withTiming(expanded ? 0 : 80, { duration: 200 });
  };

  return (
    <View className="bg-bg-card border border-border-light rounded-2xl mb-3 overflow-hidden">
      <Pressable className="flex-row items-center px-4 py-4" onPress={toggle}>
        <Text className="text-text-primary text-sm font-semibold flex-1 mr-2">
          {t(`help.${questionKey}`)}
        </Text>
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-down" size={18} color={colors.text.tertiary} />
        </Animated.View>
      </Pressable>
      <Animated.View style={contentStyle}>
        <View className="px-4 pb-4">
          <Text className="text-text-secondary text-sm leading-5">
            {t(`help.${answerKey}`)}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
