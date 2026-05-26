import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import { buildSingleFileUploadFormData } from '../../../services/api/uploadFormData';
import type { ImageUploadFile } from '../../../utils/images/imagePicker';
import {
  toArticlePayload,
  toArticleDetail,
  toPaginatedArticlesResponse,
  toSavedArticlesResponse,
} from '../mappers/article.mapper';
import type {
  ArticleDetail,
  ArticleListItem,
  CreateArticlePayload,
  ListArticlesParams,
  PaginatedResponse,
  SavedArticlesResponse,
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

  async uploadArticleImage(
    articleId: string,
    file: ImageUploadFile,
  ): Promise<ArticleDetail> {
    const response = await apiClient.post(
      API_ENDPOINTS.articles.image(articleId),
      buildSingleFileUploadFormData('image', file, 'article-image.jpg'),
    );

    return toArticleDetail(response.data);
  },

  async deleteArticle(articleId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.articles.detail(articleId));
  },

  async saveArticle(articleId: string): Promise<{ message: string }> {
    const response = await apiClient.post(API_ENDPOINTS.articles.save(articleId));

    return response.data;
  },

  async unsaveArticle(articleId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(API_ENDPOINTS.articles.save(articleId));

    return response.data;
  },

  async listSavedArticles(params?: {
    page?: number;
    limit?: number;
  }): Promise<SavedArticlesResponse> {
    const response = await apiClient.get(API_ENDPOINTS.saved.articles, {
      params,
    });

    return toSavedArticlesResponse(response.data);
  },
};
