import { useCallback } from 'react';
import { useOptionalAuth } from '../../auth/context/AuthContext';
import { useOptionalSavedArticles } from '../context/SavedArticlesContext';
import type { ArticleDetail, ArticleListItem } from '../types/article';

type ArticleSaveCandidate = ArticleListItem | ArticleDetail;

type UseToggleArticleSavedOptions = {
  article: ArticleSaveCandidate;
  onRequireAuth?: () => void;
  onError?: (message: string) => void;
};

export function useToggleArticleSaved({
  article,
  onRequireAuth,
  onError,
}: UseToggleArticleSavedOptions) {
  const auth = useOptionalAuth();
  const savedArticles = useOptionalSavedArticles();

  const isSaved =
    savedArticles?.isArticleSaved(article) ?? (article.isSaved === true);
  const isSubmitting =
    savedArticles?.isArticleSaveLoading(article.id) ?? false;

  const toggleSaved = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    if (!auth?.isAuthenticated) {
      onRequireAuth?.();
      return;
    }

    if (!savedArticles) {
      onError?.('Não foi possível atualizar esta leitura.');
      return;
    }

    try {
      await savedArticles.toggleSavedArticle(article);
    } catch {
      onError?.('Não foi possível atualizar esta leitura.');
    }
  }, [
    article,
    auth?.isAuthenticated,
    isSubmitting,
    onError,
    onRequireAuth,
    savedArticles,
  ]);

  return {
    isSaved,
    isSubmitting,
    toggleSaved,
  };
}
