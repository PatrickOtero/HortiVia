import React from 'react';
import * as S from './styles';

type AdminMenuCardProps = {
  title: string;
  description: string;
  onPress: () => void;
};

export function AdminMenuCard({
  title,
  description,
  onPress,
}: AdminMenuCardProps) {
  return (
    <S.Container onPress={onPress} activeOpacity={0.86}>
      <S.CopyBlock>
        <S.Title>{title}</S.Title>
        <S.Description>{description}</S.Description>
      </S.CopyBlock>
      <S.Chevron>{'>'}</S.Chevron>
    </S.Container>
  );
}
