import React, { useState } from 'react';
import { View, TextInput as RNTextInput, Text, Platform } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCorrect?: boolean;
  returnKeyType?: 'done' | 'next' | 'go' | 'search';
  onSubmitEditing?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: React.ReactNode;
  className?: string;
}

export function TextInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  autoCapitalize = 'none',
  keyboardType = 'default',
  autoCorrect = false,
  returnKeyType = 'done',
  onSubmitEditing,
  multiline = false,
  numberOfLines,
  leftIcon,
  className = '',
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isFocused || value ? 1 : 1, { damping: 15 }) }],
  }));

  return (
    <View className={`mb-4 ${className}`}>
      <Text
        className={`text-sm font-medium mb-1.5 ${
          isFocused ? 'text-accent-primary' : 'text-text-secondary'
        }`}
      >
        {label}
      </Text>

      <View
        className={`flex-row items-center rounded-xl px-4 border bg-bg-input ${
          error ? 'border-status-error' : isFocused ? 'border-accent-primary' : 'border-border-light'
        }`}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <RNTextInput
          className={`flex-1 text-text-primary py-3 text-base ${multiline ? 'pt-2' : ''}`}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6B6B80"
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          autoCorrect={autoCorrect}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </View>

      {error ? (
        <Text className="text-status-error text-xs mt-1">{error}</Text>
      ) : null}
    </View>
  );
}
