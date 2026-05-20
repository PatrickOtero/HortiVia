import React, { useEffect, useState } from 'react';
import {
  getProductCategoryLabel,
} from '../../features/products/mappers/product.mapper';
import type { ProductDetail } from '../../features/products/types/product';
import * as S from './styles';

type ProductDetailHeroProps = {
  product: ProductDetail;
};

function getProductInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

export function ProductDetailHero({ product }: ProductDetailHeroProps) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [product.imageUrl]);

  const shouldShowImage = Boolean(product.imageUrl) && !hasImageError;

  return (
    <S.Container>
      <S.VisualShell $category={product.category}>
        <S.VisualCore>
          {shouldShowImage ? (
            <S.ProductImage
              source={{ uri: product.imageUrl ?? undefined }}
              onError={() => setHasImageError(true)}
            />
          ) : (
            <S.Initials>{getProductInitials(product.name)}</S.Initials>
          )}
        </S.VisualCore>
      </S.VisualShell>

      <S.Copy>
        <S.CategoryTag $category={product.category}>
          <S.CategoryText>{getProductCategoryLabel(product.category)}</S.CategoryText>
        </S.CategoryTag>
        <S.Title>{product.name}</S.Title>
        <S.Description>{product.shortDescription}</S.Description>
      </S.Copy>
    </S.Container>
  );
}
