import React from 'react';
import { Alert, type GestureResponderEvent } from 'react-native';
import { FavoriteButton } from '../FavoriteButton';
import { ProductThumbnail } from '../ProductThumbnail';
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

export function RecentProductCard({
  product,
  onPress,
  onFavoriteChange,
  isFavorite,
  isFavoriteLoading,
  onToggleFavorite,
}: RecentProductCardProps) {
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
      <ProductThumbnail
        imageUrl={product.imageUrl}
        name={product.name}
        category={product.category}
        size="tile"
      />

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
