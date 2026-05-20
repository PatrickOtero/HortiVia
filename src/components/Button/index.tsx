import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import * as S from './styles';

type ButtonVariant = 'primary' | 'secondary' | 'text';

type BaseButtonProps = {
  children: React.ReactNode;
  onPress: () => void;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

type ButtonProps = BaseButtonProps & {
  variant?: ButtonVariant;
};

function AppButton({
  children,
  onPress,
  variant = 'primary',
  fullWidth = true,
  disabled = false,
  loading = false,
}: ButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const spinnerColor =
    variant === 'primary'
      ? theme.colors.textOnPrimary
      : theme.colors.primaryStrong;

  return (
    <S.Button
      onPress={onPress}
      $variant={variant}
      $fullWidth={fullWidth}
      $disabled={isDisabled}
      disabled={isDisabled}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <S.Label $variant={variant} $disabled={isDisabled}>
          {children}
        </S.Label>
      )}
    </S.Button>
  );
}

export function PrimaryButton(props: BaseButtonProps) {
  return <AppButton {...props} variant="primary" />;
}

export function SecondaryButton(props: BaseButtonProps) {
  return <AppButton {...props} variant="secondary" />;
}

export function TextButton({ fullWidth = false, ...props }: BaseButtonProps) {
  return <AppButton {...props} fullWidth={fullWidth} variant="text" />;
}
