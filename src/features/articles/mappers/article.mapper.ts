import type {
  ArticleAuthor,
  ArticleCategory,
  ArticleCategoryOption,
  ArticleDetail,
  ArticleListItem,
  PaginatedResponse,
  PaginationMeta,
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
  author: ApiArticleAuthor;
};

type ApiArticleDetail = ApiArticleListItem & {
  content?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ApiPaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export const ARTICLE_CATEGORY_OPTIONS: ArticleCategoryOption[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'TIPS', label: 'Dicas' },
  { value: 'STORAGE', label: 'Conservacao' },
  { value: 'SEASONALITY', label: 'Safra' },
  { value: 'RECIPES', label: 'Uso na cozinha' },
  { value: 'WASTE_REDUCTION', label: 'Aproveitamento' },
];

const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  TIPS: 'Dicas',
  STORAGE: 'Conservacao',
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
  };
}

export function toArticleDetail(article: ApiArticleDetail): ArticleDetail {
  return {
    ...toArticleListItem(article),
    content: article.content ?? '',
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
