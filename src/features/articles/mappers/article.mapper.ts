import type {
  ArticleAuthor,
  ArticleCategory,
  ArticleCategoryOption,
  CreateArticlePayload,
  ArticleDetail,
  ArticleListItem,
  PaginatedResponse,
  PaginationMeta,
  RelatedProduct,
  SavedArticle,
  SavedArticlesResponse,
} from '../types/article';

type ApiArticleAuthor = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

type ApiArticleListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: ArticleCategory;
  imageUrl?: string | null;
  tags?: unknown;
  publishedAt?: string;
  readingTimeMinutes?: number;
  isSaved?: boolean;
  author: ApiArticleAuthor;
};

type ApiArticleDetail = ApiArticleListItem & {
  content?: string;
  relatedProducts?: unknown;
  createdAt?: string;
  updatedAt?: string;
};

type ApiPaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

type ApiSavedArticlesResponse = {
  items: ApiArticleListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const ARTICLE_CATEGORY_OPTIONS: ArticleCategoryOption[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'TIPS', label: 'Dicas' },
  { value: 'STORAGE', label: 'Conservação' },
  { value: 'SEASONALITY', label: 'Safra' },
  { value: 'RECIPES', label: 'Uso na cozinha' },
  { value: 'WASTE_REDUCTION', label: 'Aproveitamento' },
];

const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  TIPS: 'Dicas',
  STORAGE: 'Conservação',
  SEASONALITY: 'Safra',
  RECIPES: 'Uso na cozinha',
  WASTE_REDUCTION: 'Aproveitamento',
};

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function toArticleAuthor(author: ApiArticleAuthor): ArticleAuthor {
  return {
    id: author.id,
    name: author.name,
    avatarUrl: author.avatarUrl ?? null,
  };
}

function normalizeRelatedProducts(value: unknown): RelatedProduct[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const product = item as {
        id?: unknown;
        name?: unknown;
        slug?: unknown;
        category?: unknown;
        shortDescription?: unknown;
        imageUrl?: unknown;
      };

      if (
        typeof product.id !== 'string' ||
        typeof product.name !== 'string' ||
        typeof product.slug !== 'string' ||
        typeof product.category !== 'string' ||
        typeof product.shortDescription !== 'string'
      ) {
        return null;
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category as RelatedProduct['category'],
        shortDescription: product.shortDescription,
        imageUrl: typeof product.imageUrl === 'string' ? product.imageUrl : null,
      };
    })
    .filter((item): item is RelatedProduct => item !== null);
}

export function getArticleCategoryLabel(category: ArticleCategory) {
  return ARTICLE_CATEGORY_LABELS[category];
}

export function toArticleListItem(article: ApiArticleListItem): ArticleListItem {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    category: article.category,
    imageUrl: article.imageUrl ?? null,
    tags: normalizeTags(article.tags),
    publishedAt: article.publishedAt,
    readingTimeMinutes: article.readingTimeMinutes,
    author: toArticleAuthor(article.author),
    isSaved: article.isSaved ?? false,
  };
}

export function toArticleDetail(article: ApiArticleDetail): ArticleDetail {
  return {
    ...toArticleListItem(article),
    content: article.content ?? '',
    relatedProducts: normalizeRelatedProducts(article.relatedProducts),
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}

export function toPaginatedArticlesResponse(
  response: ApiPaginatedResponse<ApiArticleListItem>,
): PaginatedResponse<ArticleListItem> {
  return {
    data: response.data.map(toArticleListItem),
    meta: response.meta,
  };
}

export function toSavedArticlesResponse(
  response: ApiSavedArticlesResponse,
): SavedArticlesResponse {
  return {
    data: response.items.map(item => ({
      ...toArticleListItem(item),
      isSaved: true,
    })) as SavedArticle[],
    meta: {
      page: response.page,
      limit: response.limit,
      total: response.total,
      totalPages: response.totalPages,
    },
  };
}

function normalizeOptionalText(value: string | null | undefined) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return undefined;
  }

  return normalizedValue;
}

function normalizeTagsPayload(tags: string[] | undefined) {
  if (!tags) {
    return undefined;
  }

  return tags
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

export function toArticlePayload(
  payload: CreateArticlePayload,
): Record<string, unknown> {
  return {
    title: payload.title.trim(),
    summary: payload.summary.trim(),
    content: payload.content.trim(),
    category: payload.category,
    ...(normalizeOptionalText(payload.imageUrl) !== undefined
      ? { imageUrl: normalizeOptionalText(payload.imageUrl) }
      : {}),
    ...(normalizeTagsPayload(payload.tags) !== undefined
      ? { tags: normalizeTagsPayload(payload.tags) }
      : {}),
    ...(payload.isPublished !== undefined ? { isPublished: payload.isPublished } : {}),
  };
}
