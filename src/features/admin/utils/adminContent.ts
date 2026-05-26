import type {
  ProductCategory,
  ProductNutrient,
} from '../../products/types/product';
import type { ArticleCategory } from '../../articles/types/article';

type Option<T> = {
  value: T;
  label: string;
};

export const ADMIN_PRODUCT_CATEGORY_OPTIONS: Option<ProductCategory>[] = [
  { value: 'FRUIT', label: 'Fruta' },
  { value: 'VEGETABLE', label: 'Verdura' },
  { value: 'LEGUME', label: 'Legume' },
];

export const ADMIN_ARTICLE_CATEGORY_OPTIONS: Option<ArticleCategory>[] = [
  { value: 'TIPS', label: 'Dicas' },
  { value: 'STORAGE', label: 'Conservação' },
  { value: 'SEASONALITY', label: 'Safra' },
  { value: 'RECIPES', label: 'Uso na cozinha' },
  { value: 'WASTE_REDUCTION', label: 'Aproveitamento' },
];

export function parseMultilineList(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return [];
  }

  if (normalizedValue.startsWith('[') && normalizedValue.endsWith(']')) {
    try {
      const parsedValue = JSON.parse(normalizedValue);

      if (Array.isArray(parsedValue)) {
        return parsedValue
          .filter((item): item is string => typeof item === 'string')
          .map(item => item.trim())
          .filter(item => item.length > 0);
      }
    } catch {
      // Falls back to text parsing below.
    }
  }

  const separator = normalizedValue.includes('\n') ? /\r?\n/ : ',';

  return normalizedValue
    .split(separator)
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

export function formatMultilineList(value: string[] | undefined) {
  if (!value || value.length === 0) {
    return '';
  }

  return value.join('\n');
}

export function parseNutrients(value: string): ProductNutrient[] {
  return value
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const [rawLabel, ...rawValueParts] = line.split(':');
      const label = rawLabel?.trim() ?? '';
      const valueText = rawValueParts.join(':').trim();

      if (!label || !valueText) {
        return null;
      }

      return {
        label,
        value: valueText,
      };
    })
    .filter((item): item is ProductNutrient => item !== null);
}

export function formatNutrients(value: ProductNutrient[] | undefined) {
  if (!value || value.length === 0) {
    return '';
  }

  return value.map(item => `${item.label}: ${item.value}`).join('\n');
}

export function parseTags(value: string) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

export function formatTags(value: string[] | undefined) {
  if (!value || value.length === 0) {
    return '';
  }

  return value.join(', ');
}

export function formatPublishedDate(value?: string) {
  if (!value) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return null;
  }
}
