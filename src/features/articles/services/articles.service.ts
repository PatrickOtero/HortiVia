import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import {
  toArticlePayload,
  toArticleDetail,
  toPaginatedArticlesResponse,
} from '../mappers/article.mapper';
import type {
  ArticleDetail,
  ArticleListItem,
  CreateArticlePayload,
  ListArticlesParams,
  PaginatedResponse,
  UpdateArticlePayload,
} from '../types/article';

export const ARTICLES_PAGE_LIMIT = 20;

export const articlesService = {
  async getArticles(
    params: ListArticlesParams = {},
  ): Promise<PaginatedResponse<ArticleListItem>> {
    const response = await apiClient.get(API_ENDPOINTS.articles.list, {
      params,
    });

    return toPaginatedArticlesResponse(response.data);
  },

  async listArticles(
    params: ListArticlesParams = {},
  ): Promise<PaginatedResponse<ArticleListItem>> {
    return this.getArticles(params);
  },

  async getArticleById(articleId: string): Promise<ArticleDetail> {
    const response = await apiClient.get(API_ENDPOINTS.articles.detail(articleId));

    return toArticleDetail(response.data);
  },

  async createArticle(payload: CreateArticlePayload): Promise<ArticleDetail> {
    const response = await apiClient.post(
      API_ENDPOINTS.articles.list,
      toArticlePayload(payload),
    );

    return toArticleDetail(response.data);
  },

  async updateArticle(
    articleId: string,
    payload: UpdateArticlePayload,
  ): Promise<ArticleDetail> {
    const response = await apiClient.patch(
      API_ENDPOINTS.articles.detail(articleId),
      toArticlePayload({
        ...payload,
        title: payload.title ?? '',
        summary: payload.summary ?? '',
        content: payload.content ?? '',
        category: payload.category ?? 'TIPS',
      }),
    );

    return toArticleDetail(response.data);
  },

  async deleteArticle(articleId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.articles.detail(articleId));
  },
};
