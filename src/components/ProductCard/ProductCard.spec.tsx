import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { FavoriteButton } from '../FavoriteButton';
import { ProductCard } from './index';
import { useToggleProductFavorite } from '../../features/products/hooks/useToggleProductFavorite';

jest.mock('../../features/products/hooks/useToggleProductFavorite', () => ({
  useToggleProductFavorite: jest.fn(),
}));

const mockedUseToggleProductFavorite = useToggleProductFavorite as jest.Mock;

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the favorite button with active state and toggles safely', async () => {
    const toggleFavorite = jest.fn();

    mockedUseToggleProductFavorite.mockReturnValue({
      isFavorite: true,
      isSubmitting: false,
      toggleFavorite,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <ProductCard
            product={{
              id: 'product-1',
              name: 'Abacate',
              slug: 'abacate',
              category: 'FRUIT',
              shortDescription: 'Cremoso e nutritivo.',
              imageUrl: null,
              isFavorite: true,
            }}
            onPress={jest.fn()}
          />
        </ThemeProvider>,
      );
    });

    const favoriteButton = renderer!.root.findByType(FavoriteButton);

    expect(favoriteButton.props.isFavorite).toBe(true);

    const stopPropagation = jest.fn();

    await ReactTestRenderer.act(async () => {
      favoriteButton.props.onPress({
        stopPropagation,
      });
    });

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(toggleFavorite).toHaveBeenCalledTimes(1);
  });
});
