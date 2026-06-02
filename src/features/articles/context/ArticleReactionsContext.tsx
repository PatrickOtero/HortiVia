import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toApiError } from '../../../services/api/apiError';
import { articlesService } from '../services/articles.service';
import type {
  ArticleDetail,
  ArticleListItem,
  SavedArticle,
} from '../types/article';

type ArticleReactionCandidate = Pick<
  ArticleListItem | ArticleDetail | SavedArticle,
  'id' | 'isReacted' | 'reactionsCount'
>;

type ArticleReactionState = {
  isReacted: boolean;
  reactionsCount: number;
};

type ArticleReactionsContextValue = {
  reactionLoadingIds: Set<string>;
  syncArticleReactions: (
    article:
      | ArticleReactionCandidate
      | ArticleReactionCandidate[]
      | null
      | undefined,
  ) => void;
  getArticleReactionState: (
    article: ArticleReactionCandidate,
  ) => ArticleReactionState;
  isArticleReactionLoading: (articleId: string) => boolean;
  toggleArticleReaction: (
    article: ArticleReactionCandidate,
  ) => Promise<ArticleReactionState>;
};

const ArticleReactionsContext = createContext<
  ArticleReactionsContextValue | undefined
>(undefined);

type ArticleReactionsProviderProps = {
  children: ReactNode;
};

function normalizeReactionsCount(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(value, 0);
}

function toReactionState(
  article: ArticleReactionCandidate | null | undefined,
): ArticleReactionState {
  return {
    isReacted: article?.isReacted === true,
    reactionsCount: normalizeReactionsCount(article?.reactionsCount),
  };
}

function hasReactionPayload(
  article: ArticleReactionCandidate | null | undefined,
): article is ArticleReactionCandidate {
  return Boolean(
    article &&
      article.id &&
      (article.isReacted !== undefined || article.reactionsCount !== undefined),
  );
}

export function ArticleReactionsProvider({
  children,
}: ArticleReactionsProviderProps) {
  const [reactionStates, setReactionStates] = useState<
    Record<string, ArticleReactionState>
  >({});
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const reactionStatesRef = useRef(reactionStates);
  const loadingIdsRef = useRef<Set<string>>(new Set());

  const commitReactionStates = useCallback(
    (
      update: (
        currentStates: Record<string, ArticleReactionState>,
      ) => Record<string, ArticleReactionState>,
    ) => {
      const nextStates = update(reactionStatesRef.current);

      if (nextStates === reactionStatesRef.current) {
        return reactionStatesRef.current;
      }

      reactionStatesRef.current = nextStates;
      setReactionStates(nextStates);

      return nextStates;
    },
    [],
  );

  const commitLoadingIds = useCallback(
    (update: (currentIds: Set<string>) => Set<string>) => {
      const nextIds = update(new Set(loadingIdsRef.current));

      loadingIdsRef.current = nextIds;
      setLoadingIds(Array.from(nextIds));

      return nextIds;
    },
    [],
  );

  const setArticleReactionLoading = useCallback(
    (articleId: string, nextIsLoading: boolean) => {
      commitLoadingIds(currentIds => {
        const alreadyLoading = currentIds.has(articleId);

        if (nextIsLoading === alreadyLoading) {
          return currentIds;
        }

        if (nextIsLoading) {
          currentIds.add(articleId);
        } else {
          currentIds.delete(articleId);
        }

        return currentIds;
      });
    },
    [commitLoadingIds],
  );

  const syncArticleReactions = useCallback(
    (
      articleOrArticles:
        | ArticleReactionCandidate
        | ArticleReactionCandidate[]
        | null
        | undefined,
    ) => {
      const nextArticles = Array.isArray(articleOrArticles)
        ? articleOrArticles
        : articleOrArticles
        ? [articleOrArticles]
        : [];

      if (nextArticles.length === 0) {
        return;
      }

      commitReactionStates(currentStates => {
        let hasChanged = false;
        const nextStates = { ...currentStates };

        nextArticles.forEach(article => {
          if (!hasReactionPayload(article)) {
            return;
          }

          if (loadingIdsRef.current.has(article.id)) {
            return;
          }

          const currentState = currentStates[article.id];
          const resolvedState = toReactionState(article);

          if (
            currentState?.isReacted === resolvedState.isReacted &&
            currentState?.reactionsCount === resolvedState.reactionsCount
          ) {
            return;
          }

          nextStates[article.id] = resolvedState;
          hasChanged = true;
        });

        return hasChanged ? nextStates : currentStates;
      });
    },
    [commitReactionStates],
  );

  const getArticleReactionState = useCallback(
    (article: ArticleReactionCandidate) =>
      reactionStates[article.id] ?? toReactionState(article),
    [reactionStates],
  );

  const isArticleReactionLoading = useCallback(
    (articleId: string) => loadingIdsRef.current.has(articleId),
    [],
  );

  const toggleArticleReaction = useCallback(
    async (article: ArticleReactionCandidate) => {
      if (loadingIdsRef.current.has(article.id)) {
        return (
          reactionStatesRef.current[article.id] ?? toReactionState(article)
        );
      }

      const previousState =
        reactionStatesRef.current[article.id] ?? toReactionState(article);
      const nextState = previousState.isReacted
        ? {
            isReacted: false,
            reactionsCount: Math.max(previousState.reactionsCount - 1, 0),
          }
        : {
            isReacted: true,
            reactionsCount: previousState.reactionsCount + 1,
          };

      setArticleReactionLoading(article.id, true);
      commitReactionStates(currentStates => ({
        ...currentStates,
        [article.id]: nextState,
      }));

      try {
        const response = previousState.isReacted
          ? await articlesService.removeArticleReaction(
              article.id,
              nextState.reactionsCount,
            )
          : await articlesService.reactToArticle(
              article.id,
              nextState.reactionsCount,
            );
        const resolvedState = {
          isReacted: response.isReacted,
          reactionsCount: normalizeReactionsCount(response.reactionsCount),
        };

        commitReactionStates(currentStates => ({
          ...currentStates,
          [article.id]: resolvedState,
        }));

        return resolvedState;
      } catch (error) {
        commitReactionStates(currentStates => ({
          ...currentStates,
          [article.id]: previousState,
        }));

        throw toApiError(error);
      } finally {
        setArticleReactionLoading(article.id, false);
      }
    },
    [commitReactionStates, setArticleReactionLoading],
  );

  const value = useMemo<ArticleReactionsContextValue>(
    () => ({
      reactionLoadingIds: new Set(loadingIds),
      syncArticleReactions,
      getArticleReactionState,
      isArticleReactionLoading,
      toggleArticleReaction,
    }),
    [
      getArticleReactionState,
      isArticleReactionLoading,
      loadingIds,
      syncArticleReactions,
      toggleArticleReaction,
    ],
  );

  return (
    <ArticleReactionsContext.Provider value={value}>
      {children}
    </ArticleReactionsContext.Provider>
  );
}

export function useArticleReactions() {
  const context = useContext(ArticleReactionsContext);

  if (!context) {
    throw new Error(
      'useArticleReactions must be used within ArticleReactionsProvider',
    );
  }

  return context;
}

export function useOptionalArticleReactions() {
  return useContext(ArticleReactionsContext);
}
