import type {
  ArticleAuthor,
  ArticleBlock,
  ArticleBlockKind,
  ArticleCategory,
  ArticleCategoryOption,
  ArticleReactionResult,
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
  subtitle?: string | null;
  imageUrl?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  tags?: unknown;
  publishedAt?: string;
  readingTimeMinutes?: number;
  featured?: boolean;
  isSaved?: boolean;
  reactionsCount?: number;
  isReacted?: boolean;
  author: ApiArticleAuthor;
};

type ApiArticleBlock = {
  id?: unknown;
  articleId?: unknown;
  kind?: unknown;
  title?: unknown;
  body?: unknown;
  imageUrl?: unknown;
  imageAlt?: unknown;
  imageCaption?: unknown;
  items?: unknown;
  sortOrder?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type ApiArticleDetail = ApiArticleListItem & {
  content?: string;
  blocks?: unknown;
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

const ARTICLE_BLOCK_KINDS: ArticleBlockKind[] = [
  'PARAGRAPH',
  'HEADING',
  'IMAGE',
  'TIP',
  'WARNING',
  'CHECKLIST',
  'STEPS',
  'QUOTE',
  'PRODUCT_REFERENCE',
  'SECTION',
  'OTHER',
];

function normalizeOptionalText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function normalizeOptionalUrl(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function isArticleBlockKind(value: unknown): value is ArticleBlockKind {
  return (
    typeof value === 'string' &&
    ARTICLE_BLOCK_KINDS.includes(value as ArticleBlockKind)
  );
}

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function normalizeReactionsCount(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(value, 0);
}

function normalizeBlocks(value: unknown): ArticleBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .reduce<ArticleBlock[]>((blocks, item, index) => {
      if (!item || typeof item !== 'object') {
        return blocks;
      }

      const block = item as ApiArticleBlock;

      if (typeof block.id !== 'string' || !isArticleBlockKind(block.kind)) {
        return blocks;
      }

      return [
        ...blocks,
        {
          id: block.id,
          articleId:
            typeof block.articleId === 'string' ? block.articleId : undefined,
          kind: block.kind,
          title: normalizeOptionalText(block.title),
          body: normalizeOptionalText(block.body),
          imageUrl: normalizeOptionalUrl(block.imageUrl),
          imageAlt: normalizeOptionalText(block.imageAlt),
          imageCaption: normalizeOptionalText(block.imageCaption),
          items: block.items,
          sortOrder:
            typeof block.sortOrder === 'number' ? block.sortOrder : index,
          createdAt:
            typeof block.createdAt === 'string' ? block.createdAt : undefined,
          updatedAt:
            typeof block.updatedAt === 'string' ? block.updatedAt : undefined,
        },
      ];
    }, [])
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
}

export function toArticleBlock(block: ApiArticleBlock): ArticleBlock {
  return normalizeBlocks([block])[0] as ArticleBlock;
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
        imageUrl:
          typeof product.imageUrl === 'string' ? product.imageUrl : null,
      };
    })
    .filter((item): item is RelatedProduct => item !== null);
}

export function getArticleCategoryLabel(category: ArticleCategory) {
  return ARTICLE_CATEGORY_LABELS[category];
}

export function toArticleListItem(
  article: ApiArticleListItem,
): ArticleListItem {
  const coverImageUrl = normalizeOptionalUrl(article.coverImageUrl);
  const imageUrl = coverImageUrl ?? article.imageUrl ?? null;

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    category: article.category,
    imageUrl,
    subtitle: normalizeOptionalText(article.subtitle),
    coverImageUrl: coverImageUrl ?? null,
    coverImageAlt: normalizeOptionalText(article.coverImageAlt),
    tags: normalizeTags(article.tags),
    publishedAt: article.publishedAt,
    readingTimeMinutes: article.readingTimeMinutes,
    featured: article.featured ?? false,
    author: toArticleAuthor(article.author),
    isSaved: article.isSaved ?? false,
    reactionsCount: normalizeReactionsCount(article.reactionsCount),
    isReacted: article.isReacted ?? false,
  };
}

export function toArticleDetail(article: ApiArticleDetail): ArticleDetail {
  return {
    ...toArticleListItem(article),
    content: article.content ?? '',
    blocks: normalizeBlocks(article.blocks),
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

export function toArticleReactionResult(value: unknown): ArticleReactionResult {
  const payload =
    value && typeof value === 'object'
      ? (value as {
          message?: unknown;
          isReacted?: unknown;
          reactionsCount?: unknown;
        })
      : undefined;

  return {
    ...(typeof payload?.message === 'string'
      ? { message: payload.message }
      : {}),
    isReacted: payload?.isReacted === true,
    reactionsCount: normalizeReactionsCount(payload?.reactionsCount),
  };
}

function normalizeOptionalPayloadText(value: string | null | undefined) {
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

  return tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
}

export function toArticlePayload(
  payload: CreateArticlePayload,
): Record<string, unknown> {
  return {
    title: payload.title.trim(),
    summary: payload.summary.trim(),
    content: payload.content.trim(),
    category: payload.category,
    ...(normalizeOptionalPayloadText(payload.subtitle) !== undefined
      ? { subtitle: normalizeOptionalPayloadText(payload.subtitle) }
      : {}),
    ...(normalizeOptionalPayloadText(payload.imageUrl) !== undefined
      ? { imageUrl: normalizeOptionalPayloadText(payload.imageUrl) }
      : {}),
    ...(normalizeOptionalPayloadText(payload.coverImageUrl) !== undefined
      ? { coverImageUrl: normalizeOptionalPayloadText(payload.coverImageUrl) }
      : {}),
    ...(normalizeOptionalPayloadText(payload.coverImageAlt) !== undefined
      ? { coverImageAlt: normalizeOptionalPayloadText(payload.coverImageAlt) }
      : {}),
    ...(normalizeTagsPayload(payload.tags) !== undefined
      ? { tags: normalizeTagsPayload(payload.tags) }
      : {}),
    ...(payload.readingTimeMinutes !== undefined
      ? { readingTimeMinutes: payload.readingTimeMinutes }
      : {}),
    ...(payload.featured !== undefined ? { featured: payload.featured } : {}),
    ...(payload.isPublished !== undefined
      ? { isPublished: payload.isPublished }
      : {}),
  };
}
