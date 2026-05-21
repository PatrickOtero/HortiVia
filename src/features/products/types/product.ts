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

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  shortDescription: string;
  imageUrl: string | null;
};

export type ProductDetail = ProductListItem & {
  description?: string | null;
  benefits: string[];
  howToChoose: string[];
  howToStore: string[];
  usageTips: string[];
  nutrients: ProductNutrient[];
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

export type ListProductsParams = {
  search?: string;
  category?: ProductCategory;
  page?: number;
  limit?: number;
};
