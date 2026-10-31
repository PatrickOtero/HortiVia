import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import { useAuth } from '../../../auth/hooks/useAuth';
import { productsService } from '../../../products/services/products.service';
import type { ProductListItem } from '../../../products/types/product';
import { AdminListItem } from '../../components/AdminListItem';
import { AdminProductsScreen } from './index';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void | (() => void)) =>
    jest
      .requireActual<typeof import('react')>('react')
      .useEffect(callback, [callback]),
}));
jest.mock('../../../auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../../products/services/products.service', () => ({
  productsService: { getProducts: jest.fn(), deleteProduct: jest.fn() },
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedProductsService = productsService as jest.Mocked<
  typeof productsService
>;

const product: ProductListItem = {
  id: 'product-1',
  name: 'Tomate',
  slug: 'tomate',
  category: 'VEGETABLE',
  shortDescription: 'Resumo curto',
  imageUrl: null,
};

function page(items: ProductListItem[]) {
  return {
    data: items,
    meta: { page: 1, limit: 20, total: items.length, totalPages: 1 },
  };
}

describe('AdminProductsScreen', () => {
  let renderer: Renderer.ReactTestRenderer | undefined;
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    mockedUseAuth.mockReturnValue({
      user: { role: 'ADMIN' },
    } as ReturnType<typeof useAuth>);
    mockedProductsService.getProducts.mockResolvedValue(page([product]));
    mockedProductsService.deleteProduct.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    if (renderer) await act(async () => renderer?.unmount());
    renderer = undefined;
  });

  async function render() {
    await act(async () => {
      renderer = Renderer.create(
        <ThemeProvider>
          <AdminProductsScreen
            navigation={navigation as never}
            route={{ key: 'AdminProducts', name: 'AdminProducts' } as never}
          />
        </ThemeProvider>,
      );
    });
    return renderer!;
  }

  it('loads the existing first page and keeps create/edit/content navigation', async () => {
    const tree = await render();
    expect(mockedProductsService.getProducts).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
    });
    const item = tree.root.findByType(AdminListItem);
    await act(async () => item.props.onEdit());
    expect(navigation.navigate).toHaveBeenCalledWith('AdminProductForm', {
      productId: 'product-1',
    });
    await act(async () => item.props.onExtraAction());
    expect(navigation.navigate).toHaveBeenCalledWith(
      'AdminProductVisualContent',
      { productId: 'product-1' },
    );
  });

  it('requires confirmation before deleting and refreshes after confirmation', async () => {
    mockedProductsService.getProducts
      .mockResolvedValueOnce(page([product]))
      .mockResolvedValueOnce(page([]));
    const tree = await render();
    await act(async () => tree.root.findByType(AdminListItem).props.onDelete());

    expect(mockedProductsService.deleteProduct).not.toHaveBeenCalled();
    const calls = jest.mocked(Alert.alert).mock.calls;
    const buttons = calls[calls.length - 1]?.[2];
    expect(buttons?.[0]?.text).toBe('Cancelar');
    await act(async () => buttons?.[0]?.onPress?.());
    expect(mockedProductsService.deleteProduct).not.toHaveBeenCalled();

    await act(async () => tree.root.findByType(AdminListItem).props.onDelete());
    const confirmedCalls = jest.mocked(Alert.alert).mock.calls;
    const confirmedButtons = confirmedCalls[confirmedCalls.length - 1]?.[2];
    await act(async () => confirmedButtons?.[1]?.onPress?.());

    expect(mockedProductsService.deleteProduct).toHaveBeenCalledWith(
      'product-1',
    );
    expect(mockedProductsService.getProducts).toHaveBeenCalledTimes(2);
  });
});
