import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import {
  toArticleDetail,
  toPaginatedArticlesResponse,
} from '../mappers/article.mapper';
import type {
  ArticleDetail,
  ArticleListItem,
  ListArticlesParams,
  PaginatedResponse,
} from '../types/article';

export const ARTICLES_PAGE_LIMIT = 20;

export const articlesService = {
  async listArticles(
    params: ListArticlesParams = {},
  ): Promise<PaginatedResponse<ArticleListItem>> {
    const response = await apiClient.get(API_ENDPOINTS.articles.list, {
      params,
    });

    return toPaginatedArticlesResponse(response.data);
  },

  async getArticleById(articleId: string): Promise<ArticleDetail> {
    const response = await apiClient.get(API_ENDPOINTS.articles.detail(articleId));

    return toArticleDetail(response.data);
  },
};
