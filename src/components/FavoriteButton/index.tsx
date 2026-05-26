import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  type GestureResponderEvent,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import * as S from './styles';

type FavoriteButtonProps = {
  isFavorite: boolean;
  isLoading?: boolean;
  onPress: (event: GestureResponderEvent) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  disabled?: boolean;
};

export function FavoriteButton({
  isFavorite,
  isLoading = false,
  onPress,
  size = 'md',
  label,
  disabled = false,
}: FavoriteButtonProps) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const isFirstRenderRef = useRef(true);
  const icon = isFavorite ? '\u2665' : '\u2661';
  const isDisabled = disabled || isLoading;

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    const pulse = Animated.sequence([
      Animated.timing(scale, {
        toValue: isFavorite ? 1.18 : 0.94,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);

    pulse.start();

    return () => {
      pulse.stop();
      scale.stopAnimation();
      scale.setValue(1);
    };
  }, [isFavorite, scale]);

  return (
    <S.Button
      onPress={onPress}
      activeOpacity={0.88}
      disabled={isDisabled}
      $active={isFavorite}
      $size={size}
      $withLabel={Boolean(label)}
      accessibilityRole="button"
      accessibilityLabel={label ?? (isFavorite ? 'Favorito' : 'Salvar')}
      accessibilityHint="Salva ou remove o produto dos favoritos."
      accessibilityState={{
        selected: isFavorite,
        busy: isLoading,
        disabled: isDisabled,
      }}
    >
      <S.IconSlot>
        <Animated.View style={{ transform: [{ scale }] }}>
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primaryStrong} />
          ) : (
            <S.Icon $active={isFavorite}>{icon}</S.Icon>
          )}
        </Animated.View>
      </S.IconSlot>
      {label ? <S.Label $active={isFavorite}>{label}</S.Label> : null}
    </S.Button>
  );
}
