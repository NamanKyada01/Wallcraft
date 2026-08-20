import React from 'react';
import { View, Text, TextInput, TextInputProps, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface AuthTextInputProps extends TextInputProps {
  leftIconName?: keyof typeof Ionicons.glyphMap;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  error?: string | null;
}

export function AuthTextInput({
  leftIconName,
  rightIconName,
  onRightIconPress,
  error,
  ...props
}: AuthTextInputProps) {
  return (
    <View className="mb-3.5">
      <View
        style={{
          height: 54,
          borderRadius: 20,
          backgroundColor: '#181926',
          borderWidth: 1,
          borderColor: error ? '#EF4444' : 'rgba(255,255,255,0.08)',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}
      >
        {leftIconName && (
          <Ionicons
            name={leftIconName}
            size={20}
            color={error ? '#EF4444' : '#A78BFA'}
            style={{ marginRight: 12 }}
          />
        )}

        <TextInput
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={{
            flex: 1,
            color: '#FFFFFF',
            fontSize: 14.5,
            fontWeight: '500',
            padding: 0,
          }}
          {...props}
        />

        {rightIconName && (
          <Pressable onPress={onRightIconPress} hitSlop={10}>
            <Ionicons name={rightIconName} size={20} color="rgba(255,255,255,0.45)" />
          </Pressable>
        )}
      </View>

      {error && (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          className="flex-row items-center mt-1.5 ml-2"
        >
          <Ionicons name="alert-circle" size={13} color="#EF4444" />
          <Text className="text-status-error text-xs font-semibold ml-1.5">
            {error}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
