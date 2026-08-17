import { Dimensions, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const responsive = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 428,
  isLargeDevice: SCREEN_WIDTH >= 428,
  statusBarHeight: Platform.select({
    android: StatusBar.currentHeight ?? 24,
    ios: 44,
    default: 0,
  }),
  bottomTabHeight: 65,
  headerHeight: 56,
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
  },
  wp: (percentage: number) => (SCREEN_WIDTH * percentage) / 100,
  hp: (percentage: number) => (SCREEN_HEIGHT * percentage) / 100,
};
