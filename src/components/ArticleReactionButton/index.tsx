import React from 'react';
import { ActivityIndicator, type GestureResponderEvent } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import * as S from './styles';

type ArticleReactionButtonProps = {
  isActive: boolean;
  count: number;
  isLoading?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  disabled?: boolean;
  testID?: string;
};

function getPeopleLabel(count: number) {
  if (count === 1) {
    return '1 pessoa achou útil';
  }

  return `${count} pessoas acharam útil`;
}

export function ArticleReactionButton({
  isActive,
  count,
  isLoading = false,
  onPress,
  size = 'sm',
  showLabel = true,
  disabled = false,
  testID,
}: ArticleReactionButtonProps) {
  const { theme } = useTheme();
  const safeCount = Math.max(count, 0);
  const isDisabled = disabled || isLoading;
  const accessibilityLabel = isActive
    ? `Marcado como útil. ${getPeopleLabel(safeCount)}.`
    : `Marcar como útil. ${getPeopleLabel(safeCount)}.`;
  const content = isLoading ? (
    <S.LoadingShell>
      <ActivityIndicator size="small" color={theme.colors.primaryStrong} />
    </S.LoadingShell>
  ) : (
    <>
      {showLabel ? <S.Label $active={isActive}>Útil ·</S.Label> : null}
      <S.CountText $active={isActive}>{safeCount}</S.CountText>
    </>
  );

  if (!onPress) {
    return (
      <S.StaticContainer
        testID={testID}
        $active={isActive}
        $size={size}
        $showLabel={showLabel}
      >
        {content}
      </S.StaticContainer>
    );
  }

  return (
    <S.Button
      testID={testID}
      onPress={onPress}
      activeOpacity={0.88}
      disabled={isDisabled}
      $active={isActive}
      $size={size}
      $showLabel={showLabel}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Marca ou remove este artigo como útil."
      accessibilityState={{
        selected: isActive,
        busy: isLoading,
        disabled: isDisabled,
      }}
    >
      {content}
    </S.Button>
  );
}
