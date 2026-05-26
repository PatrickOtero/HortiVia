import type { ArticleCategory } from '../../articles/types/article';

export type ProductCategory = 'FRUIT' | 'VEGETABLE' | 'LEGUME';

export type ProductCategoryFilter = 'ALL' | ProductCategory;

export type ProductCategoryOption = {
  value: ProductCategoryFilter;
  label: string;
};

export type ProductNutrient = {
  label: string;
  value: string;
};

export type ProductGuideImage = {
  id: string;
  imageUrl: string;
  alt?: string | null;
  label?: string | null;
  caption?: string | null;
  kind?: ProductImageKind | string | null;
  sortOrder?: number | null;
  isPrimary?: boolean;
  isLegacyFallback?: boolean;
};

export type ProductImageKind =
  | 'HERO'
  | 'WHOLE'
  | 'CUT'
  | 'IDEAL_STATE'
  | 'UNRIPE_STATE'
  | 'DEFECT'
  | 'STORAGE'
  | 'USAGE'
  | 'OTHER';

export type ProductGuideSectionKind =
  | 'choose'
  | 'observe'
  | 'store'
  | 'use'
  | 'quickFacts'
  | 'other';

export type ProductGuideSectionKindValue =
  | 'CHOOSE'
  | 'OBSERVE'
  | 'STORE'
  | 'USE'
  | 'QUICK_FACTS'
  | 'OTHER';

export type ProductGuideSection = {
  id: string;
  kind: ProductGuideSectionKind;
  title: string;
  body?: string | null;
  bullets: string[];
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageCaption?: string | null;
  idealPoints?: string[];
  avoidPoints?: string[];
  sortOrder?: number;
};

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  shortDescription: string;
  imageUrl: string | null;
  isFavorite?: boolean;
};

export type RelatedArticle = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: ArticleCategory;
  imageUrl: string | null;
  publishedAt?: string;
};

export type ProductDetail = ProductListItem & {
  description?: string | null;
  benefits: string[];
  howToChoose: string[];
  howToStore: string[];
  usageTips: string[];
  nutrients: ProductNutrient[];
  mainImages: ProductGuideImage[];
  guideSections: ProductGuideSection[];
  relatedArticles?: RelatedArticle[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateProductPayload = {
  name: string;
  category: ProductCategory;
  shortDescription: string;
  description?: string | null;
  imageUrl?: string | null;
  benefits?: string[];
  howToChoose?: string[];
  howToStore?: string[];
  usageTips?: string[];
  nutrients?: ProductNutrient[];
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

export type CreateProductImagePayload = {
  url: string;
  alt?: string | null;
  caption?: string | null;
  kind: ProductImageKind;
  sortOrder?: number;
  isPrimary?: boolean;
};

export type UpdateProductImagePayload = Partial<CreateProductImagePayload>;

export type CreateProductGuideSectionPayload = {
  kind: ProductGuideSectionKindValue;
  title: string;
  body: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageCaption?: string | null;
  bullets?: string[];
  idealPoints?: string[];
  avoidPoints?: string[];
  sortOrder?: number;
};

export type UpdateProductGuideSectionPayload =
  Partial<CreateProductGuideSectionPayload>;

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

export type FavoriteProduct = ProductListItem & {
  isFavorite: true;
};

export type FavoriteProductsResponse = PaginatedResponse<FavoriteProduct>;

export type RecentProduct = ProductListItem & {
  viewedAt: string;
};

export type ListProductsParams = {
  search?: string;
  category?: ProductCategory;
  page?: number;
  limit?: number;
};
