import React from 'react';
import { View } from 'react-native';
import * as S from './styles';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, subtitle, rightSlot }: PageHeaderProps) {
  return (
    <S.Container>
      <View>
        {eyebrow ? <S.Eyebrow>{eyebrow}</S.Eyebrow> : null}
        <S.Title>{title}</S.Title>
        {subtitle ? <S.Subtitle>{subtitle}</S.Subtitle> : null}
      </View>
      {rightSlot ? <S.RightSlot>{rightSlot}</S.RightSlot> : null}
    </S.Container>
  );
}
