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

export type ArticleListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: ArticleCategory;
  imageUrl: string | null;
  tags: string[];
  publishedAt?: string;
  readingTimeMinutes?: number;
  author: ArticleAuthor;
};

export type ArticleDetail = ArticleListItem & {
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateArticlePayload = {
  title: string;
  summary: string;
  content: string;
  category: ArticleCategory;
  imageUrl?: string | null;
  tags?: string[];
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

export type ListArticlesParams = {
  search?: string;
  category?: ArticleCategory;
  page?: number;
  limit?: number;
};
