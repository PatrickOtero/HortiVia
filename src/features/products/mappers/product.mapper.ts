import type {
  PaginatedResponse,
  PaginationMeta,
  ProductCategory,
  ProductCategoryOption,
  ProductDetail,
  ProductListItem,
  ProductNutrient,
} from '../types/product';

type ApiProductListItem = {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  shortDescription: string;
  imageUrl?: string | null;
};

type ApiProductDetail = ApiProductListItem & {
  description?: string | null;
  benefits?: unknown;
  howToChoose?: unknown;
  howToStore?: unknown;
  usageTips?: unknown;
  nutrients?: unknown;
  createdAt?: string;
  updatedAt?: string;
};

type ApiPaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export const PRODUCT_CATEGORY_OPTIONS: ProductCategoryOption[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'FRUIT', label: 'Frutas' },
  { value: 'VEGETABLE', label: 'Verduras' },
  { value: 'LEGUME', label: 'Legumes' },
];

const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  FRUIT: 'Frutas',
  VEGETABLE: 'Verduras',
  LEGUME: 'Legumes',
};

function normalizeStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function normalizeNutrients(value: unknown): ProductNutrient[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const nutrient = item as {
        label?: unknown;
        value?: unknown;
      };

      if (typeof nutrient.label !== 'string' || typeof nutrient.value !== 'string') {
        return null;
      }

      return {
        label: nutrient.label,
        value: nutrient.value,
      };
    })
    .filter((item): item is ProductNutrient => item !== null);
}

export function getProductCategoryLabel(category: ProductCategory) {
  return PRODUCT_CATEGORY_LABELS[category];
}

export function toProductListItem(product: ApiProductListItem): ProductListItem {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    shortDescription: product.shortDescription,
    imageUrl: product.imageUrl ?? null,
  };
}

export function toProductDetail(product: ApiProductDetail): ProductDetail {
  return {
    ...toProductListItem(product),
    description: product.description ?? null,
    benefits: normalizeStringList(product.benefits),
    howToChoose: normalizeStringList(product.howToChoose),
    howToStore: normalizeStringList(product.howToStore),
    usageTips: normalizeStringList(product.usageTips),
    nutrients: normalizeNutrients(product.nutrients),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function toPaginatedProductsResponse(
  response: ApiPaginatedResponse<ApiProductListItem>,
): PaginatedResponse<ProductListItem> {
  return {
    data: response.data.map(toProductListItem),
    meta: response.meta,
  };
}
