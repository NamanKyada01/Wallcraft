import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  color?: string;
  textClassName?: string;
  className?: string;
}

export function Badge({ label, color, textClassName = '', className = '' }: BadgeProps) {
  return (
    <View
      className={`self-start flex-row items-center rounded-full px-2.5 py-1 ${className}`}
      style={color ? { backgroundColor: `${color}22` } : undefined}
    >
      <View
        className="w-1.5 h-1.5 rounded-full mr-1.5"
        style={{ backgroundColor: color ?? '#7C6EF6' }}
      />
      <Text
        className={`text-xs font-semibold ${textClassName}`}
        style={color ? { color } : undefined}
      >
        {label}
      </Text>
    </View>
  );
}
