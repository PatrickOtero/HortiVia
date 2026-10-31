import React, { useEffect, useState } from 'react';
import { Alert, type GestureResponderEvent } from 'react-native';
import {
  ArticleReactionButton,
  Avatar,
  SavedArticleButton,
  SurfaceCard,
  UserBadge,
} from '../../../components';
import { getArticleCategoryLabel } from '../../../features/articles/mappers/article.mapper';
import { useArticleReaction } from '../../../features/articles/hooks/useArticleReaction';
import { useToggleArticleSaved } from '../../../features/articles/hooks/useToggleArticleSaved';
import type { ArticleDetail } from '../../../features/articles/types/article';
import * as S from '../styles';

type ArticleHeaderProps = {
  article: ArticleDetail;
  onOpenAuthorProfile: (userId: string) => void;
};

function formatPublishedDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getUsefulSummary(count: number) {
  if (count <= 0) return 'Se este conteudo ajudou, voce pode marcar como util.';
  if (count === 1) return '1 pessoa achou util.';
  return `${count} pessoas acharam util.`;
}

function getFallbackBadge(article: ArticleDetail) {
  const source = article.title.trim() || article.author.name.trim() || 'H';
  return source.charAt(0).toUpperCase();
}

export function ArticleHeader({
  article,
  onOpenAuthorProfile,
}: ArticleHeaderProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const coverImageUrl = article.coverImageUrl ?? article.imageUrl ?? null;
  const publishedDate = formatPublishedDate(article.publishedAt);
  const readingLabel = article.readingTimeMinutes
    ? `${article.readingTimeMinutes} min de leitura`
    : undefined;

  useEffect(() => setHasImageError(false), [coverImageUrl]);

  const { isSaved, isSubmitting, toggleSaved } = useToggleArticleSaved({
    article,
    onError: message => Alert.alert('Leituras salvas', message),
    onRequireAuth: () =>
      Alert.alert('Leituras salvas', 'Entre para salvar leituras.'),
  });
  const {
    isReacted,
    reactionsCount,
    isLoading: isReactionLoading,
    toggleReaction,
  } = useArticleReaction({
    article,
    onError: message => Alert.alert('Util', message),
    onRequireAuth: () =>
      Alert.alert('Util', 'Entre para marcar artigos como uteis.'),
  });

  function handleToggleSaved(event: GestureResponderEvent) {
    event.stopPropagation?.();
    toggleSaved().catch(() => undefined);
  }

  function handleToggleReaction() {
    Promise.resolve(toggleReaction()).catch(() => undefined);
  }

  return (
    <>
      <S.HeroMedia>
        {coverImageUrl && !hasImageError ? (
          <S.HeroImage
            source={{ uri: coverImageUrl }}
            accessibilityLabel={
              article.coverImageAlt ?? article.title ?? 'Capa da leitura'
            }
            onError={() => setHasImageError(true)}
          />
        ) : (
          <S.HeroFallback>
            <S.HeroFallbackBadge>
              <S.HeroFallbackBadgeText>
                {getFallbackBadge(article)}
              </S.HeroFallbackBadgeText>
            </S.HeroFallbackBadge>
            <S.HeroFallbackText>Leitura HortiVia</S.HeroFallbackText>
          </S.HeroFallback>
        )}
      </S.HeroMedia>

      <SurfaceCard>
        <S.IntroCard>
          <S.IntroTopRow>
            <S.CategoryPill>
              <S.CategoryPillText>
                {getArticleCategoryLabel(article.category)}
              </S.CategoryPillText>
            </S.CategoryPill>
            <SavedArticleButton
              isSaved={isSaved}
              isLoading={isSubmitting}
              onPress={handleToggleSaved}
              size="md"
              showLabel
            />
          </S.IntroTopRow>

          <S.IntroCopy>
            <S.Title accessibilityRole="header">{article.title}</S.Title>
            {article.subtitle ? (
              <S.Subtitle>{article.subtitle}</S.Subtitle>
            ) : null}
            <S.Summary>{article.summary}</S.Summary>
          </S.IntroCopy>

          <S.UtilityRow>
            <S.UtilityCopy>
              <S.UtilityTitle>Este artigo foi util?</S.UtilityTitle>
              <S.UtilityDescription>
                {getUsefulSummary(reactionsCount)}
              </S.UtilityDescription>
            </S.UtilityCopy>
            <ArticleReactionButton
              testID="article-detail-reaction-button"
              isActive={isReacted}
              count={reactionsCount}
              isLoading={isReactionLoading}
              onPress={handleToggleReaction}
              size="md"
            />
          </S.UtilityRow>

          <S.Divider />

          <S.MetaRow>
            <S.AuthorRow
              accessibilityRole="button"
              accessibilityLabel={`Abrir perfil de ${article.author.name}`}
              disabled={!article.author.id}
              onPress={() => onOpenAuthorProfile(article.author.id)}
            >
              <Avatar
                label={article.author.name}
                imageUrl={article.author.avatarUrl}
                size={40}
              />
              <S.AuthorCopy>
                <S.IdentityNameRow>
                  <S.AuthorName numberOfLines={1} ellipsizeMode="tail">
                    {article.author.name}
                  </S.AuthorName>
                  <UserBadge badge={article.author.specialBadge} />
                </S.IdentityNameRow>
                <S.AuthorLabel numberOfLines={1} ellipsizeMode="tail">
                  Leitura educativa
                </S.AuthorLabel>
              </S.AuthorCopy>
            </S.AuthorRow>
            <S.MetaInfoWrap>
              {publishedDate ? (
                <S.MetaInfoChip>
                  <S.MetaInfoText>{publishedDate}</S.MetaInfoText>
                </S.MetaInfoChip>
              ) : null}
              {readingLabel ? (
                <S.MetaInfoChip>
                  <S.MetaInfoText>{readingLabel}</S.MetaInfoText>
                </S.MetaInfoChip>
              ) : null}
            </S.MetaInfoWrap>
          </S.MetaRow>
        </S.IntroCard>
      </SurfaceCard>
    </>
  );
}
