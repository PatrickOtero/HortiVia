import React from 'react';
import type { ProductDetail } from '../../features/products/types/product';
import * as S from './styles';

type NutritionGridProps = {
  nutrients: NonNullable<ProductDetail['nutrients']>;
};

export function NutritionGrid({ nutrients }: NutritionGridProps) {
  return (
    <S.Grid>
      {nutrients.map(nutrient => (
        <S.Item key={nutrient.label}>
          <S.Label>{nutrient.label}</S.Label>
          <S.Value>{nutrient.value}</S.Value>
        </S.Item>
      ))}
    </S.Grid>
  );
}
