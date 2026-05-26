import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  clearRecentProducts,
  getRecentProducts,
} from '../storage/recentProducts.storage';
import { useRecentProducts } from './useRecentProducts';

jest.mock('../storage/recentProducts.storage', () => ({
  getRecentProducts: jest.fn(),
  clearRecentProducts: jest.fn(),
  removeRecentProduct: jest.fn(),
}));

const mockedGetRecentProducts = getRecentProducts as jest.Mock;
const mockedClearRecentProducts = clearRecentProducts as jest.Mock;

describe('useRecentProducts', () => {
  type HookSnapshot = ReturnType<typeof useRecentProducts>;

  let latestHook: HookSnapshot | null = null;

  function HookProbe() {
    latestHook = useRecentProducts();
    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    latestHook = null;
  });

  it('ends loading after a successful AsyncStorage read', async () => {
    mockedGetRecentProducts.mockResolvedValue([
      {
        id: 'product-1',
        name: 'Abacate',
        slug: 'abacate',
        category: 'FRUIT',
        shortDescription: 'Cremoso e nutritivo.',
        imageUrl: null,
        isFavorite: false,
        viewedAt: '2026-05-26T00:00:00.000Z',
      },
    ]);

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<HookProbe />);
    });

    expect(latestHook?.isLoading).toBe(false);
    expect(latestHook?.recentProducts).toHaveLength(1);
    expect(latestHook?.errorMessage).toBeNull();
  });

  it('ends loading after an AsyncStorage error', async () => {
    mockedGetRecentProducts.mockRejectedValue(new Error('storage failed'));

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<HookProbe />);
    });

    expect(latestHook?.isLoading).toBe(false);
    expect(latestHook?.recentProducts).toEqual([]);
    expect(latestHook?.errorMessage).toBe(
      'Não foi possível carregar os produtos recentes.',
    );
  });

  it('clearRecentProducts clears local state', async () => {
    mockedGetRecentProducts.mockResolvedValue([
      {
        id: 'product-1',
        name: 'Abacate',
        slug: 'abacate',
        category: 'FRUIT',
        shortDescription: 'Cremoso e nutritivo.',
        imageUrl: null,
        isFavorite: false,
        viewedAt: '2026-05-26T00:00:00.000Z',
      },
    ]);
    mockedClearRecentProducts.mockResolvedValue(undefined);

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<HookProbe />);
    });

    await ReactTestRenderer.act(async () => {
      await latestHook?.clearRecentProducts();
    });

    expect(latestHook?.recentProducts).toEqual([]);
  });
});
