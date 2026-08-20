import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import { Button } from './ui/Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  animationSource?: any;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  animationSource,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      {animationSource && (
        <LottieView
          source={animationSource}
          autoPlay
          loop
          style={{ width: 180, height: 180 }}
        />
      )}

      <Text className="text-xl font-bold text-text-primary text-center mt-4">
        {title}
      </Text>

      {description && (
        <Text className="text-sm text-text-secondary text-center mt-2">
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <View className="mt-6">
          <Button title={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}
