import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { productsService } from '../../products/services/products.service';
import type { ProductListItem } from '../../products/types/product';
import { useAdminProducts } from './useAdminProducts';

jest.mock('../../products/services/products.service', () => ({
  productsService: {
    getProducts: jest.fn(),
    deleteProduct: jest.fn(),
  },
}));

const mockedProductsService = productsService as jest.Mocked<
  typeof productsService
>;

function product(id: string): ProductListItem {
  return {
    id,
    name: id,
    slug: id,
    category: 'FRUIT',
    shortDescription: 'Resumo',
    imageUrl: null,
  };
}

function page(items: ProductListItem[]) {
  return {
    data: items,
    meta: { page: 1, limit: 20, total: items.length, totalPages: 1 },
  };
}

describe('useAdminProducts', () => {
  let tree: Renderer.ReactTestRenderer | undefined;
  let state: ReturnType<typeof useAdminProducts>;

  function Probe() {
    state = useAdminProducts();
    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockedProductsService.getProducts.mockResolvedValue(page([product('one')]));
  });

  afterEach(async () => {
    if (tree) await act(async () => tree?.unmount());
    tree = undefined;
  });

  it('uses the current first-page limit and ignores concurrent duplicate loads', async () => {
    let finish!: (value: ReturnType<typeof page>) => void;
    mockedProductsService.getProducts.mockReturnValue(
      new Promise(resolve => (finish = resolve)),
    );
    await act(async () => {
      tree = Renderer.create(<Probe />);
    });

    await act(async () => {
      const first = state.loadProducts();
      const duplicate = state.loadProducts(true);
      expect(mockedProductsService.getProducts).toHaveBeenCalledTimes(1);
      expect(mockedProductsService.getProducts).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
      finish(page([product('one')]));
      await Promise.all([first, duplicate]);
    });
    expect(state.products.map(item => item.id)).toEqual(['one']);
  });

  it('removes the product after confirmation handling and refreshes the list', async () => {
    mockedProductsService.getProducts
      .mockResolvedValueOnce(page([product('one'), product('two')]))
      .mockResolvedValueOnce(page([product('two')]));
    await act(async () => {
      tree = Renderer.create(<Probe />);
    });

    await act(async () => state.loadProducts());
    let first!: Promise<boolean>;
    let duplicate!: Promise<boolean>;
    let results!: boolean[];
    await act(async () => {
      first = state.deleteProduct('one');
      duplicate = state.deleteProduct('one');
      expect(mockedProductsService.deleteProduct).toHaveBeenCalledTimes(1);
      results = await Promise.all([first, duplicate]);
    });

    expect(results).toEqual([true, false]);
    expect(mockedProductsService.getProducts).toHaveBeenCalledTimes(2);
    expect(state.products.map(item => item.id)).toEqual(['two']);
    expect(state.feedbackMessage).toBe('Produto removido.');
  });

  it('does not update state when the screen unmounts during a request', async () => {
    let finish!: (value: ReturnType<typeof page>) => void;
    mockedProductsService.getProducts.mockReturnValue(
      new Promise(resolve => (finish = resolve)),
    );
    await act(async () => {
      tree = Renderer.create(<Probe />);
    });
    let pending!: Promise<void>;
    await act(async () => {
      pending = state.loadProducts();
    });
    await act(async () => tree?.unmount());
    await act(async () => finish(page([product('late')])));
    await pending;

    expect(state.products).toEqual([]);
    tree = undefined;
  });
});
