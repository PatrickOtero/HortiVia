import { Theme } from './themeTypes';

const spacing = {
  xxs: 2,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
};

const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
  full: 9999,
};

const typography = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
  },
  headingLg: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  headingMd: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  headingSm: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  bodyLg: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMd: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySm: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
  },
};

const baseLayout = {
  screenPadding: 20,
  contentGap: 14,
  sectionGap: 22,
  screenBottomPadding: 32,
  bottomTabHeight: 56,
  bottomTabInset: 12,
  headerMinHeight: 52,
  inputHeight: 54,
  buttonHeight: 54,
  iconButtonSize: 40,
};

export function createTheme(colors: Theme['colors']): Theme {
  return {
    colors,
    spacing,
    radius,
    typography,
    shadow: {
      card: `0px 10px 24px ${colors.shadow}`,
      floating: `0px 14px 28px ${colors.shadow}`,
    },
    elevation: {
      card: 3,
      floating: 6,
    },
    layout: {
      ...baseLayout,
      tabContentBottomPadding:
        baseLayout.bottomTabHeight + baseLayout.bottomTabInset + spacing.xl,
    },
  };
}
