import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  CompactArticleCard,
  PrimaryButton,
  ProductGuideSection,
  SectionTitle,
} from '../../components';
import { trainingService } from '../../features/training/services/training.service';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useToggleProductFavorite } from '../../features/products/hooks/useToggleProductFavorite';
import { useProductById } from '../../features/products/hooks/useProductById';
import { addRecentProduct } from '../../features/products/storage/recentProducts.storage';
import { ProductDetailScreen } from './index';

jest.mock('../../features/training/services/training.service', () => ({
  trainingService: { getProduct: jest.fn().mockResolvedValue({ questions: [] }) },
}));

jest.mock('../../features/products/hooks/useProductById', () => ({
  useProductById: jest.fn(),
}));

jest.mock('../../features/products/hooks/useToggleProductFavorite', () => ({
  useToggleProductFavorite: jest.fn(),
}));

jest.mock('../../features/products/storage/recentProducts.storage', () => ({
  addRecentProduct: jest.fn(),
}));

const mockedUseProductById = useProductById as jest.Mock;
const mockedUseToggleProductFavorite = useToggleProductFavorite as jest.Mock;
const mockedAddRecentProduct = addRecentProduct as jest.Mock;

describe('ProductDetailScreen', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (trainingService.getProduct as jest.Mock).mockResolvedValue({ questions: [] });
    mockedUseToggleProductFavorite.mockReturnValue({
      isFavorite: false,
      isSubmitting: false,
      toggleFavorite: jest.fn(),
    });
    mockedAddRecentProduct.mockResolvedValue(undefined);
    mockedUseProductById.mockReturnValue({
      product: {
        id: 'product-1',
        name: 'Abacate',
        slug: 'abacate',
        category: 'FRUIT',
        shortDescription: 'Vai bem em torradas, vitaminas e cremes.',
        imageUrl: null,
        isFavorite: false,
        description: 'Quando amadurece, ganha textura cremosa.',
        benefits: [],
        howToChoose: [],
        howToStore: [],
        usageTips: [],
        nutrients: [],
        mainImages: [],
        guideSections: [],
        relatedArticles: [],
      },
      isLoading: false,
      isNotFound: false,
      retry: jest.fn(),
    });
  });

  function renderScreen() {
    return ReactTestRenderer.create(
      <ThemeProvider>
        <ProductDetailScreen
          navigation={{ navigate, goBack: jest.fn() } as never}
          route={{
            key: 'ProductDetail',
            name: 'ProductDetail',
            params: { productId: 'product-1' },
          } as never}
        />
      </ThemeProvider>,
    );
  }

  it('opens training for the displayed product when published questions exist', async () => {
    (trainingService.getProduct as jest.Mock).mockResolvedValue({ questions: [{ id: 'q1' }] });
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => { renderer = renderScreen(); });
    const action = renderer!.root.findAllByType(PrimaryButton).find(button => button.props.children === 'Treinar conhecimento');
    expect(action).toBeDefined();
    await ReactTestRenderer.act(async () => { action!.props.onPress(); });
    expect(navigate).toHaveBeenCalledWith('Training', { productId: 'product-1' });
  });

  it('hides related articles when none are available', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    const sectionTitles = renderer!.root
      .findAllByType(SectionTitle)
      .map(section => section.props.title);

    expect(sectionTitles).not.toContain('Leituras relacionadas');
  });

  it('shows only the first guide of each main type and keeps product quick facts separate', async () => {
    mockedUseProductById.mockReturnValue({
      product: {
        id: 'product-1',
        name: 'Abacate',
        slug: 'abacate',
        category: 'FRUIT',
        shortDescription: 'Versátil para diferentes preparações.',
        imageUrl: null,
        isFavorite: false,
        description: 'Descrição do produto.',
        benefits: ['Contém fibras.'],
        howToChoose: [
          'Prefira leve cedência.',
          'Evite rachaduras.',
          'Frutos firmes podem amadurecer.',
        ],
        howToStore: [
          'Firme pode amadurecer fora da geladeira.',
          'Guarde tampado.',
        ],
        usageTips: ['Use em vitaminas.'],
        nutrients: [{ label: 'Potássio', value: 'Presente naturalmente' }],
        mainImages: [],
        guideSections: [
          {
            id: 'choose', kind: 'choose', title: 'Seleção', body: 'Prefira leve cedência.',
            bullets: ['Prefira leve cedência.'], imageUrl: 'https://images.test/choose.png',
          },
          {
            id: 'attention', kind: 'observe', title: 'Pontos de atenção', body: 'Evite rachaduras.',
            bullets: ['Evite rachaduras.'], imageUrl: 'https://images.test/attention.png',
          },
          {
            id: 'maturity', kind: 'observe', title: 'Ponto de maturação', body: 'Frutos muito firmes amadurecem.',
            bullets: [], imageUrl: 'https://images.test/maturity.png',
          },
          {
            id: 'ripening', kind: 'store', title: 'Como amadurecer', body: 'Deixe fora da geladeira.',
            bullets: [], imageUrl: 'https://images.test/ripening.png',
          },
          {
            id: 'storage', kind: 'store', title: 'Como conservar depois de cortar', body: 'Guarde tampado.',
            bullets: ['Guarde tampado.'], imageUrl: 'https://images.test/storage.png',
          },
          {
            id: 'use', kind: 'use', title: 'Como usar', body: 'A polpa serve para preparações doces ou salgadas.',
            bullets: [], imageUrl: 'https://images.test/use.png',
          },
          {
            id: 'other-use', kind: 'use', title: 'Receita longa', body: 'Passos completos de uma receita.',
            bullets: [], imageUrl: 'https://images.test/other-use.png',
          },
          {
            id: 'facts', kind: 'quickFacts', title: 'Benefícios', body: 'Benefícios do guia.',
            bullets: ['Contém fibras.'], imageUrl: 'https://images.test/facts.png',
          },
          {
            id: 'other', kind: 'other', title: 'Seção legada', body: 'Conteúdo preservado.',
            bullets: [], imageUrl: 'https://images.test/other.png',
          },
        ],
        relatedArticles: [],
      },
      isLoading: false,
      isNotFound: false,
      retry: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    const titles = renderer!.root
      .findAllByType(SectionTitle)
      .map(section => section.props.title);
    expect(titles).toEqual([
      'Seleção',
      'Pontos de atenção',
      'Como amadurecer',
      'Como usar',
      'Informações rápidas',
    ]);
    expect(titles).not.toContain('Receita longa');
    expect(titles).not.toContain('Seção legada');
    expect(renderer!.root.findAllByType(CompactArticleCard)).toHaveLength(0);

    const guides = renderer!.root
      .findAllByType(ProductGuideSection)
      .map(section => section.props.section);
    expect(guides).toHaveLength(4);
    expect(guides.map(section => section.imageUrl)).toEqual([
      'https://images.test/choose.png',
      'https://images.test/attention.png',
      'https://images.test/ripening.png',
      'https://images.test/use.png',
    ]);
    expect(guides.map(section => section.kind)).toEqual([
      'choose',
      'observe',
      'store',
      'use',
    ]);
    expect(guides[0].bullets).toEqual(['Prefira leve cedência.']);
    expect(guides[2].bullets).toEqual([]);
    expect(guides[3].bullets).toEqual([]);
  });

  it('prioritizes up to four recipe and waste-reduction previews without repeating articles', async () => {
    const articles = [
      { id: 'tips', title: 'Dica', category: 'TIPS' },
      { id: 'recipe-1', title: 'Vitamina', category: 'RECIPES' },
      { id: 'waste-1', title: 'Aproveitamento', category: 'WASTE_REDUCTION' },
      { id: 'recipe-2', title: 'Guacamole', category: 'RECIPES' },
      { id: 'recipe-3', title: 'Torrada', category: 'RECIPES' },
      { id: 'recipe-4', title: 'Creme', category: 'RECIPES' },
      { id: 'recipe-5', title: 'Sopa', category: 'RECIPES' },
    ].map(article => ({
      ...article,
      slug: article.id,
      summary: `Resumo de ${article.title}.`,
      imageUrl: `https://images.test/${article.id}.jpg`,
    }));
    mockedUseProductById.mockReturnValue({
      product: {
        id: 'product-1', name: 'Abacate', slug: 'abacate', category: 'FRUIT',
        shortDescription: 'Versátil.', imageUrl: null, isFavorite: false,
        description: null, benefits: [], howToChoose: [], howToStore: [], usageTips: [],
        nutrients: [], mainImages: [], guideSections: [],
        relatedArticles: [...articles, articles[1]],
      },
      isLoading: false, isNotFound: false, retry: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    const titles = renderer!.root
      .findAllByType(SectionTitle)
      .map(section => section.props.title);
    const cards = renderer!.root.findAllByType(CompactArticleCard);
    const cardIds = cards.map(card => card.props.article.id);

    expect(titles).toContain('Receitas e ideias para aproveitar');
    expect(titles).toContain('Leituras relacionadas');
    expect(cardIds).toEqual([
      'recipe-1', 'waste-1', 'recipe-2', 'recipe-3', 'tips', 'recipe-4', 'recipe-5',
    ]);
    expect(new Set(cardIds).size).toBe(cardIds.length);
  });

  it('shows no empty recipe area when only other related categories exist', async () => {
    mockedUseProductById.mockReturnValue({
      product: {
        id: 'product-1', name: 'Abacate', slug: 'abacate', category: 'FRUIT',
        shortDescription: 'Versátil.', imageUrl: null, isFavorite: false,
        description: null, benefits: [], howToChoose: [], howToStore: [], usageTips: [],
        nutrients: [], mainImages: [], guideSections: [],
        relatedArticles: [{
          id: 'tips', title: 'Dica', slug: 'dica', summary: 'Resumo.', category: 'TIPS',
          imageUrl: 'https://images.test/tips.jpg',
        }],
      },
      isLoading: false, isNotFound: false, retry: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    const titles = renderer!.root
      .findAllByType(SectionTitle)
      .map(section => section.props.title);
    expect(titles).not.toContain('Receitas e ideias para aproveitar');
    expect(titles).toContain('Leituras relacionadas');
    expect(renderer!.root.findAllByType(CompactArticleCard)).toHaveLength(1);
  });

  it('does not crash when related articles are missing', async () => {
    mockedUseProductById.mockReturnValue({
      product: {
        id: 'product-1',
        name: 'Abacate',
        slug: 'abacate',
        category: 'FRUIT',
        shortDescription: 'Vai bem em torradas, vitaminas e cremes.',
        imageUrl: null,
        isFavorite: false,
        description: 'Quando amadurece, ganha textura cremosa.',
        benefits: [],
        howToChoose: [],
        howToStore: [],
        usageTips: [],
        nutrients: [],
        mainImages: [],
        guideSections: [],
      },
      isLoading: false,
      isNotFound: false,
      retry: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    const sectionTitles = renderer!.root
      .findAllByType(SectionTitle)
      .map(section => section.props.title);

    expect(sectionTitles).not.toContain('Leituras relacionadas');
  });

  it('renders related articles when present', async () => {
    mockedUseProductById.mockReturnValue({
      product: {
        id: 'product-1',
        name: 'Abacate',
        slug: 'abacate',
        category: 'FRUIT',
        shortDescription: 'Vai bem em torradas, vitaminas e cremes.',
        imageUrl: null,
        isFavorite: false,
        description: 'Quando amadurece, ganha textura cremosa.',
        benefits: [],
        howToChoose: [],
        howToStore: [],
        usageTips: [],
        nutrients: [],
        mainImages: [],
        guideSections: [],
        relatedArticles: [
          {
            id: 'article-1',
            title: 'Como escolher um abacate no ponto certo',
            slug: 'como-escolher-um-abacate-no-ponto-certo',
            summary: 'Sinais simples para acertar na escolha.',
            category: 'TIPS',
            imageUrl: null,
            publishedAt: '2026-05-26T10:00:00.000Z',
          },
        ],
      },
      isLoading: false,
      isNotFound: false,
      retry: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    const relatedCards = renderer!.root.findAllByType(CompactArticleCard);
    const sectionTitles = renderer!.root
      .findAllByType(SectionTitle)
      .map(section => section.props.title);

    expect(sectionTitles).toContain('Leituras relacionadas');
    expect(relatedCards).toHaveLength(1);
  });

  it('opens article detail when tapping a related article', async () => {
    mockedUseProductById.mockReturnValue({
      product: {
        id: 'product-1',
        name: 'Abacate',
        slug: 'abacate',
        category: 'FRUIT',
        shortDescription: 'Vai bem em torradas, vitaminas e cremes.',
        imageUrl: null,
        isFavorite: false,
        description: 'Quando amadurece, ganha textura cremosa.',
        benefits: [],
        howToChoose: [],
        howToStore: [],
        usageTips: [],
        nutrients: [],
        mainImages: [],
        guideSections: [],
        relatedArticles: [
          {
            id: 'article-1',
            title: 'Como escolher um abacate no ponto certo',
            slug: 'como-escolher-um-abacate-no-ponto-certo',
            summary: 'Sinais simples para acertar na escolha.',
            category: 'TIPS',
            imageUrl: null,
            publishedAt: '2026-05-26T10:00:00.000Z',
          },
        ],
      },
      isLoading: false,
      isNotFound: false,
      retry: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    const relatedCard = renderer!.root.findByType(CompactArticleCard);

    await ReactTestRenderer.act(async () => {
      relatedCard.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('ArticleDetail', {
      articleId: 'article-1',
    });
  });
});
