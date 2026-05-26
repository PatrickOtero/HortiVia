import React, { useEffect, useState } from 'react';
import { Alert, type GestureResponderEvent } from 'react-native';
import { FavoriteButton } from '../FavoriteButton';
import { getProductCategoryLabel } from '../../features/products/mappers/product.mapper';
import { useToggleProductFavorite } from '../../features/products/hooks/useToggleProductFavorite';
import type { RecentProduct } from '../../features/products/types/product';
import * as S from './styles';

type RecentProductCardProps = {
  product: RecentProduct;
  onPress: () => void;
  onFavoriteChange?: (productId: string, isFavorite: boolean) => void;
  isFavorite?: boolean;
  isFavoriteLoading?: boolean;
  onToggleFavorite?: () => void;
};

function getProductInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

export function RecentProductCard({
  product,
  onPress,
  onFavoriteChange,
  isFavorite,
  isFavoriteLoading,
  onToggleFavorite,
}: RecentProductCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const {
    isFavorite: internalIsFavorite,
    isSubmitting: internalIsSubmitting,
    toggleFavorite,
  } = useToggleProductFavorite({
    productId: product.id,
    initialIsFavorite: product.isFavorite ?? false,
    onSuccess: nextIsFavorite => onFavoriteChange?.(product.id, nextIsFavorite),
    onError: message => {
      Alert.alert('Favoritos', message);
    },
    onRequireAuth: () => {
      Alert.alert('Favoritos', 'Entre para salvar produtos nos favoritos.');
    },
  });

  useEffect(() => {
    setHasImageError(false);
  }, [product.imageUrl]);

  const shouldShowImage = Boolean(product.imageUrl) && !hasImageError;
  const resolvedIsFavorite = isFavorite ?? internalIsFavorite;
  const resolvedIsFavoriteLoading = isFavoriteLoading ?? internalIsSubmitting;

  function handleFavoritePress(event: GestureResponderEvent) {
    event.stopPropagation?.();

    if (onToggleFavorite) {
      onToggleFavorite();
      return;
    }

    toggleFavorite();
  }

  return (
    <S.Button onPress={onPress} activeOpacity={0.92}>
      <S.ImageShell $category={product.category}>
        {shouldShowImage ? (
          <S.ProductImage
            source={{ uri: product.imageUrl ?? undefined }}
            onError={() => setHasImageError(true)}
          />
        ) : (
          <S.ImageFallbackText>{getProductInitials(product.name)}</S.ImageFallbackText>
        )}
      </S.ImageShell>

      <S.Content>
        <S.TopRow>
          <S.CategoryTag $category={product.category}>
            <S.CategoryText>{getProductCategoryLabel(product.category)}</S.CategoryText>
          </S.CategoryTag>
          <FavoriteButton
            isFavorite={resolvedIsFavorite}
            isLoading={resolvedIsFavoriteLoading}
            onPress={handleFavoritePress}
            size="sm"
          />
        </S.TopRow>
        <S.ProductName numberOfLines={2}>{product.name}</S.ProductName>
        <S.ProductDescription numberOfLines={3}>
          {product.shortDescription}
        </S.ProductDescription>
      </S.Content>
    </S.Button>
  );
}
