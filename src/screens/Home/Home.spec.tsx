import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  ArticleCard,
  CompactArticleCard,
  EmptyStateCard,
  FilterChip,
  ProductCard,
  RecentProductCard,
  SearchInput,
  SectionTitle,
} from '../../components';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useArticles } from '../../features/articles/hooks/useArticles';
import { useSavedArticles } from '../../features/articles/hooks/useSavedArticles';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useFavoriteProducts } from '../../features/products/hooks/useFavoriteProducts';
import { useRecentProducts } from '../../features/products/hooks/useRecentProducts';
import { useProducts } from '../../features/products/hooks/useProducts';
import { productsService } from '../../features/products/services/products.service';
import { HomeScreen } from './index';

jest.mock('../../features/products/hooks/useProducts', () => ({
  useProducts: jest.fn(),
}));

jest.mock('../../features/products/hooks/useFavoriteProducts', () => ({
  useFavoriteProducts: jest.fn(),
}));

jest.mock('../../features/products/hooks/useRecentProducts', () => ({
  useRecentProducts: jest.fn(),
}));

jest.mock('../../features/products/services/products.service', () => ({
  productsService: {
    favoriteProduct: jest.fn(),
    unfavoriteProduct: jest.fn(),
  },
}));

jest.mock('../../features/articles/hooks/useArticles', () => ({
  useArticles: jest.fn(),
}));

jest.mock('../../features/articles/hooks/useSavedArticles', () => ({
  useSavedArticles: jest.fn(),
}));

jest.mock('../../features/auth/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseProducts = useProducts as jest.Mock;
const mockedUseFavoriteProducts = useFavoriteProducts as jest.Mock;
const mockedUseRecentProducts = useRecentProducts as jest.Mock;
const mockedUseArticles = useArticles as jest.Mock;
const mockedUseSavedArticles = useSavedArticles as jest.Mock;
const mockedProductsService = productsService as jest.Mocked<typeof productsService>;

function createDefaultProduct(overrides?: Record<string, unknown>) {
  return {
    id: 'product-1',
    name: 'Abacate',
    slug: 'abacate',
    category: 'FRUIT',
    shortDescription: 'Cremoso e nutritivo.',
    imageUrl: null,
    isFavorite: false,
    ...overrides,
  };
}

function createDefaultArticle(overrides?: Record<string, unknown>) {
  return {
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
    ...overrides,
  };
}

describe('HomeScreen', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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
      products: [createDefaultProduct()],
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
    mockedUseArticles.mockReturnValue({
      articles: [createDefaultArticle()],
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
    mockedUseFavoriteProducts.mockReturnValue({
      products: [],
    });
    mockedUseRecentProducts.mockReturnValue({
      recentProducts: [],
    });
    mockedUseSavedArticles.mockReturnValue({
      articles: [],
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

  it('does not render library sections on home', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderHome();
    });

    const titleValues = renderer!.root
      .findAllByType(SectionTitle)
      .map(sectionTitle => sectionTitle.props.title);

    expect(titleValues).not.toContain('Favoritos');
    expect(titleValues).not.toContain('Produtos favoritos');
    expect(titleValues).not.toContain('Vistos recentemente');
    expect(titleValues).not.toContain('Leituras salvas');
    expect(renderer!.root.findAllByType(RecentProductCard)).toHaveLength(0);
    expect(renderer!.root.findAllByType(CompactArticleCard)).toHaveLength(0);
  });

  it('does not render a library shortcut when the tab already exposes biblioteca', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderHome();
    });

    const textNodes = renderer!.root
      .findAll(node => typeof node.props.children === 'string')
      .map(node => node.props.children);

    expect(textNodes).not.toContain('Sua biblioteca');
    expect(textNodes).not.toContain('Abrir biblioteca');
  });

  it('does not load library hooks on home', async () => {
    await ReactTestRenderer.act(async () => {
      renderHome();
    });

    expect(mockedUseFavoriteProducts).not.toHaveBeenCalled();
    expect(mockedUseRecentProducts).not.toHaveBeenCalled();
    expect(mockedUseSavedArticles).not.toHaveBeenCalled();
  });

  it('renders search, categories, product discovery and article discovery', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderHome();
    });

    const titleValues = renderer!.root
      .findAllByType(SectionTitle)
      .map(sectionTitle => sectionTitle.props.title);

    expect(renderer!.root.findAllByType(SearchInput)).toHaveLength(1);
    expect(renderer!.root.findAllByType(FilterChip)).toHaveLength(4);
    expect(renderer!.root.findAllByType(ProductCard)).toHaveLength(1);
    expect(renderer!.root.findAllByType(ArticleCard)).toHaveLength(1);
    expect(titleValues).toContain('Categorias');
    expect(titleValues).toContain('Guia de produtos');
    expect(titleValues).toContain('Conteúdos educativos');
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

  it('opens article detail when tapping an article preview', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderHome();
    });

    const articleCard = renderer!.root.findByType(ArticleCard);

    await ReactTestRenderer.act(async () => {
      articleCard.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('ArticleDetail', {
      articleId: 'article-1',
    });
  });

  it('renders main list products as favorite when product data is already favorite', async () => {
    mockedUseProducts.mockReturnValue({
      categories: [{ value: 'ALL', label: 'Todos' }],
      products: [createDefaultProduct({ isFavorite: true })],
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

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderHome();
    });

    const productCard = renderer!.root.findByType(ProductCard);

    expect(productCard.props.isFavorite).toBe(true);
  });

  it('toggles a product favorite from the main list', async () => {
    mockedProductsService.favoriteProduct.mockResolvedValue({
      message: 'Produto adicionado aos favoritos.',
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderHome();
    });

    const productCard = renderer!.root.findByType(ProductCard);

    await ReactTestRenderer.act(async () => {
      await productCard.props.onToggleFavorite();
    });

    expect(mockedProductsService.favoriteProduct).toHaveBeenCalledWith('product-1');
    expect(renderer!.root.findByType(ProductCard).props.isFavorite).toBe(true);
  });

  it('removes favorite state from the main list when unfavoriting a product', async () => {
    mockedUseProducts.mockReturnValue({
      categories: [{ value: 'ALL', label: 'Todos' }],
      products: [createDefaultProduct({ isFavorite: true })],
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
    mockedProductsService.unfavoriteProduct.mockResolvedValue({
      message: 'Produto removido dos favoritos.',
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderHome();
    });

    const productCard = renderer!.root.findByType(ProductCard);

    await ReactTestRenderer.act(async () => {
      await productCard.props.onToggleFavorite();
    });

    expect(mockedProductsService.unfavoriteProduct).toHaveBeenCalledWith(
      'product-1',
    );
    expect(renderer!.root.findByType(ProductCard).props.isFavorite).toBe(false);
  });
});
