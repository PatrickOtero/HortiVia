import React, { useEffect, useState } from 'react';
import type { ProductGuideSection as ProductGuideSectionType } from '../../features/products/types/product';
import { SectionTitle } from '../SectionTitle';
import { SurfaceCard } from '../SurfaceCard';
import * as S from './styles';

type ProductGuideSectionProps = {
  section: ProductGuideSectionType;
};

export function ProductGuideSection({ section }: ProductGuideSectionProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const shouldShowImage = Boolean(section.imageUrl) && !hasImageError;

  useEffect(() => {
    setHasImageError(false);
  }, [section.imageUrl]);

  return (
    <SurfaceCard>
      <S.Content>
        <SectionTitle title={section.title} subtitle={section.body ?? undefined} />

        {shouldShowImage ? (
          <S.ImageBlock>
            <S.SectionImage
              source={{ uri: section.imageUrl ?? undefined }}
              onError={() => setHasImageError(true)}
            />
            {section.imageCaption ? (
              <S.ImageCaption>{section.imageCaption}</S.ImageCaption>
            ) : null}
          </S.ImageBlock>
        ) : null}

        {section.bullets.length ? (
          <S.List>
            {section.bullets.map(item => (
              <S.ListItem key={item}>
                <S.Bullet />
                <S.ListText>{item}</S.ListText>
              </S.ListItem>
            ))}
          </S.List>
        ) : null}

        {section.idealPoints?.length ? (
          <S.CalloutCard $tone="ideal">
            <S.CalloutTitle>Ideal</S.CalloutTitle>
            {section.idealPoints.map(item => (
              <S.CalloutItem key={item}>{item}</S.CalloutItem>
            ))}
          </S.CalloutCard>
        ) : null}

        {section.avoidPoints?.length ? (
          <S.CalloutCard $tone="avoid">
            <S.CalloutTitle>Evitar</S.CalloutTitle>
            {section.avoidPoints.map(item => (
              <S.CalloutItem key={item}>{item}</S.CalloutItem>
            ))}
          </S.CalloutCard>
        ) : null}
      </S.Content>
    </SurfaceCard>
  );
}
