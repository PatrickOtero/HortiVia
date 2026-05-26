import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addRecentProduct,
  clearRecentProducts,
  getRecentProducts,
  MAX_RECENT_PRODUCTS,
} from './recentProducts.storage';

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('recentProducts.storage', () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};

    mockedAsyncStorage.getItem.mockImplementation(async key => storage[key] ?? null);
    mockedAsyncStorage.setItem.mockImplementation(async (key, value) => {
      storage[key] = value;
    });
    mockedAsyncStorage.removeItem.mockImplementation(async key => {
      delete storage[key];
    });
  });

  function createProduct(index: number) {
    return {
      id: `product-${index}`,
      name: `Produto ${index}`,
      slug: `produto-${index}`,
      category: 'FRUIT' as const,
      shortDescription: `Descrição ${index}`,
      imageUrl: `https://cdn.hortivia.com/produto-${index}.jpg`,
      isFavorite: false,
    };
  }

  it('adds a product as the most recent item', async () => {
    await addRecentProduct(createProduct(1));

    const recentProducts = await getRecentProducts();

    expect(recentProducts).toHaveLength(1);
    expect(recentProducts[0]?.id).toBe('product-1');
  });

  it('does not duplicate a product and keeps it as the newest item', async () => {
    await addRecentProduct(createProduct(1));
    await addRecentProduct(createProduct(2));
    await addRecentProduct(createProduct(1));

    const recentProducts = await getRecentProducts();

    expect(recentProducts).toHaveLength(2);
    expect(recentProducts[0]?.id).toBe('product-1');
    expect(recentProducts[1]?.id).toBe('product-2');
  });

  it('keeps the recent products list limited to the configured max size', async () => {
    for (let index = 1; index <= MAX_RECENT_PRODUCTS + 2; index += 1) {
      await addRecentProduct(createProduct(index));
    }

    const recentProducts = await getRecentProducts();

    expect(recentProducts).toHaveLength(MAX_RECENT_PRODUCTS);
    expect(recentProducts[0]?.id).toBe(`product-${MAX_RECENT_PRODUCTS + 2}`);
  });

  it('clearRecentProducts removes all stored items', async () => {
    await addRecentProduct(createProduct(1));
    await clearRecentProducts();

    const recentProducts = await getRecentProducts();

    expect(recentProducts).toEqual([]);
  });
});
