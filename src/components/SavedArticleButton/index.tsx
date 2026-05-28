import React from 'react';
import { ActivityIndicator, type GestureResponderEvent } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import * as S from './styles';

type SavedArticleButtonProps = {
  isSaved: boolean;
  isLoading?: boolean;
  onPress: (event: GestureResponderEvent) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  disabled?: boolean;
};

export function SavedArticleButton({
  isSaved,
  isLoading = false,
  onPress,
  size = 'sm',
  showLabel = true,
  disabled = false,
}: SavedArticleButtonProps) {
  const { theme } = useTheme();
  const label = showLabel ? (isSaved ? 'Salvo' : 'Salvar') : undefined;
  const isDisabled = disabled || isLoading;

  return (
    <S.Button
      onPress={onPress}
      activeOpacity={0.88}
      disabled={isDisabled}
      $active={isSaved}
      $size={size}
      $withLabel={Boolean(label)}
      accessibilityRole="button"
      accessibilityLabel={isSaved ? 'Leitura salva' : 'Salvar leitura'}
      accessibilityHint="Salva ou remove o artigo das leituras salvas."
      accessibilityState={{
        selected: isSaved,
        busy: isLoading,
        disabled: isDisabled,
      }}
    >
      {isLoading ? (
        <S.LoadingShell $withLabel={Boolean(label)}>
          <ActivityIndicator size="small" color={theme.colors.primaryStrong} />
        </S.LoadingShell>
      ) : (
        <>
          <S.IconSlot $size={size}>
            <S.BookmarkOutline $active={isSaved} $size={size} />
            <S.BookmarkNotch $active={isSaved} $size={size} />
            <S.BookmarkCut $active={isSaved} $size={size} />
          </S.IconSlot>
          {label ? <S.Label $active={isSaved}>{label}</S.Label> : null}
        </>
      )}
    </S.Button>
  );
}
