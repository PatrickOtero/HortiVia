import styled from 'styled-components/native';

type ReactionButtonSize = 'sm' | 'md';

const HEIGHT_BY_SIZE = {
  sm: 34,
  md: 42,
} as const;

const MIN_WIDTH_BY_SIZE = {
  sm: 74,
  md: 98,
} as const;

const PADDING_BY_SIZE = {
  sm: 10,
  md: 14,
} as const;

const COUNT_MIN_WIDTH_BY_SIZE = {
  sm: 20,
  md: 24,
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
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  height: ${({ $size }) => HEIGHT_BY_SIZE[$size]}px;
  min-width: ${({ $size }) => MIN_WIDTH_BY_SIZE[$size]}px;
  padding-horizontal: ${({ $size }) => PADDING_BY_SIZE[$size]}px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primarySoft : theme.colors.surfaceMuted};
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
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  height: ${({ $size }) => HEIGHT_BY_SIZE[$size]}px;
  min-width: ${({ $size }) => MIN_WIDTH_BY_SIZE[$size]}px;
  padding-horizontal: ${({ $size }) => PADDING_BY_SIZE[$size]}px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primarySoft : theme.colors.surfaceMuted};
`;

export const Label = styled.Text<{ $active: boolean }>`
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryStrong : theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const CountText = styled.Text<{ $active: boolean }>`
  min-width: ${COUNT_MIN_WIDTH_BY_SIZE.sm}px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryStrong : theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
  text-align: center;
`;

export const LoadingShell = styled.View`
  width: 100%;
  align-items: center;
  justify-content: center;
`;
