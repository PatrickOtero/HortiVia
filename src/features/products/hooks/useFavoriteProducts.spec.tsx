import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useAuth } from '../../auth/hooks/useAuth';
import { productsService } from '../services/products.service';
import { useFavoriteProducts } from './useFavoriteProducts';

jest.mock('../../auth/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../services/products.service', () => ({
  PRODUCTS_PAGE_LIMIT: 20,
  productsService: {
    listFavoriteProducts: jest.fn(),
  },
}));

const mockedUseAuth = useAuth as jest.Mock;
const mockedProductsService = productsService as jest.Mocked<typeof productsService>;

describe('useFavoriteProducts', () => {
  type HookSnapshot = ReturnType<typeof useFavoriteProducts>;

  let latestHook: HookSnapshot | null = null;

  function HookProbe() {
    latestHook = useFavoriteProducts();
    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    latestHook = null;
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('ends loading after a successful favorites response', async () => {
    mockedProductsService.listFavoriteProducts.mockResolvedValue({
      data: [
        {
          id: 'product-1',
          name: 'Abacate',
          slug: 'abacate',
          category: 'FRUIT',
          shortDescription: 'Cremoso e nutritivo.',
          imageUrl: null,
          isFavorite: true,
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<HookProbe />);
    });

    expect(latestHook?.isLoading).toBe(false);
    expect(latestHook?.products).toHaveLength(1);
    expect(latestHook?.errorMessage).toBeNull();
  });

  it('ends loading after a failed favorites response', async () => {
    mockedProductsService.listFavoriteProducts.mockRejectedValue(
      new Error('request failed'),
    );

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<HookProbe />);
    });

    expect(latestHook?.isLoading).toBe(false);
    expect(latestHook?.products).toEqual([]);
    expect(latestHook?.errorMessage).toBe('Não foi possível carregar seus favoritos.');
  });
  it('upserts a favorite product without duplicating it', async () => {
    mockedProductsService.listFavoriteProducts.mockResolvedValue({
      data: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<HookProbe />);
    });

    await ReactTestRenderer.act(async () => {
      latestHook?.upsertProduct({
        id: 'product-3',
        name: 'Manga',
        slug: 'manga',
        category: 'FRUIT',
        shortDescription: 'Doce e aromÃ¡tica.',
        imageUrl: null,
      });
      latestHook?.upsertProduct({
        id: 'product-3',
        name: 'Manga',
        slug: 'manga',
        category: 'FRUIT',
        shortDescription: 'Doce e aromÃ¡tica.',
        imageUrl: null,
      });
    });

    expect(latestHook?.products).toHaveLength(1);
    expect(latestHook?.products[0]?.id).toBe('product-3');
  });
});
