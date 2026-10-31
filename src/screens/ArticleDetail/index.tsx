import React from 'react';
import { ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BackButton,
  CompactProductCard,
  EmptyStateCard,
  SafeScreen,
  ScreenContainer,
  SectionTitle,
  SurfaceCard,
} from '../../components';
import { useArticleById } from '../../features/articles/hooks/useArticleById';
import { useTheme } from '../../hooks/useTheme';
import { AppStackParamList } from '../../types/navigation';
import { ArticleCommentsSection } from './components/ArticleCommentsSection';
import { ArticleContent } from './components/ArticleContent';
import { ArticleHeader } from './components/ArticleHeader';
import { CommentControlButton } from './components/CommentControlButton';
import * as S from './styles';

type ArticleDetailScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'ArticleDetail'
>;

export function ArticleDetailScreen({
  navigation,
  route,
}: ArticleDetailScreenProps) {
  const { theme } = useTheme();
  const articleId = route.params?.articleId;
  const { article, isLoading, isNotFound, retry } = useArticleById({
    articleId,
  });
  const relatedProducts = article?.relatedProducts ?? [];

  function handleGoBack() {
    navigation.goBack();
  }

  function openUserProfile(userId: string) {
    navigation.navigate('UserProfile', { userId });
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
              <CommentControlButton
                label={isNotFound ? 'Voltar' : 'Tentar novamente'}
                onPress={isNotFound ? handleGoBack : () => retry()}
              />
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

          <ArticleHeader
            article={article}
            onOpenAuthorProfile={openUserProfile}
          />
          <ArticleContent article={article} />

          {article.tags.length > 0 ? (
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
                        onPress={() =>
                          navigation.navigate('ProductDetail', {
                            productId: product.id,
                          })
                        }
                      />
                    </S.RelatedCardShell>
                  ))}
                </S.RelatedScroll>
              </S.RelatedSectionCard>
            </SurfaceCard>
          ) : null}

          <ArticleCommentsSection
            articleId={article.id}
            commentsCount={article.commentsCount}
            onOpenProfile={openUserProfile}
          />
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
