import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useToggleProductFavorite } from './useToggleProductFavorite';
import { useAuth } from '../../auth/hooks/useAuth';
import { productsService } from '../services/products.service';

jest.mock('../../auth/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../services/products.service', () => ({
  productsService: {
    favoriteProduct: jest.fn(),
    unfavoriteProduct: jest.fn(),
  },
}));

const mockedUseAuth = useAuth as jest.Mock;
const mockedProductsService = productsService as jest.Mocked<typeof productsService>;

describe('useToggleProductFavorite', () => {
  type HookSnapshot = ReturnType<typeof useToggleProductFavorite>;

  let latestHook: HookSnapshot | null = null;
  const onRequireAuthSpy = jest.fn();

  function HookProbe() {
    latestHook = useToggleProductFavorite({
      productId: 'product-1',
      initialIsFavorite: false,
      onRequireAuth: onRequireAuthSpy,
    });

    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    latestHook = null;
  });

  it('handles unauthenticated favorite action safely', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<HookProbe />);
    });

    await ReactTestRenderer.act(async () => {
      await latestHook?.toggleFavorite();
    });

    expect(mockedProductsService.favoriteProduct).not.toHaveBeenCalled();
    expect(onRequireAuthSpy).toHaveBeenCalledTimes(1);
  });
});
