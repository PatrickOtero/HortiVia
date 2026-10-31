import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { productsService } from '../../products/services/products.service';
import type { ProductDetail } from '../../products/types/product';
import { useAdminProductVisualContent } from './useAdminProductVisualContent';

jest.mock('../../products/services/products.service', () => ({
  productsService: { getProductById: jest.fn() },
}));

const product = (id: string) => ({ id, name: id } as ProductDetail);

describe('useAdminProductVisualContent', () => {
  let tree: Renderer.ReactTestRenderer;
  let current: ReturnType<typeof useAdminProductVisualContent>;

  function Probe({ productId }: { productId: string }) {
    current = useAdminProductVisualContent(productId);
    return null;
  }

  afterEach(async () => {
    await act(async () => tree?.unmount());
    jest.clearAllMocks();
  });

  it('ignores responses for a product that is no longer selected', async () => {
    let finishOld!: (value: ProductDetail) => void;
    let finishNew!: (value: ProductDetail) => void;
    (productsService.getProductById as jest.Mock)
      .mockReturnValueOnce(
        new Promise(resolve => {
          finishOld = resolve;
        }),
      )
      .mockReturnValueOnce(
        new Promise(resolve => {
          finishNew = resolve;
        }),
      );

    await act(async () => {
      tree = Renderer.create(<Probe productId="old-product" />);
    });
    await act(async () => tree.update(<Probe productId="new-product" />));

    expect(current.product).toBeNull();
    expect(current.isLoading).toBe(true);
    await act(async () => finishNew(product('new-product')));
    expect(current.product?.id).toBe('new-product');
    await act(async () => finishOld(product('old-product')));
    expect(current.product?.id).toBe('new-product');
    expect(current.isLoading).toBe(false);
  });

  it('can retry the initial load after a network failure', async () => {
    (productsService.getProductById as jest.Mock)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(product('retry-product'));

    await act(async () => {
      tree = Renderer.create(<Probe productId="retry-product" />);
    });
    expect(current.product).toBeNull();
    expect(current.errorMessage).toBe(
      'Não foi possível carregar o conteúdo visual.',
    );

    await act(async () => current.refresh());
    expect(current.product?.id).toBe('retry-product');
    expect(current.errorMessage).toBe('');
  });
});
