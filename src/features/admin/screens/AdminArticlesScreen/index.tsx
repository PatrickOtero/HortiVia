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
import { toApiError } from '../../../../services/api/apiError';
import { AppStackParamList } from '../../../../types/navigation';
import { useTheme } from '../../../../hooks/useTheme';
import { articlesService } from '../../../articles/services/articles.service';
import type { ArticleListItem } from '../../../articles/types/article';
import { getArticleCategoryLabel } from '../../../articles/mappers/article.mapper';
import { useAuth } from '../../../auth/hooks/useAuth';
import { AdminAccessDenied } from '../../components/AdminAccessDenied';
import { AdminListItem } from '../../components/AdminListItem';
import { formatPublishedDate } from '../../utils/adminContent';
import {
  ADMIN_REMOVE_ERROR_MESSAGE,
  ADMIN_RETRY_MESSAGE,
  isAdminAccessDeniedError,
} from '../../utils/adminFeedback';
import { goBackFromAdmin } from '../../utils/adminNavigation';
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
  const [hasAccessDeniedError, setHasAccessDeniedError] = useState(false);

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
      setHasAccessDeniedError(false);
    } catch (error) {
      if (isAdminAccessDeniedError(error)) {
        setHasAccessDeniedError(true);
        setErrorMessage('');
        return;
      }

      toApiError(error);
      setErrorMessage('Não foi possível carregar os artigos.');
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

  if (user?.role !== 'ADMIN' || hasAccessDeniedError) {
    return <AdminAccessDenied onGoBack={() => goBackFromAdmin(navigation)} />;
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
      'Ele deixará de aparecer no app.',
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
              setErrorMessage('');
              await loadArticles(true);
            } catch (error) {
              if (isAdminAccessDeniedError(error)) {
                setHasAccessDeniedError(true);
                return;
              }

              setErrorMessage(ADMIN_REMOVE_ERROR_MESSAGE);
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
          title="Não foi possível carregar os artigos."
          description={ADMIN_RETRY_MESSAGE}
        >
          <PrimaryButton onPress={handleRetry}>Tentar novamente</PrimaryButton>
        </EmptyStateCard>
      );
    }

    return (
      <EmptyStateCard
        title="Nenhum artigo cadastrado."
        description="Crie o primeiro artigo para começar."
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
              <BackButton onPress={() => goBackFromAdmin(navigation)} />
              <S.HeaderCopy>
                <S.HeaderTitle>Artigos</S.HeaderTitle>
                <S.HeaderSubtitle>Atualize as leituras exibidas no feed.</S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>

            <SurfaceCard>
              <S.PanelContent>
                <PageHeader
                  eyebrow="Área interna"
                  title="Artigos do app"
                  subtitle="Crie, edite ou remova leituras do feed."
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
            imageUrl={item.imageUrl}
            imageFallbackLabel="Artigo"
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
