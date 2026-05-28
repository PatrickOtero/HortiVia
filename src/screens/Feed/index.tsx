import React, { useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArticleCard,
  EmptyStateCard,
  FilterChip,
  PageHeader,
  PrimaryButton,
  SafeScreen,
  SectionTitle,
  SurfaceCard,
} from '../../components';
import { useArticles } from '../../features/articles/hooks/useArticles';
import { useSavedArticles } from '../../features/articles/hooks/useSavedArticles';
import type { ArticleCategoryFilter } from '../../features/articles/types/article';
import { useTheme } from '../../hooks/useTheme';
import { AppStackParamList, AppTabParamList } from '../../types/navigation';
import * as S from './styles';

type FeedScreenProps = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Feed'>,
  NativeStackScreenProps<AppStackParamList>
>;

function ListItemSeparator() {
  return <S.ListSpacer />;
}

export function FeedScreen({ navigation }: FeedScreenProps) {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<ArticleCategoryFilter>('ALL');
  const {
    articles,
    categories,
    canOpenArticle,
    isLoading,
    isRefreshing,
    isError,
    isEmpty,
    meta,
    retry,
    refresh,
  } = useArticles({
    activeCategory,
  });
  const {
    isArticleSaved,
    isArticleSaveLoading,
    toggleSavedArticle,
  } = useSavedArticles();

  function handleOpenArticle(articleId: string) {
    if (!canOpenArticle || articleId.length === 0) {
      return;
    }

    navigation.navigate('ArticleDetail', { articleId });
  }

  function handleRetry() {
    retry();
  }

  function renderListEmptyState() {
    if (isLoading) {
      return (
        <SurfaceCard>
          <S.StatusContent>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <SectionTitle
              title="Carregando leituras"
              subtitle="Aguarde um instante."
            />
          </S.StatusContent>
        </SurfaceCard>
      );
    }

    if (isError) {
      return (
        <EmptyStateCard
          title="Não foi possível carregar os artigos."
          description="Tente novamente em instantes."
        >
          <PrimaryButton onPress={handleRetry}>Tentar novamente</PrimaryButton>
        </EmptyStateCard>
      );
    }

    if (isEmpty) {
      return (
        <EmptyStateCard
          title="Ainda não há artigos por aqui."
          description="Volte mais tarde para ver novos conteúdos."
        />
      );
    }

    return null;
  }

  const totalArticles = meta.total;
  const articlesSubtitle = isLoading && articles.length === 0
    ? 'Separando leituras para você.'
    : totalArticles === 1
      ? '1 artigo encontrado.'
      : `${totalArticles} artigos encontrados.`;

  return (
    <SafeScreen>
      <FlatList
        data={articles}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            showSaveButton
            isSaved={isArticleSaved(item)}
            isSavedLoading={isArticleSaveLoading(item.id)}
            onToggleSaved={() => {
              toggleSavedArticle(item).catch(() => undefined);
            }}
            onPress={canOpenArticle ? () => handleOpenArticle(item.id) : undefined}
          />
        )}
        refreshing={isRefreshing}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.layout.screenPadding,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.layout.tabContentBottomPadding + theme.spacing.md,
        }}
        ItemSeparatorComponent={ListItemSeparator}
        ListHeaderComponent={
          <S.HeaderContent>
            <S.IntroPanel>
              <PageHeader
                eyebrow="Leituras"
                title="Artigos e dicas"
                subtitle="Aprenda formas simples de escolher, conservar e aproveitar melhor os alimentos."
              />
            </S.IntroPanel>

            <S.SectionBlock>
              <SectionTitle
                title="Categorias"
                subtitle="Escolha um tema para começar."
              />
              <S.ChipRow>
                {categories.map(category => (
                  <FilterChip
                    key={category.value}
                    label={category.label}
                    onPress={() => setActiveCategory(category.value)}
                    active={activeCategory === category.value}
                  />
                ))}
              </S.ChipRow>
            </S.SectionBlock>

            <S.SectionBlock>
              <SectionTitle
                title="Leituras"
                subtitle={articlesSubtitle}
              />
            </S.SectionBlock>
          </S.HeaderContent>
        }
        ListEmptyComponent={renderListEmptyState()}
      />
    </SafeScreen>
  );
}
