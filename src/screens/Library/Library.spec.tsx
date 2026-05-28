import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useFocusEffect } from '@react-navigation/native';
import {
  CompactArticleCard,
  RecentProductCard,
  SectionTitle,
} from '../../components';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useSavedArticles } from '../../features/articles/hooks/useSavedArticles';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useFavoriteProducts } from '../../features/products/hooks/useFavoriteProducts';
import { useRecentProducts } from '../../features/products/hooks/useRecentProducts';
import { productsService } from '../../features/products/services/products.service';
import { LibraryScreen } from './index';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('../../features/auth/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../features/products/hooks/useFavoriteProducts', () => ({
  useFavoriteProducts: jest.fn(),
}));

jest.mock('../../features/products/hooks/useRecentProducts', () => ({
  useRecentProducts: jest.fn(),
}));

jest.mock('../../features/articles/hooks/useSavedArticles', () => ({
  useSavedArticles: jest.fn(),
}));

jest.mock('../../features/products/services/products.service', () => ({
  productsService: {
    favoriteProduct: jest.fn(),
    unfavoriteProduct: jest.fn(),
  },
}));

const mockedUseFocusEffect = useFocusEffect as jest.Mock;
const mockedUseAuth = useAuth as jest.Mock;
const mockedUseFavoriteProducts = useFavoriteProducts as jest.Mock;
const mockedUseRecentProducts = useRecentProducts as jest.Mock;
const mockedUseSavedArticles = useSavedArticles as jest.Mock;
const mockedProductsService = productsService as jest.Mocked<typeof productsService>;

function createFavoriteProduct(overrides?: Record<string, unknown>) {
  return {
    id: 'favorite-1',
    name: 'Abacate',
    slug: 'abacate',
    category: 'FRUIT',
    shortDescription: 'Cremoso e nutritivo.',
    imageUrl: null,
    isFavorite: true,
    ...overrides,
  };
}

function createRecentProduct(overrides?: Record<string, unknown>) {
  return {
    id: 'recent-1',
    name: 'Tomate',
    slug: 'tomate',
    category: 'VEGETABLE',
    shortDescription: 'Bom para saladas e molhos.',
    imageUrl: null,
    isFavorite: false,
    viewedAt: '2026-05-26T10:00:00.000Z',
    ...overrides,
  };
}

function createSavedArticle(overrides?: Record<string, unknown>) {
  return {
    id: 'article-1',
    title: 'Como conservar folhas',
    slug: 'como-conservar-folhas',
    summary: 'Dicas simples para manter folhas frescas.',
    category: 'STORAGE',
    imageUrl: null,
    tags: [],
    publishedAt: '2026-05-26T10:00:00.000Z',
    readingTimeMinutes: 4,
    author: {
      id: 'author-1',
      name: 'Equipe HortiVia',
      avatarUrl: null,
    },
    isSaved: true,
    ...overrides,
  };
}

describe('LibraryScreen', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseFocusEffect.mockImplementation(callback => {
      callback();
    });
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
    });
    mockedUseFavoriteProducts.mockReturnValue({
      products: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      isLoading: false,
      isRefreshing: false,
      isError: false,
      isEmpty: true,
      errorMessage: null,
      retry: jest.fn(),
      refresh: jest.fn(),
      removeProduct: jest.fn(),
      upsertProduct: jest.fn(),
    });
    mockedUseRecentProducts.mockReturnValue({
      recentProducts: [],
      isLoading: false,
      isRefreshing: false,
      errorMessage: null,
      refreshRecentProducts: jest.fn(),
      clearRecentProducts: jest.fn(),
      removeRecentProduct: jest.fn(),
    });
    mockedUseSavedArticles.mockReturnValue({
      articles: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      isLoading: false,
      isRefreshing: false,
      isError: false,
      isEmpty: true,
      errorMessage: null,
      savedArticleIds: new Set(),
      savedArticleLoadingIds: new Set(),
      refreshSavedArticles: jest.fn(),
      retrySavedArticles: jest.fn(),
      isArticleSaved: jest.fn(() => false),
      isArticleSaveLoading: jest.fn(() => false),
      toggleSavedArticle: jest.fn(),
    });
  });

  function renderLibrary() {
    return ReactTestRenderer.create(
      <ThemeProvider>
        <LibraryScreen
          navigation={{ navigate } as never}
          route={{ key: 'Library', name: 'Library' } as never}
        />
      </ThemeProvider>,
    );
  }

  it('renders the three sections and their empty states when the user has no saved content yet', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderLibrary();
    });

    const titles = renderer!.root
      .findAllByType(SectionTitle)
      .map(sectionTitle => sectionTitle.props.title);
    const textNodes = renderer!.root
      .findAll(node => typeof node.props.children === 'string')
      .map(node => node.props.children);

    expect(titles).toContain('Produtos favoritos');
    expect(titles).toContain('Vistos recentemente');
    expect(titles).toContain('Leituras salvas');
    expect(textNodes).toContain('Nenhum produto favorito ainda.');
    expect(textNodes).toContain('Nenhum produto visto recentemente.');
    expect(textNodes).toContain('Nenhuma leitura salva ainda.');
  });

  it('renders favorite products, recent products and saved articles when available', async () => {
    mockedUseFavoriteProducts.mockReturnValue({
      products: [createFavoriteProduct()],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
      isLoading: false,
      isRefreshing: false,
      isError: false,
      isEmpty: false,
      errorMessage: null,
      retry: jest.fn(),
      refresh: jest.fn(),
      removeProduct: jest.fn(),
      upsertProduct: jest.fn(),
    });
    mockedUseRecentProducts.mockReturnValue({
      recentProducts: [createRecentProduct()],
      isLoading: false,
      isRefreshing: false,
      errorMessage: null,
      refreshRecentProducts: jest.fn(),
      clearRecentProducts: jest.fn(),
      removeRecentProduct: jest.fn(),
    });
    mockedUseSavedArticles.mockReturnValue({
      articles: [createSavedArticle()],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
      isLoading: false,
      isRefreshing: false,
      isError: false,
      isEmpty: false,
      errorMessage: null,
      savedArticleIds: new Set(['article-1']),
      savedArticleLoadingIds: new Set(),
      refreshSavedArticles: jest.fn(),
      retrySavedArticles: jest.fn(),
      isArticleSaved: jest.fn(() => true),
      isArticleSaveLoading: jest.fn(() => false),
      toggleSavedArticle: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderLibrary();
    });

    const titles = renderer!.root
      .findAllByType(SectionTitle)
      .map(sectionTitle => sectionTitle.props.title);

    expect(titles).toContain('Produtos favoritos');
    expect(titles).toContain('Vistos recentemente');
    expect(titles).toContain('Leituras salvas');
    expect(renderer!.root.findAllByType(RecentProductCard)).toHaveLength(2);
    expect(renderer!.root.findAllByType(CompactArticleCard)).toHaveLength(1);
  });

  it('opens product detail when tapping a product card', async () => {
    mockedUseFavoriteProducts.mockReturnValue({
      products: [createFavoriteProduct()],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
      isLoading: false,
      isRefreshing: false,
      isError: false,
      isEmpty: false,
      errorMessage: null,
      retry: jest.fn(),
      refresh: jest.fn(),
      removeProduct: jest.fn(),
      upsertProduct: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderLibrary();
    });

    const productCard = renderer!.root.findByType(RecentProductCard);

    await ReactTestRenderer.act(async () => {
      productCard.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('ProductDetail', {
      productId: 'favorite-1',
    });
  });

  it('opens article detail when tapping a saved article card', async () => {
    mockedUseSavedArticles.mockReturnValue({
      articles: [createSavedArticle()],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
      isLoading: false,
      isRefreshing: false,
      isError: false,
      isEmpty: false,
      errorMessage: null,
      savedArticleIds: new Set(['article-1']),
      savedArticleLoadingIds: new Set(),
      refreshSavedArticles: jest.fn(),
      retrySavedArticles: jest.fn(),
      isArticleSaved: jest.fn(() => true),
      isArticleSaveLoading: jest.fn(() => false),
      toggleSavedArticle: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderLibrary();
    });

    const articleCard = renderer!.root.findByType(CompactArticleCard);

    await ReactTestRenderer.act(async () => {
      articleCard.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('ArticleDetail', {
      articleId: 'article-1',
    });
  });

  it('removes a favorite product from biblioteca when unfavoriting', async () => {
    const removeProduct = jest.fn();

    mockedUseFavoriteProducts.mockReturnValue({
      products: [createFavoriteProduct()],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
      isLoading: false,
      isRefreshing: false,
      isError: false,
      isEmpty: false,
      errorMessage: null,
      retry: jest.fn(),
      refresh: jest.fn(),
      removeProduct,
      upsertProduct: jest.fn(),
    });
    mockedProductsService.unfavoriteProduct.mockResolvedValue({
      message: 'Produto removido dos favoritos.',
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderLibrary();
    });

    const productCard = renderer!.root.findByType(RecentProductCard);

    await ReactTestRenderer.act(async () => {
      await productCard.props.onToggleFavorite();
    });

    expect(removeProduct).toHaveBeenCalledWith('favorite-1');
    expect(mockedProductsService.unfavoriteProduct).toHaveBeenCalledWith(
      'favorite-1',
    );
  });

  it('toggles a saved article from biblioteca', async () => {
    const article = createSavedArticle();
    const toggleSavedArticle = jest.fn().mockResolvedValue(undefined);

    mockedUseSavedArticles.mockReturnValue({
      articles: [article],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
      isLoading: false,
      isRefreshing: false,
      isError: false,
      isEmpty: false,
      errorMessage: null,
      savedArticleIds: new Set(['article-1']),
      savedArticleLoadingIds: new Set(),
      refreshSavedArticles: jest.fn(),
      retrySavedArticles: jest.fn(),
      isArticleSaved: jest.fn(() => true),
      isArticleSaveLoading: jest.fn(() => false),
      toggleSavedArticle,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderLibrary();
    });

    const articleCard = renderer!.root.findByType(CompactArticleCard);
    const stopPropagation = jest.fn();

    await ReactTestRenderer.act(async () => {
      await articleCard.props.onToggleSaved({
        stopPropagation,
      });
    });

    expect(stopPropagation).toHaveBeenCalled();
    expect(toggleSavedArticle).toHaveBeenCalledWith(article);
  });
});
