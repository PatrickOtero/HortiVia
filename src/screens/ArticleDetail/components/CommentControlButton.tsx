import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import * as S from './ArticleCommentsSection/styles';

type CommentControlButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  testID?: string;
};

export function CommentControlButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  testID,
}: CommentControlButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  return (
    <S.CommentControlButton
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.88}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      $variant={variant}
      $disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary'
              ? theme.colors.textOnPrimary
              : theme.colors.primaryStrong
          }
        />
      ) : (
        <S.CommentControlLabel $variant={variant} $disabled={isDisabled}>
          {label}
        </S.CommentControlLabel>
      )}
    </S.CommentControlButton>
  );
}
