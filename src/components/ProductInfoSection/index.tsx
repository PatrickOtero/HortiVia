import React from 'react';
import { SectionTitle } from '../SectionTitle';
import { SurfaceCard } from '../SurfaceCard';
import * as S from './styles';

type ProductInfoSectionProps = {
  title: string;
  subtitle?: string;
  items: string[];
};

export function ProductInfoSection({
  title,
  subtitle,
  items,
}: ProductInfoSectionProps) {
  return (
    <SurfaceCard>
      <SectionTitle title={title} subtitle={subtitle} />
      <S.List>
        {items.map(item => (
          <S.ListItem key={item}>
            <S.Bullet />
            <S.ListText>{item}</S.ListText>
          </S.ListItem>
        ))}
      </S.List>
    </SurfaceCard>
  );
}
