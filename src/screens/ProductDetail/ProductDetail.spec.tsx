import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { CompactArticleCard, PrimaryButton, SectionTitle } from '../../components';
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
