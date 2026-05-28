import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  type GestureResponderEvent,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArticleBlockRenderer,
  ArticleReactionButton,
  Avatar,
  BackButton,
  CompactProductCard,
  EmptyStateCard,
  PrimaryButton,
  SafeScreen,
  SavedArticleButton,
  ScreenContainer,
  SectionTitle,
  SurfaceCard,
} from '../../components';
import { getArticleCategoryLabel } from '../../features/articles/mappers/article.mapper';
import { useArticleReaction } from '../../features/articles/hooks/useArticleReaction';
import { useArticleById } from '../../features/articles/hooks/useArticleById';
import { useToggleArticleSaved } from '../../features/articles/hooks/useToggleArticleSaved';
import { getArticleContentParagraphs } from '../../features/articles/utils/articleBlocks';
import type { ArticleDetail } from '../../features/articles/types/article';
import { useTheme } from '../../hooks/useTheme';
import { AppStackParamList } from '../../types/navigation';
import * as S from './styles';

type ArticleDetailScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'ArticleDetail'
>;

function formatPublishedDate(dateValue?: string) {
  if (!dateValue) {
    return undefined;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getReadingLabel(readingTimeMinutes?: number) {
  if (!readingTimeMinutes) {
    return undefined;
  }

  return `${readingTimeMinutes} min de leitura`;
}

function getFallbackBadge(article: ArticleDetail) {
  const source = article.title.trim() || article.author.name.trim() || 'H';

  return source.charAt(0).toUpperCase();
}

function getUsefulSummary(reactionsCount: number) {
  if (reactionsCount <= 0) {
    return 'Se este conteúdo ajudou, você pode marcar como útil.';
  }

  if (reactionsCount === 1) {
    return '1 pessoa achou útil.';
  }

  return `${reactionsCount} pessoas acharam útil.`;
}

export function ArticleDetailScreen({
  navigation,
  route,
}: ArticleDetailScreenProps) {
  const { theme } = useTheme();
  const articleId = route.params?.articleId;
  const { article, isLoading, isNotFound, retry } = useArticleById({
    articleId,
  });
  const [hasImageError, setHasImageError] = useState(false);
  const coverImageUrl = article?.coverImageUrl ?? article?.imageUrl ?? null;

  useEffect(() => {
    setHasImageError(false);
  }, [coverImageUrl]);

  const categoryLabel = article
    ? getArticleCategoryLabel(article.category)
    : undefined;
  const publishedDate = formatPublishedDate(article?.publishedAt);
  const readingLabel = getReadingLabel(article?.readingTimeMinutes);
  const relatedProducts = article?.relatedProducts ?? [];
  const { isSaved, isSubmitting, toggleSaved } = useToggleArticleSaved({
    article: article ?? {
      id: articleId ?? '',
      title: '',
      slug: '',
      summary: '',
      category: 'TIPS',
      imageUrl: null,
      tags: [],
      author: {
        id: '',
        name: '',
        avatarUrl: null,
      },
    },
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
    article: article ?? {
      id: articleId ?? '',
      isReacted: false,
      reactionsCount: 0,
    },
    onError: message => {
      Alert.alert('Útil', message);
    },
    onRequireAuth: () => {
      Alert.alert('Útil', 'Entre para marcar artigos como úteis.');
    },
  });
  const contentParagraphs = useMemo(() => {
    if (!article) {
      return [];
    }

    return getArticleContentParagraphs(article.content, article.summary);
  }, [article]);
  const shouldShowImage = Boolean(coverImageUrl) && !hasImageError;
  const hasBlocks = (article?.blocks?.length ?? 0) > 0;

  function handleGoBack() {
    navigation.goBack();
  }

  function handleRetry() {
    retry();
  }

  function handleOpenRelatedProduct(productId: string) {
    navigation.navigate('ProductDetail', { productId });
  }

  function handleToggleSaved(event: GestureResponderEvent) {
    event.stopPropagation?.();
    toggleSaved().catch(() => undefined);
  }

  function handleToggleReaction() {
    Promise.resolve(toggleReaction()).catch(() => undefined);
  }

  if (isLoading) {
    return (
      <SafeScreen edges={['top', 'left', 'right', 'bottom']}>
        <ScreenContainer scrollable>
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={handleGoBack} />
            </S.HeaderRow>

            <SurfaceCard>
              <S.StatusContent>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <SectionTitle
                  title="Carregando leitura"
                  subtitle="Aguarde um instante."
                />
              </S.StatusContent>
            </SurfaceCard>
          </S.Content>
        </ScreenContainer>
      </SafeScreen>
    );
  }

  if (!article) {
    return (
      <SafeScreen edges={['top', 'left', 'right', 'bottom']}>
        <ScreenContainer scrollable>
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={handleGoBack} />
            </S.HeaderRow>

            <EmptyStateCard
              title={
                isNotFound
                  ? 'Esta leitura nao esta disponivel.'
                  : 'Nao foi possivel carregar o artigo.'
              }
              description={
                isNotFound
                  ? 'Volte e escolha outra leitura.'
                  : 'Tente novamente em instantes.'
              }
            >
              {isNotFound ? (
                <PrimaryButton onPress={handleGoBack}>Voltar</PrimaryButton>
              ) : (
                <PrimaryButton onPress={handleRetry}>
                  Tentar novamente
                </PrimaryButton>
              )}
            </EmptyStateCard>
          </S.Content>
        </ScreenContainer>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen edges={['top', 'left', 'right', 'bottom']}>
      <ScreenContainer scrollable>
        <S.Content>
          <S.HeaderRow>
            <BackButton onPress={handleGoBack} />
          </S.HeaderRow>

          {shouldShowImage ? (
            <S.HeroMedia>
              <S.HeroImage
                source={{ uri: coverImageUrl ?? undefined }}
                accessibilityLabel={
                  article.coverImageAlt ?? article.title ?? 'Capa da leitura'
                }
                onError={() => setHasImageError(true)}
              />
            </S.HeroMedia>
          ) : (
            <S.HeroMedia>
              <S.HeroFallback>
                <S.HeroFallbackBadge>
                  <S.HeroFallbackBadgeText>
                    {getFallbackBadge(article)}
                  </S.HeroFallbackBadgeText>
                </S.HeroFallbackBadge>
                <S.HeroFallbackText>Leitura HortiVia</S.HeroFallbackText>
              </S.HeroFallback>
            </S.HeroMedia>
          )}

          <SurfaceCard>
            <S.IntroCard>
              <S.IntroTopRow>
                <S.CategoryPill>
                  <S.CategoryPillText>{categoryLabel}</S.CategoryPillText>
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
                <S.Title>{article.title}</S.Title>
                {article.subtitle ? (
                  <S.Subtitle>{article.subtitle}</S.Subtitle>
                ) : null}
                <S.Summary>{article.summary}</S.Summary>
              </S.IntroCopy>

              <S.UtilityRow>
                <S.UtilityCopy>
                  <S.UtilityTitle>Este artigo foi útil?</S.UtilityTitle>
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
                <S.AuthorRow>
                  <Avatar label={article.author.name} size={40} />
                  <S.AuthorCopy>
                    <S.AuthorName numberOfLines={1} ellipsizeMode="tail">
                      {article.author.name}
                    </S.AuthorName>
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

          <S.BodySection>
            {hasBlocks ? (
              <S.BlocksList>
                {article.blocks.map(block => (
                  <ArticleBlockRenderer key={block.id} block={block} />
                ))}
              </S.BlocksList>
            ) : (
              <S.BlocksList>
                {contentParagraphs.map(paragraph => (
                  <S.Paragraph key={paragraph}>{paragraph}</S.Paragraph>
                ))}
              </S.BlocksList>
            )}
          </S.BodySection>

          {article.tags.length ? (
            <SurfaceCard>
              <S.TagsCard>
                <SectionTitle
                  title="Temas relacionados"
                  subtitle="Assuntos desta leitura."
                />
                <S.TagsRow>
                  {article.tags.map(tag => (
                    <S.TagChip key={tag}>
                      <S.TagText>{tag}</S.TagText>
                    </S.TagChip>
                  ))}
                </S.TagsRow>
              </S.TagsCard>
            </SurfaceCard>
          ) : null}

          {relatedProducts.length > 0 ? (
            <SurfaceCard>
              <S.RelatedSectionCard>
                <SectionTitle
                  title="Produtos relacionados"
                  subtitle="Alimentos ligados a este conteudo."
                />
                <S.RelatedScroll
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingRight: theme.layout.screenPadding,
                  }}
                >
                  {relatedProducts.map(product => (
                    <S.RelatedCardShell key={product.id}>
                      <CompactProductCard
                        product={product}
                        onPress={() => handleOpenRelatedProduct(product.id)}
                      />
                    </S.RelatedCardShell>
                  ))}
                </S.RelatedScroll>
              </S.RelatedSectionCard>
            </SurfaceCard>
          ) : null}
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
