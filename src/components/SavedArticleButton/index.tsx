import React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { FavoriteButton } from '../FavoriteButton';

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
  return (
    <FavoriteButton
      isFavorite={isSaved}
      isLoading={isLoading}
      onPress={onPress}
      size={size}
      activeIcon="■"
      inactiveIcon="□"
      activeLabel={showLabel ? 'Salvo' : undefined}
      inactiveLabel={showLabel ? 'Salvar' : undefined}
      disabled={disabled}
      accessibilityLabel={isSaved ? 'Leitura salva' : 'Salvar leitura'}
      accessibilityHint="Salva ou remove o artigo das leituras salvas."
    />
  );
}
