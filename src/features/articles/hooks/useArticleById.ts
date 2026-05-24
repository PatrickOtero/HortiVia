import { useCallback, useEffect, useRef, useState } from 'react';
import { toApiError } from '../../../services/api/apiError';
import { articlesService } from '../services/articles.service';
import type { ArticleDetail } from '../types/article';

type UseArticleByIdOptions = {
  articleId?: string;
};

export function useArticleById({ articleId }: UseArticleByIdOptions) {
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const requestIdRef = useRef(0);

  const loadArticle = useCallback(async () => {
    if (!articleId) {
      setArticle(null);
      setIsNotFound(true);
      setErrorMessage('Artigo não encontrado.');
      setIsLoading(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setErrorMessage(null);
    setIsNotFound(false);

    try {
      const nextArticle = await articlesService.getArticleById(articleId);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setArticle(nextArticle);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      const apiError = toApiError(error);
      const missingArticle = apiError.status === 404;

      setArticle(null);
      setIsNotFound(missingArticle);
      setErrorMessage(
        missingArticle
          ? 'Artigo não encontrado.'
          : 'Não foi possível carregar este artigo.',
      );
    } finally {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  function retry() {
    loadArticle();
  }

  return {
    article,
    isLoading,
    isNotFound,
    errorMessage,
    retry,
  };
}
