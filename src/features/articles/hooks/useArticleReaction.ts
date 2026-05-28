import { useCallback, useEffect } from 'react';
import { useOptionalAuth } from '../../auth/context/AuthContext';
import { useOptionalArticleReactions } from '../context/ArticleReactionsContext';
import type {
  ArticleDetail,
  ArticleListItem,
  SavedArticle,
} from '../types/article';

type ArticleReactionCandidate = Pick<
  ArticleListItem | ArticleDetail | SavedArticle,
  'id' | 'isReacted' | 'reactionsCount'
>;

type UseArticleReactionOptions = {
  article: ArticleReactionCandidate;
  onRequireAuth?: () => void;
  onError?: (message: string) => void;
};

export function useArticleReaction({
  article,
  onRequireAuth,
  onError,
}: UseArticleReactionOptions) {
  const auth = useOptionalAuth();
  const articleReactions = useOptionalArticleReactions();

  useEffect(() => {
    articleReactions?.syncArticleReactions(article);
  }, [article.id, article.isReacted, article.reactionsCount, articleReactions]);

  const reactionState = articleReactions?.getArticleReactionState(article) ?? {
    isReacted: article.isReacted === true,
    reactionsCount: Math.max(article.reactionsCount ?? 0, 0),
  };
  const isLoading =
    articleReactions?.isArticleReactionLoading(article.id) ?? false;

  const toggleReaction = useCallback(async () => {
    if (isLoading) {
      return reactionState;
    }

    if (!auth?.isAuthenticated) {
      onRequireAuth?.();
      return reactionState;
    }

    if (!articleReactions) {
      onError?.('Não foi possível atualizar esta marcação.');
      return reactionState;
    }

    try {
      return await articleReactions.toggleArticleReaction(article);
    } catch {
      onError?.('Não foi possível atualizar esta marcação.');
      return reactionState;
    }
  }, [
    article,
    articleReactions,
    auth?.isAuthenticated,
    isLoading,
    onError,
    onRequireAuth,
    reactionState,
  ]);

  return {
    isReacted: reactionState.isReacted,
    reactionsCount: reactionState.reactionsCount,
    isLoading,
    toggleReaction,
  };
}
