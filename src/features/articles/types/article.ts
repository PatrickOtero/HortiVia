import type { ProductCategory } from '../../products/types/product';

export type ArticleCategory =
  | 'TIPS'
  | 'STORAGE'
  | 'SEASONALITY'
  | 'RECIPES'
  | 'WASTE_REDUCTION';

export type ArticleCategoryFilter = 'ALL' | ArticleCategory;

export type ArticleCategoryOption = {
  value: ArticleCategoryFilter;
  label: string;
};

export type ArticleAuthor = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type ArticleBlockKind =
  | 'PARAGRAPH'
  | 'HEADING'
  | 'IMAGE'
  | 'TIP'
  | 'WARNING'
  | 'CHECKLIST'
  | 'STEPS'
  | 'QUOTE'
  | 'PRODUCT_REFERENCE'
  | 'SECTION'
  | 'OTHER';

export type ArticleBlock = {
  id: string;
  articleId?: string;
  kind: ArticleBlockKind;
  title?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  items?: unknown;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateArticleBlockImagePayload = {
  imageUrl: string;
  imageAlt?: string;
  imageCaption?: string;
};

export type CreateArticleBlockPayload = {
  kind: ArticleBlockKind;
  title?: string;
  body?: string;
  items?: string[];
  sortOrder?: number;
};

export type UpdateArticleBlockPayload = Partial<CreateArticleBlockPayload>;

export type ArticleBlockImageUploadResponse = {
  uploadUrl: string;
  imageUrl: string;
  key?: string;
};

export type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  shortDescription: string;
  imageUrl: string | null;
};

export type ArticleListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: ArticleCategory;
  imageUrl: string | null;
  subtitle?: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string;
  tags: string[];
  publishedAt?: string;
  readingTimeMinutes?: number;
  featured?: boolean;
  author: ArticleAuthor;
  isSaved?: boolean;
  reactionsCount?: number;
  isReacted?: boolean;
};

export type ArticleDetail = ArticleListItem & {
  content: string;
  blocks: ArticleBlock[];
  relatedProducts?: RelatedProduct[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateArticlePayload = {
  title: string;
  summary: string;
  content: string;
  category: ArticleCategory;
  subtitle?: string;
  imageUrl?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string;
  tags?: string[];
  readingTimeMinutes?: number;
  featured?: boolean;
  isPublished?: boolean;
};

export type UpdateArticlePayload = Partial<CreateArticlePayload>;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type SavedArticle = ArticleListItem & {
  isSaved: true;
};

export type ArticleReactionResult = {
  message?: string;
  isReacted: boolean;
  reactionsCount: number;
};

export type SavedArticlesResponse = {
  data: SavedArticle[];
  meta: PaginationMeta;
};

export type ListArticlesParams = {
  search?: string;
  category?: ArticleCategory;
  page?: number;
  limit?: number;
};
