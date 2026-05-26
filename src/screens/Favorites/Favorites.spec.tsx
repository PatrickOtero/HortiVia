import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { EmptyStateCard } from '../../components';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { FavoritesScreen } from './index';
import { useFavoriteProducts } from '../../features/products/hooks/useFavoriteProducts';

jest.mock('../../features/products/hooks/useFavoriteProducts', () => ({
  useFavoriteProducts: jest.fn(),
}));

const mockedUseFavoriteProducts = useFavoriteProducts as jest.Mock;

describe('FavoritesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the empty state when the user has no favorite products', async () => {
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
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <FavoritesScreen
            navigation={{ navigate: jest.fn() } as never}
            route={{ key: 'Favorites', name: 'Favorites' } as never}
          />
        </ThemeProvider>,
      );
    });

    const emptyStateCard = renderer!.root.findByType(EmptyStateCard);

    expect(emptyStateCard.props.title).toBe('Nenhum produto favorito ainda.');
    expect(emptyStateCard.props.description).toBe(
      'Salve produtos para encontrá-los mais rápido depois.',
    );
  });
});
