import styled, { css } from 'styled-components/native';

type Variant = 'primary' | 'secondary' | 'text';

const variantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.borderStrong};
  `,
  text: css`
    background-color: transparent;
    border-color: transparent;
  `,
};

const disabledVariantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primarySoft};
    border-color: ${({ theme }) => theme.colors.primarySoft};
    shadow-opacity: 0;
    elevation: 0;
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.colors.surfaceMuted};
    border-color: ${({ theme }) => theme.colors.border};
    shadow-opacity: 0;
    elevation: 0;
  `,
  text: css`
    background-color: transparent;
    border-color: transparent;
    shadow-opacity: 0;
    elevation: 0;
  `,
};

export const Button = styled.TouchableOpacity<{
  $variant: Variant;
  $fullWidth: boolean;
  $disabled: boolean;
}>`
  min-height: ${({ theme }) => theme.layout.buttonHeight}px;
  padding-horizontal: ${({ theme }) => theme.spacing.xl}px;
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px 8px;
  shadow-opacity: 0.14;
  shadow-radius: 16px;
  elevation: ${({ theme, $variant }) => ($variant === 'primary' ? theme.elevation.card : 0)};
  opacity: 1;
  ${({ $variant }) => variantStyles[$variant]}
  ${({ $variant, $disabled }) => ($disabled ? disabledVariantStyles[$variant] : '')}
  ${({ $fullWidth }) => ($fullWidth ? 'width: 100%;' : '')}
`;

export const Label = styled.Text<{ $variant: Variant; $disabled: boolean }>`
  color: ${({ theme, $variant, $disabled }) => {
    if ($disabled) {
      return $variant === 'primary' ? theme.colors.primaryStrong : theme.colors.textMuted;
    }

    if ($variant === 'primary') {
      return theme.colors.textOnPrimary;
    }

    if ($variant === 'secondary') {
      return theme.colors.text;
    }

    return theme.colors.primaryStrong;
  }};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  line-height: ${({ theme }) => theme.typography.label.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  letter-spacing: ${({ theme }) => theme.typography.label.letterSpacing ?? 0}px;
`;
