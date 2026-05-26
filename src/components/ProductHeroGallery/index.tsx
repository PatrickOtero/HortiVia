import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import type { ProductDetail } from '../../features/products/types/product';
import * as S from './styles';

type ProductHeroGalleryProps = {
  product: ProductDetail;
};

function getProductInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

export function ProductHeroGallery({ product }: ProductHeroGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [galleryWidth, setGalleryWidth] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const images = useMemo(
    () =>
      product.mainImages.filter(image => !failedImages[image.id]).slice(0, 8),
    [failedImages, product.mainImages],
  );
  const hasGallery = images.length > 0;
  const shouldShowCounter = images.length > 1;
  const shouldShowPagination = images.length > 1;

  useEffect(() => {
    setActiveIndex(0);
    setFailedImages({});
  }, [product.id]);

  function handleLayout(event: LayoutChangeEvent) {
    setGalleryWidth(event.nativeEvent.layout.width);
  }

  function handleMomentumScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    if (!galleryWidth) {
      return;
    }

    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / galleryWidth,
    );

    setActiveIndex(nextIndex);
  }

  if (!hasGallery) {
    return (
      <S.Container>
        <S.PlaceholderShell>
          <S.PlaceholderBadge>
            <S.PlaceholderInitial>{getProductInitial(product.name)}</S.PlaceholderInitial>
          </S.PlaceholderBadge>
          <S.PlaceholderTitle>{product.name}</S.PlaceholderTitle>
          <S.PlaceholderText>Imagem do alimento em atualização.</S.PlaceholderText>
        </S.PlaceholderShell>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.GalleryShell onLayout={handleLayout}>
        {shouldShowCounter ? (
          <S.CounterPill>
            <S.CounterText>
              {activeIndex + 1}/{images.length}
            </S.CounterText>
          </S.CounterPill>
        ) : null}

        <S.Scroll
          horizontal
          pagingEnabled
          scrollEnabled={images.length > 1}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
        >
          {images.map(image => (
            <S.Slide key={image.id} $width={galleryWidth}>
              <S.SlideImage
                source={{ uri: image.imageUrl }}
                onError={() =>
                  setFailedImages(currentState => ({
                    ...currentState,
                    [image.id]: true,
                  }))
                }
              />
              {image.caption ? (
                <S.CaptionCard>
                  {image.label ? <S.CaptionLabel>{image.label}</S.CaptionLabel> : null}
                  <S.CaptionText numberOfLines={2}>{image.caption}</S.CaptionText>
                </S.CaptionCard>
              ) : null}
            </S.Slide>
          ))}
        </S.Scroll>
      </S.GalleryShell>

      {shouldShowPagination ? (
        <S.PaginationRow>
          {images.map((image, index) => (
            <S.PaginationDot key={image.id} $active={index === activeIndex} />
          ))}
        </S.PaginationRow>
      ) : null}
    </S.Container>
  );
}
