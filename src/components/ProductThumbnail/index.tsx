import React, { useEffect, useState } from 'react';
import type { ProductCategory } from '../../features/products/types/product';
import * as S from './styles';

type ProductThumbnailProps = {
  imageUrl: string | null;
  name: string;
  category: ProductCategory;
  size: 'row' | 'tile';
};

function getProductInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

export function ProductThumbnail({
  imageUrl,
  name,
  category,
  size,
}: ProductThumbnailProps) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  return (
    <S.ImageShell $category={category} $size={size}>
      {imageUrl && !hasImageError ? (
        <S.ProductImage
          source={{ uri: imageUrl }}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <S.ImageFallbackText $size={size}>
          {getProductInitials(name)}
        </S.ImageFallbackText>
      )}
    </S.ImageShell>
  );
}
