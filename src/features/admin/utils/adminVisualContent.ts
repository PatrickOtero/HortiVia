import type {
  CreateProductGuideSectionPayload,
  CreateProductImagePayload,
  ProductGuideSection,
  ProductGuideSectionKindValue,
  ProductImageKind,
  UpdateProductGuideSectionPayload,
  UpdateProductImagePayload,
} from '../../products/types/product';
import { formatMultilineList, parseMultilineList } from './adminContent';

type Option<T> = {
  value: T;
  label: string;
};

export type ProductImageFormValues = {
  kind: ProductImageKind | null;
  alt: string;
  caption: string;
  sortOrder: string;
  isPrimary: boolean;
};

export type ProductGuideSectionFormValues = {
  kind: ProductGuideSectionKindValue | null;
  title: string;
  body: string;
  imageAlt: string;
  imageCaption: string;
  bullets: string;
  idealPoints: string;
  avoidPoints: string;
  sortOrder: string;
};

export type ProductImageFormErrors = Partial<
  Record<'kind' | 'sortOrder', string>
>;

export type ProductGuideSectionFormErrors = Partial<
  Record<'kind' | 'title' | 'body' | 'sortOrder', string>
>;

export const PRODUCT_IMAGE_KIND_OPTIONS: Option<ProductImageKind>[] = [
  { value: 'HERO', label: 'Destaque' },
  { value: 'WHOLE', label: 'Produto inteiro' },
  { value: 'CUT', label: 'Produto cortado' },
  { value: 'IDEAL_STATE', label: 'Ponto ideal' },
  { value: 'UNRIPE_STATE', label: 'Ainda verde' },
  { value: 'DEFECT', label: 'Sinais de atenção' },
  { value: 'STORAGE', label: 'Conservação' },
  { value: 'USAGE', label: 'Uso' },
  { value: 'OTHER', label: 'Outro' },
];

export const PRODUCT_GUIDE_SECTION_KIND_OPTIONS: Option<ProductGuideSectionKindValue>[] =
  [
    { value: 'CHOOSE', label: 'Como escolher' },
    { value: 'OBSERVE', label: 'O que observar' },
    { value: 'STORE', label: 'Como conservar' },
    { value: 'USE', label: 'Como aproveitar' },
    { value: 'QUICK_FACTS', label: 'Informações rápidas' },
    { value: 'OTHER', label: 'Outro' },
  ];

export const INITIAL_PRODUCT_IMAGE_FORM_VALUES: ProductImageFormValues = {
  kind: null,
  alt: '',
  caption: '',
  sortOrder: '',
  isPrimary: false,
};

export const INITIAL_PRODUCT_GUIDE_SECTION_FORM_VALUES: ProductGuideSectionFormValues =
  {
    kind: null,
    title: '',
    body: '',
    imageAlt: '',
    imageCaption: '',
    bullets: '',
    idealPoints: '',
    avoidPoints: '',
    sortOrder: '',
  };

export function getProductImageKindLabel(kind: ProductImageKind) {
  return (
    PRODUCT_IMAGE_KIND_OPTIONS.find(option => option.value === kind)?.label ??
    'Outro'
  );
}

export function getProductGuideSectionKindValueLabel(
  kind: ProductGuideSectionKindValue,
) {
  return (
    PRODUCT_GUIDE_SECTION_KIND_OPTIONS.find(option => option.value === kind)
      ?.label ?? 'Outro'
  );
}

export function parseSortOrder(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
}

export function validateProductImageForm(values: ProductImageFormValues) {
  const errors: ProductImageFormErrors = {};

  if (!values.kind) {
    errors.kind = 'Selecione um tipo de imagem.';
  }

  if (parseSortOrder(values.sortOrder) === null) {
    errors.sortOrder = 'Informe uma ordem válida.';
  }

  return errors;
}

export function validateProductGuideSectionForm(
  values: ProductGuideSectionFormValues,
) {
  const errors: ProductGuideSectionFormErrors = {};

  if (!values.kind) {
    errors.kind = 'Selecione um tipo de seção.';
  }

  if (!values.title.trim()) {
    errors.title = 'Informe o título.';
  }

  if (!values.body.trim()) {
    errors.body = 'Informe o texto principal.';
  }

  if (parseSortOrder(values.sortOrder) === null) {
    errors.sortOrder = 'Informe uma ordem válida.';
  }

  return errors;
}

export function toCreateProductImagePayload(
  values: ProductImageFormValues,
): CreateProductImagePayload {
  return {
    url: '',
    kind: values.kind ?? 'OTHER',
    alt: values.alt.trim() || null,
    caption: values.caption.trim() || null,
    sortOrder: parseSortOrder(values.sortOrder) ?? undefined,
    isPrimary: values.isPrimary,
  };
}

export function toUpdateProductImagePayload(
  values: ProductImageFormValues,
): UpdateProductImagePayload {
  return {
    kind: values.kind ?? 'OTHER',
    alt: values.alt.trim() || null,
    caption: values.caption.trim() || null,
    sortOrder: parseSortOrder(values.sortOrder) ?? undefined,
    isPrimary: values.isPrimary,
  };
}

export function toCreateProductGuideSectionPayload(
  values: ProductGuideSectionFormValues,
): CreateProductGuideSectionPayload {
  return {
    kind: values.kind ?? 'OTHER',
    title: values.title.trim(),
    body: values.body.trim(),
    imageAlt: values.imageAlt.trim() || null,
    imageCaption: values.imageCaption.trim() || null,
    bullets: parseMultilineList(values.bullets),
    idealPoints: parseMultilineList(values.idealPoints),
    avoidPoints: parseMultilineList(values.avoidPoints),
    sortOrder: parseSortOrder(values.sortOrder) ?? undefined,
  };
}

export function toUpdateProductGuideSectionPayload(
  values: ProductGuideSectionFormValues,
): UpdateProductGuideSectionPayload {
  return toCreateProductGuideSectionPayload(values);
}

export function getInitialImageFormValuesFromItem(item: {
  kind?: ProductImageKind | string | null;
  alt?: string | null;
  caption?: string | null;
  sortOrder?: number | null;
  isPrimary?: boolean;
}): ProductImageFormValues {
  return {
    kind:
      typeof item.kind === 'string'
        ? (item.kind as ProductImageKind)
        : null,
    alt: item.alt ?? '',
    caption: item.caption ?? '',
    sortOrder:
      typeof item.sortOrder === 'number' ? String(item.sortOrder) : '',
    isPrimary: item.isPrimary ?? false,
  };
}

export function getInitialGuideSectionFormValuesFromItem(
  item: ProductGuideSection,
): ProductGuideSectionFormValues {
  const kindMap: Record<string, ProductGuideSectionKindValue> = {
    choose: 'CHOOSE',
    observe: 'OBSERVE',
    store: 'STORE',
    use: 'USE',
    quickFacts: 'QUICK_FACTS',
    other: 'OTHER',
  };

  return {
    kind: kindMap[item.kind] ?? 'OTHER',
    title: item.title,
    body: item.body ?? '',
    imageAlt: item.imageAlt ?? '',
    imageCaption: item.imageCaption ?? '',
    bullets: formatMultilineList(item.bullets),
    idealPoints: formatMultilineList(item.idealPoints),
    avoidPoints: formatMultilineList(item.avoidPoints),
    sortOrder:
      typeof item.sortOrder === 'number' ? String(item.sortOrder) : '',
  };
}
