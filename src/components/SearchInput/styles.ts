import styled from 'styled-components/native';

export const Container = styled.View<{ $isFocused: boolean }>`
  min-height: ${({ theme }) => theme.layout.inputHeight}px;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme, $isFocused }) =>
    $isFocused ? theme.colors.surface : theme.colors.surfaceMuted};
  border-width: 1px;
  border-color: ${({ theme, $isFocused }) =>
    $isFocused ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  shadow-color: ${({ theme, $isFocused }) =>
    $isFocused ? theme.colors.primary : theme.colors.shadow};
  shadow-offset: 0px 6px;
  shadow-opacity: ${({ $isFocused }) => ($isFocused ? 0.08 : 0)};
  shadow-radius: 14px;
  elevation: ${({ theme, $isFocused }) => ($isFocused ? theme.elevation.card : 0)};
`;

export const IconWrapper = styled.View`
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
`;

export const IconLens = styled.View<{ $isFocused: boolean }>`
  width: 12px;
  height: 12px;
  border-width: 2px;
  border-color: ${({ theme, $isFocused }) =>
    $isFocused ? theme.colors.primaryStrong : theme.colors.textMuted};
  border-radius: ${({ theme }) => theme.radius.full}px;
`;

export const IconHandle = styled.View.attrs({
  style: {
    transform: [{ rotate: '45deg' }],
  },
})<{ $isFocused: boolean }>`
  position: absolute;
  right: 1px;
  bottom: 1px;
  width: 7px;
  height: 2px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme, $isFocused }) =>
    $isFocused ? theme.colors.primaryStrong : theme.colors.textMuted};
`;

export const Input = styled.TextInput.attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.textMuted,
}))`
  flex: 1;
  min-height: ${({ theme }) => theme.layout.inputHeight}px;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
`;
