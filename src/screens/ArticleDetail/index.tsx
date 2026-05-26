import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, type GestureResponderEvent } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
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
import { useToggleArticleSaved } from '../../features/articles/hooks/useToggleArticleSaved';
import { useArticleById } from '../../features/articles/hooks/useArticleById';
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

function getContentParagraphs(content: string, summary: string) {
  const normalizedContent = content
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean);

  if (normalizedContent.length > 0) {
    return normalizedContent;
  }

  return summary ? [summary] : [];
}

function getFallbackBadge(article: ArticleDetail) {
  const source = article.title.trim() || article.author.name.trim() || 'H';

  return source.charAt(0).toUpperCase();
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

  useEffect(() => {
    setHasImageError(false);
  }, [article?.imageUrl]);

  const categoryLabel = article
    ? getArticleCategoryLabel(article.category)
    : undefined;
  const publishedDate = formatPublishedDate(article?.publishedAt);
  const readingLabel = getReadingLabel(article?.readingTimeMinutes);
  const relatedProducts = article?.relatedProducts ?? [];
  const {
    isSaved,
    isSubmitting,
    toggleSaved,
  } = useToggleArticleSaved({
    article:
      article ?? {
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
  const contentParagraphs = useMemo(() => {
    if (!article) {
      return [];
    }

    return getContentParagraphs(article.content, article.summary);
  }, [article]);
  const shouldShowImage = Boolean(article?.imageUrl) && !hasImageError;

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
                  ? 'Esta leitura não está disponível.'
                  : 'Não foi possível carregar este artigo.'
              }
              description={isNotFound ? 'Volte e escolha outra leitura.' : 'Tente novamente em instantes.'}
            >
              {isNotFound ? (
                <PrimaryButton onPress={handleGoBack}>Voltar</PrimaryButton>
              ) : (
                <PrimaryButton onPress={handleRetry}>Tentar novamente</PrimaryButton>
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

          <S.HeroCard $category={article.category}>
            {shouldShowImage ? (
              <>
                <S.HeroImage
                  source={{ uri: article.imageUrl ?? undefined }}
                  onError={() => setHasImageError(true)}
                />
                <S.HeroOverlay />
              </>
            ) : null}

            <S.MetaTopRow>
              <S.CategoryPill>
                <S.CategoryPillText>{categoryLabel}</S.CategoryPillText>
              </S.CategoryPill>

              <S.MetaTopRight>
                <SavedArticleButton
                  isSaved={isSaved}
                  isLoading={isSubmitting}
                  onPress={handleToggleSaved}
                  size="md"
                  showLabel
                />
                {!shouldShowImage ? (
                  <S.HeroFallbackBadge>
                    <S.HeroFallbackBadgeText>
                      {getFallbackBadge(article)}
                    </S.HeroFallbackBadgeText>
                  </S.HeroFallbackBadge>
                ) : null}
              </S.MetaTopRight>
            </S.MetaTopRow>

            <S.HeroCopy>
              <S.HeroTitle>{article.title}</S.HeroTitle>
              <S.HeroSummary>{article.summary}</S.HeroSummary>
            </S.HeroCopy>
          </S.HeroCard>

          <SurfaceCard>
            <S.MetaCard>
              <S.AuthorRow>
                <Avatar label={article.author.name} size={40} />
                <S.AuthorCopy>
                  <S.AuthorName>{article.author.name}</S.AuthorName>
                    <S.AuthorLabel>Leitura</S.AuthorLabel>
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
            </S.MetaCard>
          </SurfaceCard>

          <SurfaceCard>
            <S.ContentCard>
              <SectionTitle
                title="Texto completo"
                subtitle="Dicas e orientações para o dia a dia."
              />
              {contentParagraphs.map(paragraph => (
                <S.Paragraph key={paragraph}>{paragraph}</S.Paragraph>
              ))}
            </S.ContentCard>
          </SurfaceCard>

          {article.tags.length ? (
            <SurfaceCard>
              <S.ContentCard>
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
              </S.ContentCard>
            </SurfaceCard>
          ) : null}

          {relatedProducts.length > 0 ? (
            <SurfaceCard>
              <S.RelatedSectionCard>
                <SectionTitle
                  title="Produtos relacionados"
                  subtitle="Alimentos citados ou conectados a este conteúdo."
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
