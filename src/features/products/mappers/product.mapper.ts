import type {
  CreateProductPayload,
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

function normalizeOptionalText(value: string | null | undefined) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return undefined;
  }

  return normalizedValue;
}

function normalizeStringListPayload(value: string[] | undefined) {
  if (!value) {
    return undefined;
  }

  return value
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

function normalizeNutrientsPayload(value: ProductNutrient[] | undefined) {
  if (!value) {
    return undefined;
  }

  return value
    .map(item => ({
      label: item.label.trim(),
      value: item.value.trim(),
    }))
    .filter(item => item.label.length > 0 && item.value.length > 0);
}

export function toProductPayload(
  payload: CreateProductPayload,
): Record<string, unknown> {
  return {
    name: payload.name.trim(),
    category: payload.category,
    shortDescription: payload.shortDescription.trim(),
    ...(normalizeOptionalText(payload.description) !== undefined
      ? { description: normalizeOptionalText(payload.description) }
      : {}),
    ...(normalizeOptionalText(payload.imageUrl) !== undefined
      ? { imageUrl: normalizeOptionalText(payload.imageUrl) }
      : {}),
    ...(normalizeStringListPayload(payload.benefits) !== undefined
      ? { benefits: normalizeStringListPayload(payload.benefits) }
      : {}),
    ...(normalizeStringListPayload(payload.howToChoose) !== undefined
      ? { howToChoose: normalizeStringListPayload(payload.howToChoose) }
      : {}),
    ...(normalizeStringListPayload(payload.howToStore) !== undefined
      ? { howToStore: normalizeStringListPayload(payload.howToStore) }
      : {}),
    ...(normalizeStringListPayload(payload.usageTips) !== undefined
      ? { usageTips: normalizeStringListPayload(payload.usageTips) }
      : {}),
    ...(normalizeNutrientsPayload(payload.nutrients) !== undefined
      ? { nutrients: normalizeNutrientsPayload(payload.nutrients) }
      : {}),
  };
}
