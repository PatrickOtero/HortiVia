import React from 'react';
import * as S from './styles';

type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <S.Container>
      <S.Title>{title}</S.Title>
      {subtitle ? <S.Subtitle>{subtitle}</S.Subtitle> : null}
    </S.Container>
  );
}
