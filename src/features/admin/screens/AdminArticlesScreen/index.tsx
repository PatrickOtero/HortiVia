import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BackButton,
  EmptyStateCard,
  PageHeader,
  PrimaryButton,
  SafeScreen,
  SectionTitle,
  SurfaceCard,
} from '../../../../components';
import { AppStackParamList } from '../../../../types/navigation';
import { useTheme } from '../../../../hooks/useTheme';
import { articlesService } from '../../../articles/services/articles.service';
import type { ArticleListItem } from '../../../articles/types/article';
import { getArticleCategoryLabel } from '../../../articles/mappers/article.mapper';
import { useAuth } from '../../../auth/hooks/useAuth';
import { AdminAccessDenied } from '../../components/AdminAccessDenied';
import { AdminListItem } from '../../components/AdminListItem';
import { formatPublishedDate } from '../../utils/adminContent';
import * as S from './styles';

type AdminArticlesScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'AdminArticles'
>;

function ListItemSeparator() {
  return <S.ListSpacer />;
}

export function AdminArticlesScreen({ navigation }: AdminArticlesScreenProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadArticles = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await articlesService.getArticles({
        page: 1,
        limit: 20,
      });

      setArticles(response.data);
      setErrorMessage('');
    } catch {
      setErrorMessage('Nao foi possivel carregar os artigos.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadArticles();
    }, [loadArticles]),
  );

  if (user?.role !== 'ADMIN') {
    return <AdminAccessDenied onGoBack={() => navigation.goBack()} />;
  }

  function handleCreateArticle() {
    navigation.navigate('AdminArticleForm', {});
  }

  function handleEditArticle(articleId: string) {
    navigation.navigate('AdminArticleForm', { articleId });
  }

  function handleDeleteArticle(articleId: string) {
    Alert.alert(
      'Remover artigo?',
      'Ele deixara de aparecer para os usuarios.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(articleId);

            try {
              await articlesService.deleteArticle(articleId);
              setFeedbackMessage('Artigo removido.');
              await loadArticles(true);
            } catch {
              setErrorMessage('Nao foi possivel salvar o artigo.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  }

  function handleRetry() {
    loadArticles();
  }

  function renderEmptyState() {
    if (isLoading) {
      return (
        <SurfaceCard>
          <S.StatusContent>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <SectionTitle
              title="Carregando artigos"
              subtitle="Aguarde um instante."
            />
          </S.StatusContent>
        </SurfaceCard>
      );
    }

    if (errorMessage) {
      return (
        <EmptyStateCard
          title="Nao foi possivel carregar os artigos."
          description="Tente novamente."
        >
          <PrimaryButton onPress={handleRetry}>Tentar novamente</PrimaryButton>
        </EmptyStateCard>
      );
    }

    return (
      <EmptyStateCard
        title="Nenhum artigo encontrado."
        description="Crie um artigo para exibir no feed."
      >
        <PrimaryButton onPress={handleCreateArticle}>Novo artigo</PrimaryButton>
      </EmptyStateCard>
    );
  }

  return (
    <SafeScreen>
      <FlatList
        data={articles}
        keyExtractor={item => item.id}
        refreshing={isRefreshing}
        onRefresh={() => loadArticles(true)}
        ItemSeparatorComponent={ListItemSeparator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.layout.screenPadding,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.xl,
        }}
        ListHeaderComponent={
          <S.HeaderContent>
            <S.HeaderRow>
              <BackButton onPress={() => navigation.goBack()} />
              <S.HeaderCopy>
                <S.HeaderTitle>Artigos</S.HeaderTitle>
                <S.HeaderSubtitle>Gerencie os conteudos exibidos no feed.</S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>

            <SurfaceCard>
              <S.PanelContent>
                <PageHeader
                  eyebrow="Administracao"
                  title="Artigos publicados"
                  subtitle="Crie, atualize ou remova leituras para o HortiVia."
                />
                <PrimaryButton onPress={handleCreateArticle}>Novo artigo</PrimaryButton>
                {feedbackMessage ? <S.SuccessText>{feedbackMessage}</S.SuccessText> : null}
                {errorMessage && articles.length > 0 ? (
                  <S.ErrorText>{errorMessage}</S.ErrorText>
                ) : null}
              </S.PanelContent>
            </SurfaceCard>
          </S.HeaderContent>
        }
        renderItem={({ item }) => (
          <AdminListItem
            title={item.title}
            meta={[
              getArticleCategoryLabel(item.category),
              formatPublishedDate(item.publishedAt),
            ]
              .filter(Boolean)
              .join(' | ')}
            subtitle={item.summary}
            onEdit={() => handleEditArticle(item.id)}
            onDelete={() => handleDeleteArticle(item.id)}
            isDeleting={deletingId === item.id}
          />
        )}
        ListEmptyComponent={renderEmptyState()}
      />
    </SafeScreen>
  );
}
