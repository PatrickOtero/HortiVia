import { useCallback, useEffect, useMemo } from 'react';
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

const REACTION_ERROR_MESSAGE = 'Não foi possível atualizar esta marcação.';

export function useArticleReaction({
  article,
  onRequireAuth,
  onError,
}: UseArticleReactionOptions) {
  const auth = useOptionalAuth();
  const articleReactions = useOptionalArticleReactions();
  const syncArticleReactions = articleReactions?.syncArticleReactions;
  const articleReactionCandidate = useMemo(
    () => ({
      id: article.id,
      isReacted: article.isReacted,
      reactionsCount: article.reactionsCount,
    }),
    [article.id, article.isReacted, article.reactionsCount],
  );

  useEffect(() => {
    syncArticleReactions?.({
      id: article.id,
      isReacted: article.isReacted,
      reactionsCount: article.reactionsCount,
    });
  }, [
    article.id,
    article.isReacted,
    article.reactionsCount,
    syncArticleReactions,
  ]);

  const reactionState = useMemo(
    () =>
      articleReactions?.getArticleReactionState(articleReactionCandidate) ?? {
        isReacted: articleReactionCandidate.isReacted === true,
        reactionsCount: Math.max(
          articleReactionCandidate.reactionsCount ?? 0,
          0,
        ),
      },
    [articleReactionCandidate, articleReactions],
  );
  const isLoading =
    articleReactions?.isArticleReactionLoading(articleReactionCandidate.id) ??
    false;

  const toggleReaction = useCallback(async () => {
    if (isLoading) {
      return reactionState;
    }

    if (!auth?.isAuthenticated) {
      onRequireAuth?.();
      return reactionState;
    }

    if (!articleReactions) {
      onError?.(REACTION_ERROR_MESSAGE);
      return reactionState;
    }

    try {
      return await articleReactions.toggleArticleReaction(
        articleReactionCandidate,
      );
    } catch {
      onError?.(REACTION_ERROR_MESSAGE);
      return reactionState;
    }
  }, [
    articleReactionCandidate,
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
