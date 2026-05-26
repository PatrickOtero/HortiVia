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

  it('renders name, category and favorite button with active state', async () => {
    const toggleFavorite = jest.fn();
    const onPress = jest.fn();

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
            onPress={onPress}
          />
        </ThemeProvider>,
      );
    });

    const favoriteButton = renderer!.root.findByType(FavoriteButton);
    const cardButton = renderer!.root.findByProps({ testID: 'product-card' });
    const tree = JSON.stringify(renderer!.toJSON());

    expect(favoriteButton.props.isFavorite).toBe(true);
    expect(tree).toContain('Abacate');
    expect(tree).toContain('Frutas');
    expect(tree).not.toContain('Ver detalhes');

    const stopPropagation = jest.fn();

    await ReactTestRenderer.act(async () => {
      favoriteButton.props.onPress({
        stopPropagation,
      });
    });

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(toggleFavorite).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      cardButton.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('prefers the explicit favorite state over stale product data', async () => {
    mockedUseToggleProductFavorite.mockReturnValue({
      isFavorite: false,
      isSubmitting: false,
      toggleFavorite: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <ProductCard
            product={{
              id: 'product-2',
              name: 'Banana',
              slug: 'banana',
              category: 'FRUIT',
              shortDescription: 'Doce e prÃ¡tica.',
              imageUrl: null,
              isFavorite: false,
            }}
            isFavorite
            onPress={jest.fn()}
          />
        </ThemeProvider>,
      );
    });

    const favoriteButton = renderer!.root.findByType(FavoriteButton);

    expect(favoriteButton.props.isFavorite).toBe(true);
  });
});
