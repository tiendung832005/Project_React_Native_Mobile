/**
 * Instagram-inspired Theme System
 * Complete design tokens matching Instagram's current design language
 */

import { Platform } from 'react-native';

// Instagram Color Palette
export const InstagramColors = {
  // Brand Colors
  primary: '#E4405F', // Instagram pink/red
  secondary: '#833AB4', // Instagram purple
  accent: '#F77737', // Instagram orange
  yellow: '#FCAF45', // Instagram yellow
  
  // Grayscale
  black: '#000000',
  darkGray: '#262626',
  mediumGray: '#8E8E8E', 
  lightGray: '#C7C7C7',
  background: '#FAFAFA',
  white: '#FFFFFF',
  
  // Semantic Colors
  error: '#ED4956',
  success: '#42D392',
  warning: '#FFA726',
  info: '#0095F6', // Instagram blue
  
  // Text Colors
  textPrimary: '#262626',
  textSecondary: '#8E8E8E',
  textTertiary: '#C7C7C7',
  textInverse: '#FFFFFF',
  
  // Border & Divider
  border: '#DBDBDB',
  divider: '#EFEFEF',
  
  // Story Gradient
  storyGradient: ['#FCAF45', '#F77737', '#E4405F', '#833AB4'],
  
  // Button Colors
  buttonPrimary: '#0095F6',
  buttonSecondary: '#FAFAFA',
  buttonDanger: '#ED4956',
};

// Light/Dark Mode Support
const tintColorLight = InstagramColors.info;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: InstagramColors.textPrimary,
    background: InstagramColors.white,
    backgroundSecondary: InstagramColors.background,
    tint: tintColorLight,
    icon: InstagramColors.textSecondary,
    tabIconDefault: InstagramColors.textSecondary,
    tabIconSelected: InstagramColors.black,
    border: InstagramColors.border,
    divider: InstagramColors.divider,
  },
  dark: {
    text: '#ECEDEE',
    background: '#000000',
    backgroundSecondary: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#262626',
    divider: '#1C1C1E',
  },
};

// Typography System
export const Typography = {
  // Sizes
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 36,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Font Weights
  weight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

// Spacing System (based on 4px grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

// Border Radius
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadows (Instagram-style)
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Platform-specific fonts
export const Fonts = Platform.select({
  ios: {
    regular: 'HelveticaNeue',
    medium: 'HelveticaNeue-Medium',
    bold: 'HelveticaNeue-Bold',
    light: 'HelveticaNeue-Light',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium', 
    bold: 'Roboto-Bold',
    light: 'Roboto-Light',
  },
  default: {
    regular: 'system',
    medium: 'system',
    bold: 'system',
    light: 'system',
  },
});

// Instagram-specific measurements
export const InstagramSizes = {
  // Story dimensions
  storySize: 66,
  storyBorderWidth: 3,
  
  // Avatar sizes
  avatarSizes: {
    xs: 24,
    sm: 32,
    md: 44,
    lg: 56,
    xl: 80,
    '2xl': 150,
  },
  
  // Post dimensions
  postImageAspectRatio: 1, // Square by default
  postMaxImageHeight: 400,
  
  // Header heights
  headerHeight: 44,
  tabBarHeight: 50,
  
  // Interaction zones
  touchableMinSize: 44,
};

// Animation configurations
export const Animations = {
  timing: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};
