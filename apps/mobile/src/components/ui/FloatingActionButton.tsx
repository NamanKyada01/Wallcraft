import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '../../theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ActionItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color?: string;
  onPress: () => void;
}

interface FloatingActionButtonProps {
  actions: ActionItem[];
  bottomOffset?: number;
  rightOffset?: number;
}

export function FloatingActionButton({
  actions,
  bottomOffset = 96,
  rightOffset = 20,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const toggleMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const nextState = !isOpen;
    setIsOpen(nextState);
    rotation.value = withSpring(nextState ? 45 : 0, { damping: 12, stiffness: 200 });
  };

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  return (
    <>
      {/* Dimmed backdrop when menu is open */}
      {isOpen && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={toggleMenu}
          className="bg-black/50 z-40"
        />
      )}

      {/* Floating Speed Dial Container */}
      <View
        className="absolute z-50 items-end"
        style={{ bottom: bottomOffset, right: rightOffset }}
        pointerEvents="box-none"
      >
        {/* Expanded Satellite Action Buttons */}
        {isOpen && (
          <View className="items-end mb-3 space-y-2.5">
            {actions.map((action, index) => (
              <SpeedDialItem
                key={action.id}
                action={action}
                index={actions.length - 1 - index}
                onSelect={() => {
                  toggleMenu();
                  action.onPress();
                }}
              />
            ))}
          </View>
        )}

        {/* Main Floating Button */}
        <AnimatedPressable
          style={[
            styles.fabShadow,
            fabAnimatedStyle,
            {
              backgroundColor: isOpen ? '#EF4444' : colors.accent.primary,
            },
          ]}
          className="w-14 h-14 rounded-full items-center justify-center border border-white/20"
          onPress={toggleMenu}
          onPressIn={() => {
            scale.value = withSpring(0.92, { damping: 15 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 15 });
          }}
        >
          <Ionicons name="add" size={28} color="white" />
        </AnimatedPressable>
      </View>
    </>
  );
}

function SpeedDialItem({
  action,
  index,
  onSelect,
}: {
  action: ActionItem;
  index: number;
  onSelect: () => void;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    opacity.value = withDelay(index * 40, withTiming(1, { duration: 180 }));
    translateY.value = withDelay(
      index * 40,
      withSpring(0, { damping: 14, stiffness: 220 })
    );
    scale.value = withDelay(
      index * 40,
      withSpring(1, { damping: 14, stiffness: 220 })
    );
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  return (
    <Animated.View style={animatedStyle} className="flex-row items-center mb-2.5">
      {/* Action Label Pill */}
      <View className="bg-bg-secondary/95 border border-white/10 px-3 py-1.5 rounded-full mr-2.5 shadow-lg">
        <Text className="text-white text-xs font-semibold">{action.label}</Text>
      </View>

      {/* Action Circular Button */}
      <Pressable
        onPress={handlePress}
        style={[
          styles.itemShadow,
          { backgroundColor: action.color || colors.bg.elevated },
        ]}
        className="w-11 h-11 rounded-full items-center justify-center border border-white/15"
      >
        <Ionicons name={action.icon} size={20} color="white" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabShadow: {
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  itemShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
