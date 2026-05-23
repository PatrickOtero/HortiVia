import styled from 'styled-components/native';

export const Container = styled.View`
  width: 100%;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const Label = styled.Text<{ $isFocused: boolean }>`
  color: ${({ theme, $isFocused }) =>
    $isFocused ? theme.colors.primaryStrong : theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const InputShell = styled.View<{ $isFocused: boolean; $editable: boolean }>`
  min-height: ${({ theme }) => theme.layout.inputHeight}px;
  flex-direction: row;
  align-items: center;
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
  opacity: ${({ $editable }) => ($editable ? 1 : 0.72)};
`;

export const Input = styled.TextInput.attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.textMuted,
}))`
  flex: 1;
  min-height: ${({ theme }) => theme.layout.inputHeight}px;
  padding-left: ${({ theme }) => theme.spacing.lg}px;
  padding-right: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
`;

export const RightAccessory = styled.View`
  padding-right: ${({ theme }) => theme.spacing.md}px;
`;

export const HelperText = styled.Text<{ $tone: 'default' | 'danger' | 'success' }>`
  color: ${({ theme, $tone }) => {
    if ($tone === 'danger') {
      return theme.colors.danger;
    }

    if ($tone === 'success') {
      return theme.colors.success;
    }

    return theme.colors.textMuted;
  }};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;
