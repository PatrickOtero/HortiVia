import type {
  CreateProductGuideSectionPayload,
  CreateProductImagePayload,
  CreateProductPayload,
  PaginatedResponse,
  PaginationMeta,
  ProductCategory,
  ProductCategoryOption,
  ProductDetail,
  ProductGuideImage,
  ProductGuideSection,
  ProductGuideSectionKind,
  ProductGuideSectionKindValue,
  ProductImageKind,
  ProductListItem,
  ProductNutrient,
  UpdateProductGuideSectionPayload,
  UpdateProductImagePayload,
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
  mainImages?: unknown;
  guideSections?: unknown;
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

const PRODUCT_GUIDE_SECTION_LABELS: Record<ProductGuideSectionKind, string> = {
  choose: 'Como escolher',
  observe: 'O que observar',
  store: 'Como conservar',
  use: 'Como aproveitar',
  quickFacts: 'Informações rápidas',
  other: 'Outro',
};

const PRODUCT_GUIDE_SECTION_SUBTITLES: Partial<
  Record<ProductGuideSectionKind, string>
> = {
  choose: 'Veja o que vale observar na hora da compra.',
  observe: 'Sinais que ajudam a avaliar melhor o alimento.',
  store: 'Cuidados rápidos para manter a qualidade.',
  use: 'Ideias práticas para incluir no dia a dia.',
};

function normalizeStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(item => item.length > 0);
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

function normalizeOptionalTextValue(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}

function normalizeGuideSectionKind(value: unknown): ProductGuideSectionKind | null {
  if (typeof value !== 'string') {
    return null;
  }

  switch (value.trim().toLowerCase()) {
    case 'choose':
      return 'choose';
    case 'observe':
      return 'observe';
    case 'store':
      return 'store';
    case 'use':
      return 'use';
    case 'quickfacts':
    case 'quick_facts':
    case 'quick-facts':
    case 'quickfactscard':
    case 'quickfactssection':
      return 'quickFacts';
    case 'other':
      return 'other';
    default:
      return null;
  }
}

function normalizeProductImageKind(value: unknown): ProductImageKind | null {
  if (typeof value !== 'string') {
    return null;
  }

  switch (value.trim().toUpperCase()) {
    case 'HERO':
    case 'WHOLE':
    case 'CUT':
    case 'IDEAL_STATE':
    case 'UNRIPE_STATE':
    case 'DEFECT':
    case 'STORAGE':
    case 'USAGE':
    case 'OTHER':
      return value.trim().toUpperCase() as ProductImageKind;
    default:
      return null;
  }
}

function isLegacyFallbackImage(image: ProductGuideImage) {
  return (
    image.id === 'primary-image' ||
    image.id.endsWith('-legacy-image') ||
    image.isLegacyFallback === true
  );
}

function normalizeProductImages(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index): ProductGuideImage | null => {
      if (typeof item === 'string') {
        const normalizedImageUrl = normalizeOptionalTextValue(item);

        if (!normalizedImageUrl) {
          return null;
        }

        return {
          id: `image-${index}`,
          imageUrl: normalizedImageUrl,
          label: null,
          caption: null,
          isLegacyFallback: false,
        };
      }

      if (!item || typeof item !== 'object') {
        return null;
      }

      const image = item as {
        id?: unknown;
        imageUrl?: unknown;
        url?: unknown;
        alt?: unknown;
        label?: unknown;
        caption?: unknown;
        kind?: unknown;
        sortOrder?: unknown;
        isPrimary?: unknown;
      };

      const normalizedImageUrl =
        normalizeOptionalTextValue(image.imageUrl) ??
        normalizeOptionalTextValue(image.url);

      if (!normalizedImageUrl) {
        return null;
      }

      const id = normalizeOptionalTextValue(image.id) ?? `image-${index}`;

      return {
        id,
        imageUrl: normalizedImageUrl,
        alt:
          normalizeOptionalTextValue(image.alt) ??
          normalizeOptionalTextValue(image.label),
        label: normalizeOptionalTextValue(image.label),
        caption: normalizeOptionalTextValue(image.caption),
        kind: normalizeProductImageKind(image.kind),
        sortOrder:
          typeof image.sortOrder === 'number' ? image.sortOrder : index,
        isPrimary: typeof image.isPrimary === 'boolean' ? image.isPrimary : false,
        isLegacyFallback: id.endsWith('-legacy-image'),
      };
    })
    .filter((item): item is ProductGuideImage => item !== null)
    .sort((left, right) => {
      if (left.isPrimary && !right.isPrimary) {
        return -1;
      }

      if (!left.isPrimary && right.isPrimary) {
        return 1;
      }

      return (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
    });
}

export function toProductGuideImage(value: unknown): ProductGuideImage | null {
  return normalizeProductImages([value])[0] ?? null;
}

function normalizeGuideSections(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index): ProductGuideSection | null => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const section = item as {
        id?: unknown;
        kind?: unknown;
        type?: unknown;
        title?: unknown;
        body?: unknown;
        description?: unknown;
        bullets?: unknown;
        items?: unknown;
        imageUrl?: unknown;
        imageAlt?: unknown;
        imageCaption?: unknown;
        caption?: unknown;
        idealPoints?: unknown;
        ideal?: unknown;
        avoidPoints?: unknown;
        avoid?: unknown;
        sortOrder?: unknown;
      };

      const kind =
        normalizeGuideSectionKind(section.kind) ??
        normalizeGuideSectionKind(section.type);
      const title =
        normalizeOptionalTextValue(section.title) ??
        (kind ? PRODUCT_GUIDE_SECTION_LABELS[kind] : null);
      const body =
        normalizeOptionalTextValue(section.body) ??
        normalizeOptionalTextValue(section.description);
      const bullets =
        normalizeStringList(section.bullets).length > 0
          ? normalizeStringList(section.bullets)
          : normalizeStringList(section.items);

      if (!title && !body && bullets.length === 0) {
        return null;
      }

      return {
        id: normalizeOptionalTextValue(section.id) ?? `${kind ?? 'section'}-${index}`,
        kind: kind ?? 'quickFacts',
        title: title ?? `Seção ${index + 1}`,
        body,
        bullets,
        imageUrl: normalizeOptionalTextValue(section.imageUrl),
        imageAlt: normalizeOptionalTextValue(section.imageAlt),
        imageCaption:
          normalizeOptionalTextValue(section.imageCaption) ??
          normalizeOptionalTextValue(section.caption),
        idealPoints:
          normalizeStringList(section.idealPoints).length > 0
            ? normalizeStringList(section.idealPoints)
            : normalizeStringList(section.ideal),
        avoidPoints:
          normalizeStringList(section.avoidPoints).length > 0
            ? normalizeStringList(section.avoidPoints)
            : normalizeStringList(section.avoid),
        sortOrder: typeof section.sortOrder === 'number' ? section.sortOrder : index,
      };
    })
    .filter((item): item is ProductGuideSection => item !== null);
}

export function toSingleProductGuideSection(
  value: unknown,
): ProductGuideSection | null {
  return normalizeGuideSections([value])[0] ?? null;
}

function buildFallbackGuideSections(product: {
  description?: string | null;
  howToChoose: string[];
  howToStore: string[];
  usageTips: string[];
}) {
  const sections: ProductGuideSection[] = [];

  if (product.howToChoose.length > 0) {
    sections.push({
      id: 'choose',
      kind: 'choose',
      title: PRODUCT_GUIDE_SECTION_LABELS.choose,
      body: PRODUCT_GUIDE_SECTION_SUBTITLES.choose,
      bullets: product.howToChoose,
      sortOrder: 0,
    });
  }

  if (product.howToStore.length > 0) {
    sections.push({
      id: 'store',
      kind: 'store',
      title: PRODUCT_GUIDE_SECTION_LABELS.store,
      body: PRODUCT_GUIDE_SECTION_SUBTITLES.store,
      bullets: product.howToStore,
      sortOrder: 1,
    });
  }

  if (product.usageTips.length > 0) {
    sections.push({
      id: 'use',
      kind: 'use',
      title: PRODUCT_GUIDE_SECTION_LABELS.use,
      body: PRODUCT_GUIDE_SECTION_SUBTITLES.use,
      bullets: product.usageTips,
      sortOrder: 2,
    });
  }

  if (!sections.length && product.description) {
    sections.push({
      id: 'observe',
      kind: 'observe',
      title: PRODUCT_GUIDE_SECTION_LABELS.observe,
      body: product.description,
      bullets: [],
      sortOrder: 3,
    });
  }

  return sections;
}

function mergeGuideSections(
  normalizedSections: ProductGuideSection[],
  fallbackSections: ProductGuideSection[],
) {
  const normalizedKinds = new Set(normalizedSections.map(section => section.kind));

  return [
    ...normalizedSections,
    ...fallbackSections.filter(section => !normalizedKinds.has(section.kind)),
  ];
}

export function getProductCategoryLabel(category: ProductCategory) {
  return PRODUCT_CATEGORY_LABELS[category];
}

export function getProductGuideSectionLabel(kind: ProductGuideSectionKind) {
  return PRODUCT_GUIDE_SECTION_LABELS[kind];
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
  const description = product.description ?? null;
  const benefits = normalizeStringList(product.benefits);
  const howToChoose = normalizeStringList(product.howToChoose);
  const howToStore = normalizeStringList(product.howToStore);
  const usageTips = normalizeStringList(product.usageTips);
  const nutrients = normalizeNutrients(product.nutrients);
  const normalizedGuideSections = normalizeGuideSections(product.guideSections);
  const fallbackGuideSections = buildFallbackGuideSections({
    description,
    howToChoose,
    howToStore,
    usageTips,
  });
  const guideSections = mergeGuideSections(
    normalizedGuideSections,
    fallbackGuideSections,
  );
  const mainImages = normalizeProductImages(product.mainImages);
  const fallbackImageUrl = normalizeOptionalTextValue(product.imageUrl);
  const resolvedMainImages =
    mainImages.length > 0
      ? mainImages
      : fallbackImageUrl
        ? [
            {
              id: 'primary-image',
              imageUrl: fallbackImageUrl,
              alt: product.name,
              label: null,
              caption: null,
              kind: 'HERO' as ProductImageKind,
              sortOrder: 0,
              isPrimary: true,
              isLegacyFallback: true,
            },
          ]
        : [];

  return {
    ...toProductListItem(product),
    description,
    benefits,
    howToChoose,
    howToStore,
    usageTips,
    nutrients,
    mainImages: resolvedMainImages,
    guideSections,
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

function normalizeOptionalTextForPayload(value: string | null | undefined) {
  return normalizeOptionalText(value) ?? null;
}

function normalizeOptionalNumber(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function normalizeStringListPayload(value: string[] | undefined) {
  if (!value) {
    return undefined;
  }

  return value.map(item => item.trim()).filter(item => item.length > 0);
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

export function toProductImagePayload(
  payload: CreateProductImagePayload | UpdateProductImagePayload,
): Record<string, unknown> {
  return {
    ...(payload.url !== undefined ? { url: payload.url.trim() } : {}),
    ...(payload.alt !== undefined
      ? { alt: normalizeOptionalTextForPayload(payload.alt) }
      : {}),
    ...(payload.caption !== undefined
      ? { caption: normalizeOptionalTextForPayload(payload.caption) }
      : {}),
    ...(payload.kind !== undefined ? { kind: payload.kind } : {}),
    ...(normalizeOptionalNumber(payload.sortOrder) !== undefined
      ? { sortOrder: normalizeOptionalNumber(payload.sortOrder) }
      : {}),
    ...(payload.isPrimary !== undefined ? { isPrimary: payload.isPrimary } : {}),
  };
}

export function toProductGuideSectionPayload(
  payload: CreateProductGuideSectionPayload | UpdateProductGuideSectionPayload,
): Record<string, unknown> {
  return {
    ...(payload.kind !== undefined
      ? { kind: payload.kind as ProductGuideSectionKindValue }
      : {}),
    ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
    ...(payload.body !== undefined ? { body: payload.body.trim() } : {}),
    ...(payload.imageUrl !== undefined
      ? { imageUrl: normalizeOptionalTextForPayload(payload.imageUrl) }
      : {}),
    ...(payload.imageAlt !== undefined
      ? { imageAlt: normalizeOptionalTextForPayload(payload.imageAlt) }
      : {}),
    ...(payload.imageCaption !== undefined
      ? { imageCaption: normalizeOptionalTextForPayload(payload.imageCaption) }
      : {}),
    ...(payload.bullets !== undefined
      ? { bullets: normalizeStringListPayload(payload.bullets) ?? [] }
      : {}),
    ...(payload.idealPoints !== undefined
      ? { idealPoints: normalizeStringListPayload(payload.idealPoints) ?? [] }
      : {}),
    ...(payload.avoidPoints !== undefined
      ? { avoidPoints: normalizeStringListPayload(payload.avoidPoints) ?? [] }
      : {}),
    ...(normalizeOptionalNumber(payload.sortOrder) !== undefined
      ? { sortOrder: normalizeOptionalNumber(payload.sortOrder) }
      : {}),
  };
}

export function getEditableProductImages(images: ProductGuideImage[]) {
  return images.filter(image => !isLegacyFallbackImage(image));
}

export function getLegacyProductImage(images: ProductGuideImage[]) {
  return images.find(isLegacyFallbackImage) ?? null;
}
