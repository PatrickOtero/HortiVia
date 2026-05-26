import React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArticleCard,
  BackButton,
  EmptyStateCard,
  PageHeader,
  PrimaryButton,
  SafeScreen,
  SectionTitle,
  SurfaceCard,
} from '../../components';
import { useSavedArticles } from '../../features/articles/hooks/useSavedArticles';
import { useTheme } from '../../hooks/useTheme';
import { AppStackParamList } from '../../types/navigation';
import * as S from './styles';

type SavedArticlesScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'SavedArticles'
>;

function ListItemSeparator() {
  return <S.ListSpacer />;
}

export function SavedArticlesScreen({
  navigation,
}: SavedArticlesScreenProps) {
  const { theme } = useTheme();
  const {
    articles,
    meta,
    isLoading,
    isRefreshing,
    isError,
    isEmpty,
    errorMessage,
    refreshSavedArticles,
    retrySavedArticles,
  } = useSavedArticles();

  function handleGoBack() {
    navigation.goBack();
  }

  function handleOpenArticle(articleId: string) {
    navigation.navigate('ArticleDetail', { articleId });
  }

  function handleExploreArticles() {
    navigation.navigate('MainTabs', {
      screen: 'Feed',
    });
  }

  function renderListEmptyState() {
    if (isLoading) {
      return (
        <SurfaceCard>
          <S.StatusContent>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <SectionTitle
              title="Carregando leituras salvas"
              subtitle="Aguarde um instante."
            />
          </S.StatusContent>
        </SurfaceCard>
      );
    }

    if (isError) {
      return (
        <EmptyStateCard
          title={errorMessage ?? 'Não foi possível carregar suas leituras salvas.'}
          description="Tente novamente em instantes."
        >
          <PrimaryButton onPress={retrySavedArticles}>
            Tentar novamente
          </PrimaryButton>
        </EmptyStateCard>
      );
    }

    if (isEmpty) {
      return (
        <EmptyStateCard
          title="Nenhuma leitura salva ainda."
          description="Salve artigos para encontrar conteúdos úteis mais tarde."
        >
          <PrimaryButton onPress={handleExploreArticles}>
            Explorar artigos
          </PrimaryButton>
        </EmptyStateCard>
      );
    }

    return null;
  }

  const totalSavedArticles = meta.total;
  const subtitle =
    isLoading && articles.length === 0
      ? 'Separando seus conteúdos salvos.'
      : totalSavedArticles === 1
        ? '1 leitura salva.'
        : `${totalSavedArticles} leituras salvas.`;

  return (
    <SafeScreen>
      <FlatList
        data={articles}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            showSaveButton
            onPress={() => handleOpenArticle(item.id)}
          />
        )}
        refreshing={isRefreshing}
        onRefresh={refreshSavedArticles}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.layout.screenPadding,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.layout.tabContentBottomPadding,
        }}
        ItemSeparatorComponent={ListItemSeparator}
        ListHeaderComponent={
          <S.HeaderContent>
            <BackButton onPress={handleGoBack} />
            <PageHeader
              eyebrow="Leituras salvas"
              title="Conteúdos para revisitar"
              subtitle={subtitle}
            />
          </S.HeaderContent>
        }
        ListEmptyComponent={renderListEmptyState()}
      />
    </SafeScreen>
  );
}
