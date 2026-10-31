import type {
  CreateProductPayload,
  ProductCategory,
  ProductDetail,
} from '../../products/types/product';
import {
  formatMultilineList,
  formatNutrients,
  parseMultilineList,
  parseNutrients,
} from './adminContent';

export type ProductFormValues = {
  name: string;
  category: ProductCategory | null;
  shortDescription: string;
  description: string;
  imageUrl: string;
  benefits: string;
  howToChoose: string;
  howToStore: string;
  usageTips: string;
  nutrients: string;
};

export type ProductFormErrors = Partial<
  Record<'name' | 'category' | 'shortDescription', string>
>;

export const INITIAL_PRODUCT_FORM_VALUES: ProductFormValues = {
  name: '',
  category: null,
  shortDescription: '',
  description: '',
  imageUrl: '',
  benefits: '',
  howToChoose: '',
  howToStore: '',
  usageTips: '',
  nutrients: '',
};

export function productToFormValues(product: ProductDetail): ProductFormValues {
  return {
    name: product.name,
    category: product.category,
    shortDescription: product.shortDescription,
    description: product.description ?? '',
    imageUrl: product.imageUrl ?? '',
    benefits: formatMultilineList(product.benefits),
    howToChoose: formatMultilineList(product.howToChoose),
    howToStore: formatMultilineList(product.howToStore),
    usageTips: formatMultilineList(product.usageTips),
    nutrients: formatNutrients(product.nutrients),
  };
}

export function validateProductForm(
  values: ProductFormValues,
): ProductFormErrors {
  const errors: ProductFormErrors = {};
  if (!values.name.trim()) errors.name = 'Informe o nome do produto.';
  if (!values.category) errors.category = 'Selecione uma categoria.';
  if (!values.shortDescription.trim()) {
    errors.shortDescription = 'Informe um resumo curto.';
  }
  return errors;
}

export function productFormToPayload(
  values: ProductFormValues,
): CreateProductPayload {
  return {
    name: values.name,
    category: values.category as ProductCategory,
    shortDescription: values.shortDescription,
    description: values.description,
    imageUrl: values.imageUrl,
    benefits: parseMultilineList(values.benefits),
    howToChoose: parseMultilineList(values.howToChoose),
    howToStore: parseMultilineList(values.howToStore),
    usageTips: parseMultilineList(values.usageTips),
    nutrients: parseNutrients(values.nutrients),
  };
}
