import type { ProductDetail } from '../../products/types/product';
import {
  INITIAL_PRODUCT_FORM_VALUES,
  productFormToPayload,
  productToFormValues,
  validateProductForm,
} from './adminProductForm';

describe('adminProductForm', () => {
  it('requires the same name, category and short description as the form', () => {
    expect(validateProductForm(INITIAL_PRODUCT_FORM_VALUES)).toEqual({
      name: 'Informe o nome do produto.',
      category: 'Selecione uma categoria.',
      shortDescription: 'Informe um resumo curto.',
    });
  });

  it('round-trips product lists and nutrient values through the existing formatters', () => {
    const product = {
      id: 'tomato',
      name: 'Tomate',
      slug: 'tomate',
      category: 'VEGETABLE',
      shortDescription: 'Resumo',
      imageUrl: 'https://images.test/tomato.jpg',
      benefits: ['Fonte de informação aprovada'],
      howToChoose: ['Observe a firmeza'],
      howToStore: ['Siga a orientação do guia'],
      usageTips: ['Use em saladas'],
      nutrients: [{ label: 'Nutriente', value: 'valor' }],
      mainImages: [],
      guideSections: [],
    } as ProductDetail;

    const values = productToFormValues(product);

    expect(values).toMatchObject({
      benefits: 'Fonte de informação aprovada',
      howToChoose: 'Observe a firmeza',
      howToStore: 'Siga a orientação do guia',
      usageTips: 'Use em saladas',
      nutrients: 'Nutriente: valor',
    });
    expect(productFormToPayload(values)).toMatchObject({
      name: 'Tomate',
      category: 'VEGETABLE',
      benefits: ['Fonte de informação aprovada'],
      howToChoose: ['Observe a firmeza'],
      howToStore: ['Siga a orientação do guia'],
      usageTips: ['Use em saladas'],
      nutrients: [{ label: 'Nutriente', value: 'valor' }],
    });
  });
});
