import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  showClear?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  autoFocus = false,
  showClear = true,
}: SearchBarProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center bg-bg-input border border-border-light rounded-xl px-3.5 py-2.5">
      <Ionicons name="search" size={20} color="#6B6B80" />

      <TextInput
        className="flex-1 mx-2.5 text-text-primary text-base"
        placeholder={t('search.placeholder')}
        placeholderTextColor="#6B6B80"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        returnKeyType="search"
      />

      {showClear && value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Ionicons name="close-circle" size={20} color="#6B6B80" />
        </Pressable>
      )}
    </View>
  );
}
