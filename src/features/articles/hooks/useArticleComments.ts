import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toApiError } from '../../../services/api/apiError';
import {
  ARTICLE_COMMENTS_PAGE_LIMIT,
  articlesService,
} from '../services/articles.service';
import type {
  ArticleComment,
  ModerateArticleCommentInput,
  PaginatedArticleCommentsResponse,
} from '../types/article';

type UseArticleCommentsOptions = {
  articleId?: string;
  limit?: number;
};

const INITIAL_RESPONSE: PaginatedArticleCommentsResponse = {
  items: [],
  page: 1,
  limit: ARTICLE_COMMENTS_PAGE_LIMIT,
  total: 0,
  totalPages: 0,
};

function mergeComments(
  currentComments: ArticleComment[],
  incomingComments: ArticleComment[],
) {
  const nextComments = [...currentComments];
  const seenIds = new Set(currentComments.map(comment => comment.id));

  incomingComments.forEach(comment => {
    if (seenIds.has(comment.id)) {
      const currentIndex = nextComments.findIndex(
        currentComment => currentComment.id === comment.id,
      );

      if (currentIndex >= 0) {
        nextComments[currentIndex] = comment;
      }

      return;
    }

    nextComments.push(comment);
    seenIds.add(comment.id);
  });

  return nextComments;
}

function upsertComment(
  currentComments: ArticleComment[],
  nextComment: ArticleComment,
  options?: {
    prepend?: boolean;
  },
) {
  const currentIndex = currentComments.findIndex(
    comment => comment.id === nextComment.id,
  );

  if (currentIndex < 0) {
    return options?.prepend === false
      ? [...currentComments, nextComment]
      : [nextComment, ...currentComments];
  }

  const nextComments = [...currentComments];
  nextComments[currentIndex] = nextComment;

  return nextComments;
}

function buildNextMeta(
  currentResponse: PaginatedArticleCommentsResponse,
  nextTotal: number,
) {
  const limit = Math.max(currentResponse.limit, 1);

  return {
    ...currentResponse,
    total: Math.max(nextTotal, 0),
    totalPages: nextTotal > 0 ? Math.ceil(nextTotal / limit) : 0,
  };
}

function createLoadingSetUpdater(targetId: string, nextIsLoading: boolean) {
  return (currentIds: string[]) => {
    const nextIds = new Set(currentIds);

    if (nextIsLoading) {
      nextIds.add(targetId);
    } else {
      nextIds.delete(targetId);
    }

    return Array.from(nextIds);
  };
}

export function useArticleComments({
  articleId,
  limit = ARTICLE_COMMENTS_PAGE_LIMIT,
}: UseArticleCommentsOptions) {
  const [response, setResponse] =
    useState<PaginatedArticleCommentsResponse>(INITIAL_RESPONSE);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [moderatingIds, setModeratingIds] = useState<string[]>([]);
  const requestIdRef = useRef(0);

  const loadComments = useCallback(
    async (page: number, append: boolean) => {
      if (!articleId) {
        setResponse({
          ...INITIAL_RESPONSE,
          limit,
        });
        setIsLoading(false);
        setIsLoadingMore(false);
        setHasLoaded(true);
        setErrorMessage('Nao foi possivel carregar os comentarios.');
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setErrorMessage(null);

      if (!append) {
        setHasLoaded(false);
      }

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const nextResponse = await articlesService.listArticleComments(articleId, {
          page,
          limit,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setResponse(currentResponse => ({
          ...nextResponse,
          items: append
            ? mergeComments(currentResponse.items, nextResponse.items)
            : nextResponse.items,
        }));
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        toApiError(error);
        setErrorMessage('Nao foi possivel carregar os comentarios.');

        if (!append) {
          setResponse({
            ...INITIAL_RESPONSE,
            limit,
          });
        }
      } finally {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setIsLoading(false);
        setIsLoadingMore(false);
        setHasLoaded(true);
      }
    },
    [articleId, limit],
  );

  useEffect(() => {
    if (!articleId) {
      setResponse({
        ...INITIAL_RESPONSE,
        limit,
      });
      setIsLoading(false);
      setIsLoadingMore(false);
      setHasLoaded(true);
      setErrorMessage('Nao foi possivel carregar os comentarios.');
      return;
    }

    setResponse({
      ...INITIAL_RESPONSE,
      limit,
    });
    loadComments(1, false);
  }, [articleId, limit, loadComments]);

  const refresh = useCallback(async () => {
    await loadComments(1, false);
  }, [loadComments]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || response.page >= response.totalPages) {
      return;
    }

    await loadComments(response.page + 1, true);
  }, [isLoading, isLoadingMore, loadComments, response.page, response.totalPages]);

  const createComment = useCallback(
    async (body: string) => {
      if (!articleId || isCreating) {
        return null;
      }

      setIsCreating(true);

      try {
        const createdComment = await articlesService.createArticleComment(
          articleId,
          body,
        );

        setResponse(currentResponse => ({
          ...buildNextMeta(currentResponse, currentResponse.total + 1),
          items: upsertComment(currentResponse.items, createdComment),
        }));

        return createdComment;
      } catch (error) {
        throw toApiError(error);
      } finally {
        setIsCreating(false);
      }
    },
    [articleId, isCreating],
  );

  const updateComment = useCallback(
    async (commentId: string, body: string) => {
      if (!articleId || commentId.length === 0) {
        return null;
      }

      setUpdatingIds(createLoadingSetUpdater(commentId, true));

      try {
        const updatedComment = await articlesService.updateArticleComment(
          articleId,
          commentId,
          body,
        );

        setResponse(currentResponse => ({
          ...currentResponse,
          items: upsertComment(currentResponse.items, updatedComment, {
            prepend: false,
          }),
        }));

        return updatedComment;
      } catch (error) {
        throw toApiError(error);
      } finally {
        setUpdatingIds(createLoadingSetUpdater(commentId, false));
      }
    },
    [articleId],
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!articleId || commentId.length === 0) {
        return;
      }

      setDeletingIds(createLoadingSetUpdater(commentId, true));

      try {
        await articlesService.deleteArticleComment(articleId, commentId);

        setResponse(currentResponse => {
          const nextItems = currentResponse.items.filter(
            comment => comment.id !== commentId,
          );
          const hasComment = nextItems.length !== currentResponse.items.length;
          const nextTotal = hasComment
            ? Math.max(currentResponse.total - 1, 0)
            : currentResponse.total;

          return {
            ...buildNextMeta(currentResponse, nextTotal),
            items: nextItems,
          };
        });
      } catch (error) {
        throw toApiError(error);
      } finally {
        setDeletingIds(createLoadingSetUpdater(commentId, false));
      }
    },
    [articleId],
  );

  const moderateComment = useCallback(
    async (
      commentId: string,
      status: ModerateArticleCommentInput['status'],
    ) => {
      if (!articleId || commentId.length === 0) {
        return null;
      }

      setModeratingIds(createLoadingSetUpdater(commentId, true));

      try {
        const updatedComment = await articlesService.moderateArticleComment(
          articleId,
          commentId,
          status,
        );

        setResponse(currentResponse => {
          if (status === 'HIDDEN') {
            const nextItems = currentResponse.items.filter(
              comment => comment.id !== commentId,
            );
            const hasComment = nextItems.length !== currentResponse.items.length;
            const nextTotal = hasComment
              ? Math.max(currentResponse.total - 1, 0)
              : currentResponse.total;

            return {
              ...buildNextMeta(currentResponse, nextTotal),
              items: nextItems,
            };
          }

          const hasExistingComment = currentResponse.items.some(
            comment => comment.id === commentId,
          );
          const nextTotal = hasExistingComment
            ? currentResponse.total
            : currentResponse.total + 1;

          return {
            ...buildNextMeta(currentResponse, nextTotal),
            items: upsertComment(currentResponse.items, updatedComment),
          };
        });

        return updatedComment;
      } catch (error) {
        throw toApiError(error);
      } finally {
        setModeratingIds(createLoadingSetUpdater(commentId, false));
      }
    },
    [articleId],
  );

  const updatingIdSet = useMemo(() => new Set(updatingIds), [updatingIds]);
  const deletingIdSet = useMemo(() => new Set(deletingIds), [deletingIds]);
  const moderatingIdSet = useMemo(() => new Set(moderatingIds), [moderatingIds]);

  return {
    comments: response.items,
    page: response.page,
    limit: response.limit,
    total: response.total,
    totalPages: response.totalPages,
    hasLoaded,
    hasMore: response.page < response.totalPages,
    isLoading,
    isLoadingMore,
    isCreating,
    errorMessage,
    isUpdatingComment: (commentId: string) => updatingIdSet.has(commentId),
    isDeletingComment: (commentId: string) => deletingIdSet.has(commentId),
    isModeratingComment: (commentId: string) => moderatingIdSet.has(commentId),
    refresh,
    loadMore,
    createComment,
    updateComment,
    deleteComment,
    moderateComment,
  };
}
