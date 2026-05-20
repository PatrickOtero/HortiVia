import React, { useEffect, useState } from 'react';
import {
  getProductCategoryLabel,
} from '../../features/products/mappers/product.mapper';
import type { ProductListItem } from '../../features/products/types/product';
import * as S from './styles';

type ProductCardProps = {
  product: ProductListItem;
  onPress: () => void;
};

function getProductInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [product.imageUrl]);

  const shouldShowImage = Boolean(product.imageUrl) && !hasImageError;

  return (
    <S.Button onPress={onPress} activeOpacity={0.9}>
      <S.LeadingMark $category={product.category}>
        {shouldShowImage ? (
          <S.ProductImage
            source={{ uri: product.imageUrl ?? undefined }}
            onError={() => setHasImageError(true)}
          />
        ) : (
          <S.LeadingMarkText>{getProductInitials(product.name)}</S.LeadingMarkText>
        )}
      </S.LeadingMark>

      <S.Content>
        <S.TopRow>
          <S.ProductName>{product.name}</S.ProductName>
          <S.CategoryTag $category={product.category}>
            <S.CategoryText>{getProductCategoryLabel(product.category)}</S.CategoryText>
          </S.CategoryTag>
        </S.TopRow>
        <S.HintText>{product.shortDescription}</S.HintText>
        <S.ActionText>Ver detalhes</S.ActionText>
      </S.Content>
    </S.Button>
  );
}
