import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { productsService } from '../services/products.service';
import type { ProductListItem, PaginatedResponse } from '../types/product';
import { useProducts } from './useProducts';

jest.mock('../services/products.service', () => ({
  PRODUCTS_PAGE_LIMIT: 20,
  productsService: { listProducts: jest.fn() },
}));

const mockedProductsService = productsService as jest.Mocked<typeof productsService>;

function product(id: string): ProductListItem {
  return {
    id,
    name: id,
    slug: id,
    category: 'FRUIT',
    shortDescription: '',
    imageUrl: null,
  };
}

function page(
  data: ProductListItem[],
  currentPage: number,
  totalPages: number,
): PaginatedResponse<ProductListItem> {
  return {
    data,
    meta: { page: currentPage, limit: 20, total: totalPages * 20, totalPages },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe('useProducts pagination', () => {
  type HookSnapshot = ReturnType<typeof useProducts>;
  let latestHook: HookSnapshot | null = null;
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  let filters: { activeCategory: 'ALL' | 'FRUIT'; searchQuery: string };

  function HookProbe() {
    latestHook = useProducts(filters);
    return null;
  }

  async function mount() {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<HookProbe />);
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    latestHook = null;
    filters = { activeCategory: 'ALL', searchQuery: '' };
  });

  afterEach(async () => {
    await ReactTestRenderer.act(async () => renderer?.unmount());
  });

  it('loads page one, appends a deduplicated next page, then stops at totalPages', async () => {
    mockedProductsService.listProducts
      .mockResolvedValueOnce(page([product('p1'), product('p2')], 1, 2))
      .mockResolvedValueOnce(page([product('p2'), product('p3')], 2, 2));

    await mount();
    expect(mockedProductsService.listProducts).toHaveBeenCalledWith({
      search: undefined,
      category: undefined,
      page: 1,
      limit: 20,
    });
    expect(latestHook?.hasMore).toBe(true);

    await ReactTestRenderer.act(async () => latestHook?.loadMore());
    expect(mockedProductsService.listProducts).toHaveBeenLastCalledWith({
      search: undefined,
      category: undefined,
      page: 2,
      limit: 20,
    });
    expect(latestHook?.products.map(item => item.id)).toEqual(['p1', 'p2', 'p3']);
    expect(latestHook?.hasMore).toBe(false);

    await ReactTestRenderer.act(async () => latestHook?.loadMore());
    expect(mockedProductsService.listProducts).toHaveBeenCalledTimes(2);
  });

  it('prevents duplicate in-flight page requests', async () => {
    const nextPage = deferred<PaginatedResponse<ProductListItem>>();
    mockedProductsService.listProducts
      .mockResolvedValueOnce(page([product('p1')], 1, 2))
      .mockReturnValueOnce(nextPage.promise);
    await mount();

    await ReactTestRenderer.act(async () => {
      latestHook?.loadMore().catch(() => undefined);
      latestHook?.loadMore().catch(() => undefined);
    });
    expect(mockedProductsService.listProducts).toHaveBeenCalledTimes(2);
    expect(latestHook?.isLoadingMore).toBe(true);

    await ReactTestRenderer.act(async () => {
      nextPage.resolve(page([product('p2')], 2, 2));
      await nextPage.promise;
    });
    expect(latestHook?.products.map(item => item.id)).toEqual(['p1', 'p2']);
  });

  it('blocks automatic retries after failure and allows exactly one manual retry', async () => {
    const manualRetry = deferred<PaginatedResponse<ProductListItem>>();
    mockedProductsService.listProducts
      .mockResolvedValueOnce(page([product('p1')], 1, 3))
      .mockRejectedValueOnce(new Error('network'))
      .mockReturnValueOnce(manualRetry.promise)
      .mockResolvedValueOnce(page([product('p3')], 3, 3));
    await mount();

    await ReactTestRenderer.act(async () => latestHook?.loadMore());
    expect(latestHook?.products.map(item => item.id)).toEqual(['p1']);
    expect(latestHook?.loadMoreError).toBe('Não foi possível carregar mais produtos.');

    await ReactTestRenderer.act(async () => {
      await latestHook?.loadMore();
      await latestHook?.loadMore();
    });
    expect(mockedProductsService.listProducts).toHaveBeenCalledTimes(2);
    expect(latestHook?.products.map(item => item.id)).toEqual(['p1']);

    await ReactTestRenderer.act(async () => {
      latestHook?.retryLoadMore().catch(() => undefined);
      latestHook?.retryLoadMore().catch(() => undefined);
    });
    expect(mockedProductsService.listProducts).toHaveBeenCalledTimes(3);

    await ReactTestRenderer.act(async () => {
      manualRetry.resolve(page([product('p2')], 2, 3));
      await manualRetry.promise;
    });
    expect(latestHook?.products.map(item => item.id)).toEqual(['p1', 'p2']);
    expect(latestHook?.loadMoreError).toBeNull();

    await ReactTestRenderer.act(async () => latestHook?.loadMore());
    expect(mockedProductsService.listProducts).toHaveBeenCalledTimes(4);
    expect(latestHook?.products.map(item => item.id)).toEqual(['p1', 'p2', 'p3']);
  });

  it('clears a failed-page block when refreshing the first page', async () => {
    mockedProductsService.listProducts
      .mockResolvedValueOnce(page([product('p1')], 1, 2))
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(page([product('p1-refreshed')], 1, 2))
      .mockResolvedValueOnce(page([product('p2')], 2, 2));
    await mount();

    await ReactTestRenderer.act(async () => latestHook?.loadMore());
    expect(latestHook?.loadMoreError).not.toBeNull();

    await ReactTestRenderer.act(async () => latestHook?.refresh());
    expect(latestHook?.products.map(item => item.id)).toEqual(['p1-refreshed']);
    expect(latestHook?.loadMoreError).toBeNull();
    await ReactTestRenderer.act(async () => latestHook?.loadMore());
    expect(mockedProductsService.listProducts).toHaveBeenCalledTimes(4);
    expect(latestHook?.products.map(item => item.id)).toEqual([
      'p1-refreshed',
      'p2',
    ]);
  });

  it('resets page and ignores an old response after the category changes', async () => {
    const oldRequest = deferred<PaginatedResponse<ProductListItem>>();
    mockedProductsService.listProducts
      .mockReturnValueOnce(oldRequest.promise)
      .mockResolvedValueOnce(page([product('vegetable')], 1, 1));
    await mount();

    await ReactTestRenderer.act(async () => {
      filters = { activeCategory: 'FRUIT', searchQuery: '' };
      renderer.update(<HookProbe />);
    });
    await ReactTestRenderer.act(async () => {
      oldRequest.resolve(page([product('stale')], 1, 1));
      await oldRequest.promise;
    });

    expect(mockedProductsService.listProducts).toHaveBeenLastCalledWith({
      search: undefined,
      category: 'FRUIT',
      page: 1,
      limit: 20,
    });
    expect(latestHook?.products.map(item => item.id)).toEqual(['vegetable']);
  });

  it('debounces a search change, requests page one, and ignores the prior search response', async () => {
    const oldRequest = deferred<PaginatedResponse<ProductListItem>>();
    mockedProductsService.listProducts
      .mockReturnValueOnce(oldRequest.promise)
      .mockResolvedValueOnce(page([product('apple-result')], 1, 1));
    await mount();

    await ReactTestRenderer.act(async () => {
      filters = { activeCategory: 'ALL', searchQuery: 'apple' };
      renderer.update(<HookProbe />);
    });
    expect(mockedProductsService.listProducts).toHaveBeenCalledTimes(1);

    await ReactTestRenderer.act(async () => {
      await new Promise(resolve => setTimeout(resolve, 360));
    });
    await ReactTestRenderer.act(async () => {
      oldRequest.resolve(page([product('stale-result')], 1, 1));
      await oldRequest.promise;
    });

    expect(mockedProductsService.listProducts).toHaveBeenLastCalledWith({
      search: 'apple',
      category: undefined,
      page: 1,
      limit: 20,
    });
    expect(latestHook?.products.map(item => item.id)).toEqual(['apple-result']);
  });

  it('unblocks pagination after a new search loads its first page', async () => {
    mockedProductsService.listProducts
      .mockResolvedValueOnce(page([product('old')], 1, 2))
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(page([product('new')], 1, 2))
      .mockResolvedValueOnce(page([product('new-next')], 2, 2));
    await mount();

    await ReactTestRenderer.act(async () => latestHook?.loadMore());
    expect(latestHook?.loadMoreError).not.toBeNull();

    await ReactTestRenderer.act(async () => {
      filters = { activeCategory: 'ALL', searchQuery: 'apple' };
      renderer.update(<HookProbe />);
    });
    await ReactTestRenderer.act(async () => {
      await new Promise(resolve => setTimeout(resolve, 360));
    });
    expect(latestHook?.products.map(item => item.id)).toEqual(['new']);
    expect(latestHook?.loadMoreError).toBeNull();

    await ReactTestRenderer.act(async () => latestHook?.loadMore());
    expect(mockedProductsService.listProducts).toHaveBeenCalledTimes(4);
    expect(latestHook?.products.map(item => item.id)).toEqual(['new', 'new-next']);
  });
});
