import React, { useEffect, useState } from 'react';
import { Avatar } from '../Avatar';
import { getArticleCategoryLabel } from '../../features/articles/mappers/article.mapper';
import type { ArticleListItem } from '../../features/articles/types/article';
import * as S from './styles';

type ArticleCardProps = {
  article: ArticleListItem;
  onPress?: () => void;
};

function formatPublishedDate(dateValue?: string) {
  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const monthLabels = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ];

  return `${String(date.getDate()).padStart(2, '0')} ${monthLabels[date.getMonth()]}`;
}

function getReadingLabel(readingTimeMinutes?: number) {
  if (!readingTimeMinutes) {
    return undefined;
  }

  return `${readingTimeMinutes} min`;
}

export function ArticleCard({ article, onPress }: ArticleCardProps) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [article.imageUrl]);

  const categoryLabel = getArticleCategoryLabel(article.category);
  const publishedDate = formatPublishedDate(article.publishedAt);
  const readingLabel = getReadingLabel(article.readingTimeMinutes);
  const shouldShowImage = Boolean(article.imageUrl) && !hasImageError;

  return (
    <S.CardButton onPress={onPress} disabled={!onPress} activeOpacity={0.92}>
      <S.VisualArea $category={article.category}>
        {shouldShowImage ? (
          <>
            <S.VisualImage
              source={{ uri: article.imageUrl ?? undefined }}
              onError={() => setHasImageError(true)}
            />
            <S.VisualOverlay />
          </>
        ) : null}
        <S.CategoryPill>
          <S.CategoryPillText>{categoryLabel}</S.CategoryPillText>
        </S.CategoryPill>
        <S.VisualTitle>{article.title}</S.VisualTitle>
      </S.VisualArea>

      <S.Content>
        <S.Title>{article.title}</S.Title>
        <S.Summary>{article.summary}</S.Summary>

        <S.MetaRow>
          <S.AuthorRow>
            <Avatar label={article.author.name} size={34} />
            <S.AuthorCopy>
              <S.AuthorName>{article.author.name}</S.AuthorName>
            </S.AuthorCopy>
          </S.AuthorRow>
          <S.DateRow>
            {publishedDate ? <S.MetaText>{publishedDate}</S.MetaText> : null}
            {readingLabel ? <S.MetaText>{readingLabel}</S.MetaText> : null}
          </S.DateRow>
        </S.MetaRow>
      </S.Content>
    </S.CardButton>
  );
}
