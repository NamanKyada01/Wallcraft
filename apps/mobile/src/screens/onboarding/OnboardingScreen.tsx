import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Button } from '../../components/ui/Button';
import colors from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const ONBOARDING_KEY = 'has_completed_onboarding';

export function OnboardingScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const pages = [
    {
      title: t('onboarding.discover_title'),
      description: t('onboarding.discover_desc'),
      emoji: '🌌',
      color1: '#7C6EF6',
      color2: '#EC4899',
      icon: 'sparkles',
    },
    {
      title: t('onboarding.personalize_title'),
      description: t('onboarding.personalize_desc'),
      emoji: '📱',
      color1: '#06B6D4',
      color2: '#7C6EF6',
      icon: 'color-palette',
    },
    {
      title: t('onboarding.collections_title'),
      description: t('onboarding.collections_desc'),
      emoji: '❤️',
      color1: '#F97316',
      color2: '#EC4899',
      icon: 'heart',
    },
  ];

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    navigation.replace('Login');
  };

  const goToNext = () => {
    if (activeIndex < pages.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top', 'bottom']}>
      {/* Skip button */}
      <View style={{ paddingTop: insets.top }}>
        {activeIndex < pages.length - 1 && (
          <Pressable
            className="self-end px-5 py-2"
            onPress={completeOnboarding}
            hitSlop={8}
          >
            <Text className="text-text-secondary text-sm font-medium">
              {t('onboarding.skip')}
            </Text>
          </Pressable>
        )}
      </View>

      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
      >
        {pages.map((page, index) => (
          <OnboardingPage
            key={index}
            page={page}
            index={index}
            scrollX={scrollX}
            width={width}
          />
        ))}
      </Animated.ScrollView>

      {/* Bottom controls */}
      <View
        className="px-6 pb-6"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <View className="flex-row justify-center items-center mb-6">
          {pages.map((_, index) => (
            <Dot key={index} index={index} scrollX={scrollX} width={width} />
          ))}
        </View>

        <Button
          title={
            activeIndex === pages.length - 1
              ? t('onboarding.getStarted')
              : t('onboarding.next')
          }
          onPress={goToNext}
          size="lg"
          fullWidth
          icon={
            activeIndex === pages.length - 1 ? undefined : (
              <Ionicons name="arrow-forward" size={18} color="white" />
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}

function OnboardingPage({
  page,
  index,
  scrollX,
  width,
}: {
  page: any;
  index: number;
  scrollX: any;
  width: number;
}) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const imageStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.7, 1, 0.7], Extrapolation.CLAMP);
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [40, 0, -40],
      Extrapolation.CLAMP,
    );
    return { transform: [{ scale }, { translateY }] };
  });

  const textStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [30, 0, -30],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <View className="items-center justify-center px-8" style={{ width }}>
      {/* Animated visual */}
      <Animated.View
        className="w-64 h-64 rounded-full items-center justify-center mb-12"
        style={[
          {
            backgroundColor: `${page.color1}22`,
            borderWidth: 1,
            borderColor: `${page.color1}44`,
          },
          imageStyle,
        ]}
      >
        <View
          className="w-48 h-48 rounded-full items-center justify-center"
          style={{ backgroundColor: `${page.color2}26` }}
        >
          <View
            className="w-32 h-32 rounded-full items-center justify-center"
            style={{ backgroundColor: `${page.color1}33` }}
          >
            <Text className="text-7xl">{page.emoji}</Text>
          </View>
        </View>

        {/* Floating accent dots */}
        <View
          className="absolute w-4 h-4 rounded-full top-6 left-8"
          style={{ backgroundColor: page.color1 }}
        />
        <View
          className="absolute w-3 h-3 rounded-full bottom-10 right-10"
          style={{ backgroundColor: page.color2 }}
        />
        <View
          className="absolute w-2.5 h-2.5 rounded-full top-16 right-12"
          style={{ backgroundColor: colors.accent.secondary }}
        />
      </Animated.View>

      {/* Text */}
      <Animated.View style={textStyle} className="items-center">
        <Text className="text-2xl font-bold text-text-primary text-center leading-9">
          {page.title}
        </Text>
        <Text className="text-base text-text-secondary text-center mt-3 leading-6">
          {page.description}
        </Text>
      </Animated.View>
    </View>
  );
}

function Dot({
  index,
  scrollX,
  width,
}: {
  index: number;
  scrollX: any;
  width: number;
}) {
  const style = useAnimatedStyle(() => {
    const widthAnim = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [8, 28, 8],
      Extrapolation.CLAMP,
    );
    const backgroundColor =
      scrollX.value >= (index - 0.5) * width && scrollX.value < (index + 0.5) * width
        ? colors.accent.primary
        : 'rgba(255,255,255,0.25)';
    return {
      width: widthAnim,
      backgroundColor,
    };
  });

  return (
    <Animated.View
      style={[
        style,
        { height: 8, borderRadius: 4, marginHorizontal: 4 },
      ]}
    />
  );
}
