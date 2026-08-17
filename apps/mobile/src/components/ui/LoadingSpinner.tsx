import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  label?: string;
}

export function LoadingSpinner({ fullScreen = false, label }: LoadingSpinnerProps) {
  const { t } = useTranslation();

  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-primary">
        <ActivityIndicator size="large" color="#7C6EF6" />
        {label && <Text className="text-text-secondary mt-3">{label}</Text>}
      </View>
    );
  }

  return (
    <View className="py-8 items-center justify-center">
      <ActivityIndicator size="small" color="#7C6EF6" />
      {label && <Text className="text-text-secondary text-sm mt-2">{label}</Text>}
    </View>
  );
}
