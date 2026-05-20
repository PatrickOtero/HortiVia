export type ThemeMode = 'light' | 'dark';

export type TypographyStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700';
  letterSpacing?: number;
};

export type ThemeColors = {
  primary: string;
  primarySoft: string;
  primaryStrong: string;
  accent: string;
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  textOnPrimary: string;
  border: string;
  borderStrong: string;
  shadow: string;
  overlay: string;
  success: string;
  warning: string;
  danger: string;
};

export type ThemeSpacing = {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
};

export type ThemeRadius = {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  pill: number;
  full: number;
};

export type ThemeTypography = {
  display: TypographyStyle;
  headingLg: TypographyStyle;
  headingMd: TypographyStyle;
  headingSm: TypographyStyle;
  bodyLg: TypographyStyle;
  bodyMd: TypographyStyle;
  bodySm: TypographyStyle;
  label: TypographyStyle;
  caption: TypographyStyle;
};

export type ThemeShadow = {
  card: string;
  floating: string;
};

export type ThemeElevation = {
  card: number;
  floating: number;
};

export type ThemeLayout = {
  screenPadding: number;
  contentGap: number;
  sectionGap: number;
  screenBottomPadding: number;
  bottomTabHeight: number;
  bottomTabInset: number;
  tabContentBottomPadding: number;
  headerMinHeight: number;
  inputHeight: number;
  buttonHeight: number;
  iconButtonSize: number;
};

export type Theme = {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  typography: ThemeTypography;
  shadow: ThemeShadow;
  elevation: ThemeElevation;
  layout: ThemeLayout;
};
