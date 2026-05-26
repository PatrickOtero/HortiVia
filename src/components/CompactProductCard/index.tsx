import React, { useEffect, useState } from 'react';
import { getProductCategoryLabel } from '../../features/products/mappers/product.mapper';
import type { RelatedProduct } from '../../features/articles/types/article';
import * as S from './styles';

type CompactProductCardProps = {
  product: RelatedProduct;
  onPress: () => void;
};

function getProductInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

export function CompactProductCard({
  product,
  onPress,
}: CompactProductCardProps) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [product.imageUrl]);

  const shouldShowImage = Boolean(product.imageUrl) && !hasImageError;

  return (
    <S.Button onPress={onPress} activeOpacity={0.92}>
      <S.ImageShell $category={product.category}>
        {shouldShowImage ? (
          <S.ProductImage
            source={{ uri: product.imageUrl ?? undefined }}
            onError={() => setHasImageError(true)}
          />
        ) : (
          <S.ImageFallbackText>
            {getProductInitials(product.name)}
          </S.ImageFallbackText>
        )}
      </S.ImageShell>

      <S.Content>
        <S.CategoryTag $category={product.category}>
          <S.CategoryText>
            {getProductCategoryLabel(product.category)}
          </S.CategoryText>
        </S.CategoryTag>
        <S.Title numberOfLines={1} ellipsizeMode="tail">
          {product.name}
        </S.Title>
        <S.Description numberOfLines={2} ellipsizeMode="tail">
          {product.shortDescription}
        </S.Description>
      </S.Content>
    </S.Button>
  );
}
