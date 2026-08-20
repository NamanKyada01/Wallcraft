import React, { useState } from 'react';
import { View, TextInput as RNTextInput, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import colors from '../../theme/colors';

interface TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string | null;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCorrect?: boolean;
  returnKeyType?: 'done' | 'next' | 'go' | 'search';
  onSubmitEditing?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
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
  rightIcon,
  onRightIconPress,
  className = '',
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-4 ${className}`}>
      <Text
        className={`text-xs font-bold mb-1.5 uppercase tracking-wider ${
          error
            ? 'text-status-error'
            : isFocused
            ? 'text-accent-primary'
            : 'text-text-secondary'
        }`}
      >
        {label}
      </Text>

      <View
        className={`flex-row items-center rounded-2xl px-4 border bg-bg-card transition ${
          error
            ? 'border-status-error/80 bg-status-error/5'
            : isFocused
            ? 'border-accent-primary bg-accent-primary/5 shadow-md'
            : 'border-white/10'
        }`}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <RNTextInput
          className={`flex-1 text-text-primary py-3.5 text-sm font-medium ${
            multiline ? 'pt-3' : ''
          }`}
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

        {rightIcon && (
          <Pressable onPress={onRightIconPress} hitSlop={8} className="ml-2">
            {rightIcon}
          </Pressable>
        )}
      </View>

      {error ? (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          className="flex-row items-center mt-1.5 px-1"
        >
          <Ionicons name="alert-circle" size={13} color={colors.status.error} />
          <Text className="text-status-error text-xs font-semibold ml-1.5">
            {error}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}
