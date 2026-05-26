import React, { useEffect, useState } from 'react';
import { getArticleCategoryLabel } from '../../features/articles/mappers/article.mapper';
import type { RelatedArticle } from '../../features/products/types/product';
import * as S from './styles';

type CompactArticleCardProps = {
  article: RelatedArticle;
  onPress: () => void;
};

function getArticleInitials(title: string) {
  return title
    .split(' ')
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

export function CompactArticleCard({
  article,
  onPress,
}: CompactArticleCardProps) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [article.imageUrl]);

  const shouldShowImage = Boolean(article.imageUrl) && !hasImageError;

  return (
    <S.Button onPress={onPress} activeOpacity={0.92}>
      <S.ImageShell>
        {shouldShowImage ? (
          <S.ArticleImage
            source={{ uri: article.imageUrl ?? undefined }}
            onError={() => setHasImageError(true)}
          />
        ) : (
          <S.ImageFallbackText>
            {getArticleInitials(article.title)}
          </S.ImageFallbackText>
        )}
      </S.ImageShell>

      <S.Content>
        <S.CategoryTag>
          <S.CategoryText>
            {getArticleCategoryLabel(article.category)}
          </S.CategoryText>
        </S.CategoryTag>
        <S.Title numberOfLines={2} ellipsizeMode="tail">
          {article.title}
        </S.Title>
        <S.Summary numberOfLines={3} ellipsizeMode="tail">
          {article.summary}
        </S.Summary>
      </S.Content>
    </S.Button>
  );
}
