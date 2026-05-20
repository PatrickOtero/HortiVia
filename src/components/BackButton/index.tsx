import React from 'react';
import * as S from './styles';

type BackButtonProps = {
  onPress?: () => void;
};

export function BackButton({ onPress }: BackButtonProps) {
  if (!onPress) {
    return <S.Placeholder />;
  }

  return (
    <S.Button onPress={onPress} accessibilityRole="button" accessibilityLabel="Voltar">
      <S.Icon>{'<'}</S.Icon>
    </S.Button>
  );
}
