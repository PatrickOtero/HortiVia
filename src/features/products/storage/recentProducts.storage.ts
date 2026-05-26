import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProductDetail, ProductListItem, RecentProduct } from '../types/product';

const RECENT_PRODUCTS_KEY = '@hortivia/recent-products';
const MAX_RECENT_PRODUCTS = 10;

type ProductSummary = Pick<
  ProductListItem,
  'id' | 'name' | 'slug' | 'category' | 'shortDescription' | 'imageUrl' | 'isFavorite'
>;

function normalizeStoredRecentProducts(value: unknown): RecentProduct[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): RecentProduct | null => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const recentProduct = item as Partial<RecentProduct>;

      if (
        typeof recentProduct.id !== 'string' ||
        typeof recentProduct.name !== 'string' ||
        typeof recentProduct.slug !== 'string' ||
        typeof recentProduct.category !== 'string' ||
        typeof recentProduct.shortDescription !== 'string' ||
        typeof recentProduct.viewedAt !== 'string'
      ) {
        return null;
      }

      return {
        id: recentProduct.id,
        name: recentProduct.name,
        slug: recentProduct.slug,
        category: recentProduct.category as RecentProduct['category'],
        shortDescription: recentProduct.shortDescription,
        imageUrl: recentProduct.imageUrl ?? null,
        ...(recentProduct.isFavorite !== undefined
          ? { isFavorite: recentProduct.isFavorite }
          : {}),
        viewedAt: recentProduct.viewedAt,
      };
    })
    .filter((item): item is RecentProduct => item !== null);
}

async function readRecentProducts() {
  const storedValue = await AsyncStorage.getItem(RECENT_PRODUCTS_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    return normalizeStoredRecentProducts(JSON.parse(storedValue));
  } catch {
    return [];
  }
}

async function writeRecentProducts(products: RecentProduct[]) {
  await AsyncStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(products));
}

function toRecentProduct(product: ProductSummary): RecentProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    shortDescription: product.shortDescription,
    imageUrl: product.imageUrl ?? null,
    isFavorite: product.isFavorite ?? false,
    viewedAt: new Date().toISOString(),
  };
}

export async function getRecentProducts() {
  return readRecentProducts();
}

export async function addRecentProduct(product: ProductSummary | ProductDetail) {
  const currentProducts = await readRecentProducts();
  const nextProduct = toRecentProduct(product);
  const nextProducts = [
    nextProduct,
    ...currentProducts.filter(item => item.id !== nextProduct.id),
  ].slice(0, MAX_RECENT_PRODUCTS);

  await writeRecentProducts(nextProducts);

  return nextProducts;
}

export async function clearRecentProducts() {
  await AsyncStorage.removeItem(RECENT_PRODUCTS_KEY);
}

export async function removeRecentProduct(productId: string) {
  const currentProducts = await readRecentProducts();
  const nextProducts = currentProducts.filter(product => product.id !== productId);

  await writeRecentProducts(nextProducts);

  return nextProducts;
}

export { MAX_RECENT_PRODUCTS };
