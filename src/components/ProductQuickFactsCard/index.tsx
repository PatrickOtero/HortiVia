import React from 'react';
import type { ProductDetail } from '../../features/products/types/product';
import { SectionTitle } from '../SectionTitle';
import { SurfaceCard } from '../SurfaceCard';
import { NutritionGrid } from '../NutritionGrid';
import * as S from './styles';

type ProductQuickFactsCardProps = {
  nutrients: ProductDetail['nutrients'];
  highlights: string[];
};

export function ProductQuickFactsCard({
  nutrients,
  highlights,
}: ProductQuickFactsCardProps) {
  if (!nutrients.length && !highlights.length) {
    return null;
  }

  return (
    <SurfaceCard>
      <S.Content>
        <SectionTitle
          title="Informações rápidas"
          subtitle="Resumo útil para consulta rápida."
        />

        {highlights.length ? (
          <S.HighlightRow>
            {highlights.map(item => (
              <S.HighlightChip key={item}>
                <S.HighlightText>{item}</S.HighlightText>
              </S.HighlightChip>
            ))}
          </S.HighlightRow>
        ) : null}

        {nutrients.length ? <NutritionGrid nutrients={nutrients} /> : null}
      </S.Content>
    </SurfaceCard>
  );
}
