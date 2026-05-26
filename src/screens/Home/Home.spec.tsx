import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArticleCard,
  EmptyStateCard,
  ProductCard,
  RecentProductCard,
  SectionTitle,
} from '../../components';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useArticles } from '../../features/articles/hooks/useArticles';
import { useFavoriteProducts } from '../../features/products/hooks/useFavoriteProducts';
import { useRecentProducts } from '../../features/products/hooks/useRecentProducts';
import { useProducts } from '../../features/products/hooks/useProducts';
import { HomeScreen } from './index';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('../../features/products/hooks/useProducts', () => ({
  useProducts: jest.fn(),
}));

jest.mock('../../features/products/hooks/useFavoriteProducts', () => ({
  useFavoriteProducts: jest.fn(),
}));

jest.mock('../../features/products/hooks/useRecentProducts', () => ({
  useRecentProducts: jest.fn(),
}));

jest.mock('../../features/articles/hooks/useArticles', () => ({
  useArticles: jest.fn(),
}));

jest.mock('../../features/auth/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const mockedUseFocusEffect = useFocusEffect as jest.Mock;
const mockedUseAuth = useAuth as jest.Mock;
const mockedUseProducts = useProducts as jest.Mock;
const mockedUseFavoriteProducts = useFavoriteProducts as jest.Mock;
const mockedUseRecentProducts = useRecentProducts as jest.Mock;
const mockedUseArticles = useArticles as jest.Mock;

describe('HomeScreen', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseFocusEffect.mockImplementation(callback => {
      callback();
    });
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
    });
    mockedUseProducts.mockReturnValue({
      categories: [
        { value: 'ALL', label: 'Todos' },
        { value: 'FRUIT', label: 'Frutas' },
        { value: 'VEGETABLE', label: 'Verduras' },
        { value: 'LEGUME', label: 'Legumes' },
      ],
      products: [
        {
          id: 'product-1',
          name: 'Abacate',
          slug: 'abacate',
          category: 'FRUIT',
          shortDescription: 'Cremoso e nutritivo.',
          imageUrl: null,
          isFavorite: false,
        },
      ],
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
      retry: jest.fn(),
      refresh: jest.fn(),
    });
    mockedUseFavoriteProducts.mockReturnValue({
      products: [],
      isLoading: false,
      isRefreshing: false,
      isError: false,
      isEmpty: true,
      errorMessage: null,
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      retry: jest.fn(),
      refresh: jest.fn(),
      removeProduct: jest.fn(),
    });
    mockedUseRecentProducts.mockReturnValue({
      recentProducts: [],
      isLoading: false,
      errorMessage: null,
      refreshRecentProducts: jest.fn(),
      clearRecentProducts: jest.fn(),
      removeRecentProduct: jest.fn(),
    });
    mockedUseArticles.mockReturnValue({
      articles: [],
      categories: [],
      isLoading: false,
      isRefreshing: false,
      isError: false,
      isEmpty: true,
      errorMessage: null,
      canOpenArticle: true,
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      retry: jest.fn(),
      refresh: jest.fn(),
    });
  });

  function renderHome() {
    return ReactTestRenderer.create(
      <ThemeProvider>
        <HomeScreen
          navigation={{ navigate } as never}
          route={{ key: 'Home', name: 'Home' } as never}
        />
      </ThemeProvider>,
    );
  }

  it('hides the favorites section when there are no favorite products', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderHome();
    });

    const titleValues = renderer!.root
      .findAllByType(SectionTitle)
      .map(sectionTitle => sectionTitle.props.title);

    expect(titleValues).not.toContain('Favoritos');
  });

  it('shows the favorites section when favorite products exist', async () => {
    mockedUseFavoriteProducts.mockReturnValue({
      products: [
        {
          id: 'product-9',
          name: 'Manga',
          slug: 'manga',
          category: 'FRUIT',
          shortDescription: 'Doce e aromática.',
          imageUrl: null,
          isFavorite: true,
        },
      ],
      isLoading: false,
      isRefreshing: false,
      isError: false,
      isEmpty: false,
      errorMessage: null,
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
      retry: jest.fn(),
      refresh: jest.fn(),
      removeProduct: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderHome();
    });

    const titleValues = renderer!.root
      .findAllByType(SectionTitle)
      .map(sectionTitle => sectionTitle.props.title);
    const recentCards = renderer!.root.findAllByType(RecentProductCard);

    expect(titleValues).toContain('Favoritos');
    expect(recentCards).toHaveLength(1);
  });

  it('hides the recent products section when there are no recent items', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderHome();
    });

    const titleValues = renderer!.root
      .findAllByType(SectionTitle)
      .map(sectionTitle => sectionTitle.props.title);

    expect(titleValues).not.toContain('Vistos recentemente');
  });

  it('shows the recent products section when recent items exist', async () => {
    mockedUseRecentProducts.mockReturnValue({
      recentProducts: [
        {
          id: 'product-2',
          name: 'Manga',
          slug: 'manga',
          category: 'FRUIT',
          shortDescription: 'Doce e aromática.',
          imageUrl: null,
          isFavorite: false,
          viewedAt: '2026-05-25T10:00:00.000Z',
        },
      ],
      isLoading: false,
      errorMessage: null,
      refreshRecentProducts: jest.fn(),
      clearRecentProducts: jest.fn(),
      removeRecentProduct: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderHome();
    });

    const titleValues = renderer!.root
      .findAllByType(SectionTitle)
      .map(sectionTitle => sectionTitle.props.title);

    expect(titleValues).toContain('Vistos recentemente');
  });

  it('shows article preview when articles are available', async () => {
    mockedUseArticles.mockReturnValue({
      articles: [
        {
          id: 'article-1',
          title: 'Como conservar folhas',
          slug: 'como-conservar-folhas',
          summary: 'Dicas simples para manter folhas frescas por mais tempo.',
          category: 'STORAGE',
          imageUrl: null,
          tags: [],
          publishedAt: '2026-05-25T10:00:00.000Z',
          readingTimeMinutes: 4,
          author: {
            id: 'author-1',
            name: 'Equipe HortiVia',
            avatarUrl: null,
          },
        },
      ],
      categories: [],
      isLoading: false,
      isRefreshing: false,
      isError: false,
      isEmpty: false,
      errorMessage: null,
      canOpenArticle: true,
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
      retry: jest.fn(),
      refresh: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderHome();
    });

    const titleValues = renderer!.root
      .findAllByType(SectionTitle)
      .map(sectionTitle => sectionTitle.props.title);
    const articleCards = renderer!.root.findAllByType(ArticleCard);

    expect(titleValues).toContain('Conteúdos educativos');
    expect(articleCards).toHaveLength(1);
  });

  it('shows the empty search state when no products are found', async () => {
    mockedUseProducts.mockReturnValue({
      categories: [],
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
      retry: jest.fn(),
      refresh: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderHome();
    });

    const emptyStateCard = renderer!.root.findByType(EmptyStateCard);

    expect(emptyStateCard.props.title).toBe('Nenhum produto encontrado.');
  });

  it('keeps product card navigation working', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderHome();
    });

    const productCard = renderer!.root.findByType(ProductCard);

    await ReactTestRenderer.act(async () => {
      productCard.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('ProductDetail', {
      productId: 'product-1',
    });
  });
});
