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
  const scrollRef = useRef<Animated.ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const pages = [
    {
      title: t('onboarding.discover_title'),
      description: t('onboarding.discover_desc'),
      emoji: '🌌',
      badge: 'NANO CURATED',
      color1: '#7C6EF6',
      color2: '#EC4899',
      icon: 'sparkles',
    },
    {
      title: t('onboarding.personalize_title'),
      description: t('onboarding.personalize_desc'),
      emoji: '📱',
      badge: '4K ULTRA HD',
      color1: '#06B6D4',
      color2: '#7C6EF6',
      icon: 'color-palette',
    },
    {
      title: t('onboarding.collections_title'),
      description: t('onboarding.collections_desc'),
      emoji: '❤️',
      badge: 'CUSTOM SYNC',
      color1: '#F97316',
      color2: '#EC4899',
      icon: 'heart',
    },
  ];

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(page);
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Main' as never);
    } else {
      (navigation as any).navigate('Main');
    }
  };

  const goToNext = () => {
    if (activeIndex < pages.length - 1) {
      const nextIndex = activeIndex + 1;
      setActiveIndex(nextIndex);
      scrollRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top', 'bottom']}>
      {/* Top Header with Skip button */}
      <View
        className="flex-row items-center justify-between px-6 py-2"
        style={{ paddingTop: Math.max(insets.top, 8) }}
      >
        <View className="flex-row items-center">
          <Text className="text-lg">🍌</Text>
          <Text
            className="text-white text-base font-bold ml-1.5"
            style={{ fontFamily: 'DMSerifDisplay_400Regular' }}
          >
            Wallcraft
          </Text>
        </View>

        {activeIndex < pages.length - 1 ? (
          <Pressable
            className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10"
            onPress={completeOnboarding}
            hitSlop={8}
          >
            <Text className="text-text-secondary text-xs font-semibold">
              {t('onboarding.skip')}
            </Text>
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Main Slide Carousel */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
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

      {/* Bottom Controls */}
      <View
        className="px-6 pb-6"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        {/* Pagination Dots */}
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
    const scale = interpolate(scrollX.value, inputRange, [0.75, 1, 0.75], Extrapolation.CLAMP);
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
      [25, 0, -25],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <View className="items-center justify-center px-8" style={{ width }}>
      {/* Animated Visual orb */}
      <Animated.View
        className="w-72 h-72 rounded-full items-center justify-center mb-10 relative"
        style={[
          {
            backgroundColor: `${page.color1}18`,
            borderWidth: 1,
            borderColor: `${page.color1}35`,
          },
          imageStyle,
        ]}
      >
        <View
          className="w-52 h-52 rounded-full items-center justify-center"
          style={{ backgroundColor: `${page.color2}22` }}
        >
          <View
            className="w-36 h-36 rounded-full items-center justify-center shadow-2xl"
            style={{ backgroundColor: `${page.color1}30` }}
          >
            <Text className="text-7xl">{page.emoji}</Text>
          </View>
        </View>

        {/* Floating badge */}
        <View
          className="absolute -top-3 px-3 py-1 rounded-full border border-white/20 shadow-lg"
          style={{ backgroundColor: page.color1 }}
        >
          <Text className="text-white text-[10px] font-extrabold tracking-widest uppercase">
            {page.badge}
          </Text>
        </View>
      </Animated.View>

      {/* Typography */}
      <Animated.View style={textStyle} className="items-center">
        <Text
          className="text-3xl text-text-primary text-center leading-10 font-bold"
          style={{ fontFamily: 'DMSerifDisplay_400Regular' }}
        >
          {page.title}
        </Text>
        <Text className="text-sm text-text-secondary text-center mt-3 leading-6 px-4">
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
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0.3, 1, 0.3],
      Extrapolation.CLAMP,
    );
    return {
      width: widthAnim,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        style,
        {
          height: 7,
          borderRadius: 4,
          marginHorizontal: 3.5,
          backgroundColor: colors.accent.primary,
        },
      ]}
    />
  );
}
