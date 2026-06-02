import React, { useEffect, useState } from 'react';
import { Alert, type GestureResponderEvent } from 'react-native';
import { ArticleReactionButton } from '../ArticleReactionButton';
import { Avatar } from '../Avatar';
import { SavedArticleButton } from '../SavedArticleButton';
import { getArticleCategoryLabel } from '../../features/articles/mappers/article.mapper';
import { useArticleReaction } from '../../features/articles/hooks/useArticleReaction';
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

  return `${String(date.getDate()).padStart(2, '0')} ${
    monthLabels[date.getMonth()]
  }`;
}

function getReadingLabel(readingTimeMinutes?: number) {
  if (!readingTimeMinutes) {
    return undefined;
  }

  return `${readingTimeMinutes} min`;
}

function getArticlePreviewImageUrl(article: ArticleListItem) {
  return article.coverImageUrl ?? article.imageUrl;
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
  const {
    isReacted,
    reactionsCount,
    isLoading: isReactionLoading,
    toggleReaction,
  } = useArticleReaction({
    article,
    onError: message => {
      Alert.alert('Útil', message);
    },
    onRequireAuth: () => {
      Alert.alert('Útil', 'Entre para marcar artigos como úteis.');
    },
  });
  const previewImageUrl = getArticlePreviewImageUrl(article);

  useEffect(() => {
    setHasImageError(false);
  }, [previewImageUrl]);

  const categoryLabel = getArticleCategoryLabel(article.category);
  const publishedDate = formatPublishedDate(article.publishedAt);
  const readingLabel = getReadingLabel(article.readingTimeMinutes);
  const shouldShowImage = Boolean(previewImageUrl) && !hasImageError;
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

  function handleReactionPress(event: GestureResponderEvent) {
    event.stopPropagation?.();
    Promise.resolve(toggleReaction()).catch(() => undefined);
  }

  return (
    <S.CardButton
      testID="article-card"
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.94}
    >
      <S.ImageFrame>
        {shouldShowImage ? (
          <S.ArticleImage
            source={{ uri: previewImageUrl ?? undefined }}
            onError={() => setHasImageError(true)}
          />
        ) : (
          <S.ImageFallback>
            <S.ImageFallbackBadge>
              <S.ImageFallbackBadgeText>HortiVia</S.ImageFallbackBadgeText>
            </S.ImageFallbackBadge>
            <S.ImageFallbackText>Leitura HortiVia</S.ImageFallbackText>
          </S.ImageFallback>
        )}

        <S.MediaActionsRow>
          <S.CategoryPill>
            <S.CategoryPillText>{categoryLabel}</S.CategoryPillText>
          </S.CategoryPill>
          {showSaveButton ? (
            <SavedArticleButton
              isSaved={resolvedIsSaved}
              isLoading={resolvedIsSavedLoading}
              onPress={handleSavePress}
              size="sm"
              showLabel={false}
            />
          ) : null}
        </S.MediaActionsRow>
      </S.ImageFrame>

      <S.Content>
        <S.Title numberOfLines={2} ellipsizeMode="tail">
          {article.title}
        </S.Title>
        <S.Summary numberOfLines={3} ellipsizeMode="tail">
          {article.summary}
        </S.Summary>

        <S.FooterRow>
          <S.AuthorRow>
            <Avatar label={article.author.name} size={34} />
            <S.AuthorCopy>
              <S.AuthorName numberOfLines={1}>
                {article.author.name}
              </S.AuthorName>
              <S.AuthorRole>Leitura educativa</S.AuthorRole>
            </S.AuthorCopy>
          </S.AuthorRow>

          <S.FooterActions>
            <ArticleReactionButton
              testID="article-reaction-button"
              isActive={isReacted}
              count={reactionsCount}
              isLoading={isReactionLoading}
              onPress={handleReactionPress}
              size="sm"
              showLabel={false}
            />
            {publishedDate ? (
              <S.MetaChip>
                <S.MetaChipText>{publishedDate}</S.MetaChipText>
              </S.MetaChip>
            ) : null}
            {readingLabel ? (
              <S.MetaChip>
                <S.MetaChipText>{readingLabel}</S.MetaChipText>
              </S.MetaChip>
            ) : null}
          </S.FooterActions>
        </S.FooterRow>
      </S.Content>
    </S.CardButton>
  );
}
