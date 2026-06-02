import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import { uploadFileUriToPresignedUrl } from '../../../services/api/presignedUpload';
import { buildSingleFileUploadFormData } from '../../../services/api/uploadFormData';
import { buildMultipartFormData } from '../../../services/api/uploadFormData';
import type { ImageUploadFile } from '../../../utils/images/imagePicker';
import {
  toArticleBlock,
  toArticlePayload,
  toArticleDetail,
  toArticleReactionResult,
  toPaginatedArticlesResponse,
  toSavedArticlesResponse,
} from '../mappers/article.mapper';
import type {
  ArticleBlock,
  ArticleBlockImageUploadResponse,
  ArticleDetail,
  ArticleListItem,
  ArticleReactionResult,
  CreateArticleBlockPayload,
  CreateArticlePayload,
  ListArticlesParams,
  PaginatedResponse,
  SavedArticlesResponse,
  UpdateArticleBlockPayload,
  UpdateArticleBlockImagePayload,
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
    const response = await apiClient.get(
      API_ENDPOINTS.articles.detail(articleId),
    );

    return toArticleDetail(response.data);
  },

  async getAdminArticleById(articleId: string): Promise<ArticleDetail> {
    const response = await apiClient.get(
      API_ENDPOINTS.articles.adminDetail(articleId),
    );

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

  async createArticleBlock(
    articleId: string,
    payload: CreateArticleBlockPayload,
  ): Promise<ArticleBlock> {
    const response = await apiClient.post(
      API_ENDPOINTS.articles.blocks(articleId),
      {
        kind: payload.kind,
        title: payload.title ?? '',
        body: payload.body ?? '',
        items: payload.items ?? [],
        sortOrder: payload.sortOrder ?? 0,
      },
    );

    return toArticleBlock(response.data);
  },

  async updateArticleBlock(
    articleId: string,
    blockId: string,
    payload: UpdateArticleBlockPayload,
  ): Promise<ArticleBlock> {
    const response = await apiClient.patch(
      API_ENDPOINTS.articles.blockDetail(articleId, blockId),
      {
        ...(payload.kind ? { kind: payload.kind } : {}),
        ...(payload.title !== undefined ? { title: payload.title } : {}),
        ...(payload.body !== undefined ? { body: payload.body } : {}),
        ...(payload.items !== undefined ? { items: payload.items } : {}),
        ...(payload.sortOrder !== undefined
          ? { sortOrder: payload.sortOrder }
          : {}),
      },
    );

    return toArticleBlock(response.data);
  },

  async deleteArticleBlock(articleId: string, blockId: string): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.articles.blockDetail(articleId, blockId),
    );
  },

  async createArticleBlockImageUpload(params: {
    articleId: string;
    blockId: string;
    fileName: string;
    contentType: string;
    fileSize: number;
  }): Promise<ArticleBlockImageUploadResponse> {
    const response = await apiClient.post(
      API_ENDPOINTS.articles.blockImageUpload(params.articleId, params.blockId),
      {
        fileName: params.fileName,
        contentType: params.contentType,
        fileSize: params.fileSize,
      },
    );

    return {
      uploadUrl: response.data.uploadUrl,
      imageUrl:
        typeof response.data.imageUrl === 'string'
          ? response.data.imageUrl
          : typeof response.data.url === 'string'
          ? response.data.url
          : '',
      key:
        typeof response.data.key === 'string' ? response.data.key : undefined,
    };
  },

  async uploadFileToPresignedUrl(params: {
    uploadUrl: string;
    fileUri: string;
    contentType: string;
  }): Promise<void> {
    await uploadFileUriToPresignedUrl(params);
  },

  async uploadArticleBlockImage(params: {
    articleId: string;
    blockId: string;
    file: ImageUploadFile;
    imageAlt?: string;
    imageCaption?: string;
  }): Promise<ArticleBlock> {
    const response = await apiClient.post(
      API_ENDPOINTS.articles.blockImage(params.articleId, params.blockId),
      buildMultipartFormData({
        fileFieldName: 'image',
        file: params.file,
        fallbackFileName: 'article-block-image.jpg',
        fields: {
          imageAlt: params.imageAlt?.trim(),
          imageCaption: params.imageCaption?.trim(),
        },
      }),
    );

    return toArticleBlock(response.data);
  },

  async updateArticleBlockImage(params: {
    articleId: string;
    blockId: string;
    imageUrl: string;
    imageAlt?: string;
    imageCaption?: string;
  }): Promise<ArticleBlock> {
    const payload: UpdateArticleBlockImagePayload = {
      imageUrl: params.imageUrl,
      ...(params.imageAlt?.trim() ? { imageAlt: params.imageAlt.trim() } : {}),
      ...(params.imageCaption?.trim()
        ? { imageCaption: params.imageCaption.trim() }
        : {}),
    };

    const response = await apiClient.patch(
      API_ENDPOINTS.articles.blockImage(params.articleId, params.blockId),
      payload,
    );

    return toArticleBlock(response.data);
  },

  async deleteArticleBlockImage(params: {
    articleId: string;
    blockId: string;
  }): Promise<ArticleBlock> {
    const response = await apiClient.delete(
      API_ENDPOINTS.articles.blockImage(params.articleId, params.blockId),
    );

    return toArticleBlock(response.data);
  },

  async deleteArticle(articleId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.articles.detail(articleId));
  },

  async saveArticle(articleId: string): Promise<{ message: string }> {
    const response = await apiClient.post(
      API_ENDPOINTS.articles.save(articleId),
    );

    return response.data;
  },

  async unsaveArticle(articleId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(
      API_ENDPOINTS.articles.save(articleId),
    );

    return response.data;
  },

  async reactToArticle(
    articleId: string,
    fallbackReactionsCount?: number,
  ): Promise<ArticleReactionResult> {
    const response = await apiClient.post(
      API_ENDPOINTS.articles.reactions(articleId),
    );

    return toArticleReactionResult(response.data, {
      isReacted: true,
      reactionsCount: fallbackReactionsCount,
    });
  },

  async removeArticleReaction(
    articleId: string,
    fallbackReactionsCount?: number,
  ): Promise<ArticleReactionResult> {
    const response = await apiClient.delete(
      API_ENDPOINTS.articles.reactions(articleId),
    );

    return toArticleReactionResult(response.data, {
      isReacted: false,
      reactionsCount: fallbackReactionsCount,
    });
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
