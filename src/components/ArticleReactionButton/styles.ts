import styled from 'styled-components/native';

type ReactionButtonSize = 'sm' | 'md';

const HEIGHT_BY_SIZE = {
  sm: 34,
  md: 42,
} as const;

const MIN_WIDTH_BY_SIZE = {
  sm: 88,
  md: 110,
} as const;

const PADDING_BY_SIZE = {
  sm: 10,
  md: 14,
} as const;

const ICON_SLOT_SIZE_BY_BUTTON_SIZE = {
  sm: 18,
  md: 22,
} as const;

const ICON_GLYPH_SIZE = {
  sm: 12,
  md: 14,
} as const;

const COUNT_WIDTH_BY_SIZE = {
  sm: 34,
  md: 28,
} as const;

const COMPACT_COUNT_WIDTH_BY_SIZE = {
  sm: 40,
  md: 48,
} as const;

export const Button = styled.TouchableOpacity<{
  $active: boolean;
  $size: ReactionButtonSize;
  $showLabel: boolean;
}>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  height: ${({ $size }) => HEIGHT_BY_SIZE[$size]}px;
  min-width: ${({ $size }) => MIN_WIDTH_BY_SIZE[$size]}px;
  padding-horizontal: ${({ $size }) => PADDING_BY_SIZE[$size]}px;
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primarySoft : theme.colors.surface};
`;

export const StaticContainer = styled.View<{
  $active: boolean;
  $size: ReactionButtonSize;
  $showLabel: boolean;
}>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  height: ${({ $size }) => HEIGHT_BY_SIZE[$size]}px;
  min-width: ${({ $size }) => MIN_WIDTH_BY_SIZE[$size]}px;
  padding-horizontal: ${({ $size }) => PADDING_BY_SIZE[$size]}px;
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primarySoft : theme.colors.surface};
`;

export const IconSlot = styled.View<{
  $active: boolean;
  $size: ReactionButtonSize;
}>`
  width: ${({ $size }) => ICON_SLOT_SIZE_BY_BUTTON_SIZE[$size]}px;
  height: ${({ $size }) => ICON_SLOT_SIZE_BY_BUTTON_SIZE[$size]}px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.surface : theme.colors.surfaceMuted};
`;

export const IconGlyph = styled.Text<{
  $active: boolean;
  $size: ReactionButtonSize;
}>`
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryStrong : theme.colors.textMuted};
  font-size: ${({ $size }) => ICON_GLYPH_SIZE[$size]}px;
  line-height: ${({ $size }) => ICON_GLYPH_SIZE[$size]}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const Label = styled.Text<{ $active: boolean }>`
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryStrong : theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const CountText = styled.Text<{
  $active: boolean;
  $size: ReactionButtonSize;
  $showLabel: boolean;
}>`
  width: ${({ $size, $showLabel }) =>
    $showLabel
      ? COUNT_WIDTH_BY_SIZE[$size]
      : COMPACT_COUNT_WIDTH_BY_SIZE[$size]}px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryStrong : theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
  text-align: center;
`;
