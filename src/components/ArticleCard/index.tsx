import React, { useEffect, useState } from 'react';
import { Alert, type GestureResponderEvent } from 'react-native';
import { Avatar } from '../Avatar';
import { SavedArticleButton } from '../SavedArticleButton';
import { getArticleCategoryLabel } from '../../features/articles/mappers/article.mapper';
import { useToggleArticleSaved } from '../../features/articles/hooks/useToggleArticleSaved';
import type { ArticleListItem } from '../../features/articles/types/article';
import * as S from './styles';

type ArticleCardProps = {
  article: ArticleListItem;
  onPress?: () => void;
  showSaveButton?: boolean;
  isSaved?: boolean;
  isSavedLoading?: boolean;
  onToggleSaved?: () => void;
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

export function ArticleCard({
  article,
  onPress,
  showSaveButton = false,
  isSaved,
  isSavedLoading,
  onToggleSaved,
}: ArticleCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const {
    isSaved: internalIsSaved,
    isSubmitting: internalIsSubmitting,
    toggleSaved,
  } = useToggleArticleSaved({
    article,
    onError: message => {
      Alert.alert('Leituras salvas', message);
    },
    onRequireAuth: () => {
      Alert.alert('Leituras salvas', 'Entre para salvar leituras.');
    },
  });

  useEffect(() => {
    setHasImageError(false);
  }, [article.imageUrl]);

  const categoryLabel = getArticleCategoryLabel(article.category);
  const publishedDate = formatPublishedDate(article.publishedAt);
  const readingLabel = getReadingLabel(article.readingTimeMinutes);
  const shouldShowImage = Boolean(article.imageUrl) && !hasImageError;
  const resolvedIsSaved = isSaved ?? internalIsSaved;
  const resolvedIsSavedLoading = isSavedLoading ?? internalIsSubmitting;

  function handleSavePress(event: GestureResponderEvent) {
    event.stopPropagation?.();

    if (onToggleSaved) {
      onToggleSaved();
      return;
    }

    toggleSaved();
  }

  return (
    <S.CardButton
      testID="article-card"
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.92}
    >
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
        <S.VisualTopRow>
          <S.CategoryPill>
            <S.CategoryPillText>{categoryLabel}</S.CategoryPillText>
          </S.CategoryPill>
          {showSaveButton ? (
            <S.SaveSlot>
              <SavedArticleButton
                isSaved={resolvedIsSaved}
                isLoading={resolvedIsSavedLoading}
                onPress={handleSavePress}
                size="sm"
                showLabel
              />
            </S.SaveSlot>
          ) : null}
        </S.VisualTopRow>
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
