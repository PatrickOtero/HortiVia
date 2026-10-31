import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import {
  FilterChip,
  InputField,
  PrimaryButton,
  SecondaryButton,
} from '../../../../components';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import { useAuth } from '../../../auth/hooks/useAuth';
import { productsService } from '../../../products/services/products.service';
import { AdminProductFormScreen } from './index';

jest.mock('../../../auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../../products/services/products.service', () => ({
  productsService: {
    getProductById: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    uploadProductImage: jest.fn(),
  },
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedProductsService = productsService as jest.Mocked<
  typeof productsService
>;

const adminUser = {
  id: 'admin-1',
  name: 'Admin',
  email: 'admin@hortivia.test',
  role: 'ADMIN',
  avatarUrl: null,
  gender: null,
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as NonNullable<ReturnType<typeof useAuth>['user']>;

const savedProduct = {
  id: 'product-1',
  name: 'Tomate',
  slug: 'tomate',
  category: 'VEGETABLE' as const,
  shortDescription: 'Resumo curto',
  imageUrl: null,
  benefits: [],
  howToChoose: [],
  howToStore: [],
  usageTips: [],
  nutrients: [],
  mainImages: [],
  guideSections: [],
};

describe('AdminProductFormScreen', () => {
  let renderer: Renderer.ReactTestRenderer | undefined;
  const navigation = {
    goBack: jest.fn(),
    canGoBack: jest.fn(() => true),
    navigate: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    mockedUseAuth.mockReturnValue({ user: adminUser } as ReturnType<
      typeof useAuth
    >);
    mockedProductsService.createProduct.mockResolvedValue(savedProduct);
    mockedProductsService.getProductById.mockResolvedValue(savedProduct);
    mockedProductsService.updateProduct.mockResolvedValue(savedProduct);
  });

  afterEach(async () => {
    if (renderer) await act(async () => renderer?.unmount());
    renderer = undefined;
  });

  async function render(productId?: string) {
    await act(async () => {
      renderer = Renderer.create(
        <ThemeProvider>
          <AdminProductFormScreen
            navigation={navigation as never}
            route={
              {
                key: 'AdminProductForm',
                name: 'AdminProductForm',
                params: productId ? { productId } : undefined,
              } as never
            }
          />
        </ThemeProvider>,
      );
    });
    return renderer!;
  }

  async function fillRequiredFields(tree: Renderer.ReactTestRenderer) {
    await act(async () => {
      tree.root
        .findAllByType(InputField)
        .find(input => input.props.label === 'Nome')
        ?.props.onChangeText('Tomate');
      tree.root
        .findAllByType(InputField)
        .find(input => input.props.label === 'Descrição curta')
        ?.props.onChangeText('Resumo curto');
      tree.root
        .findAllByType(FilterChip)
        .find(chip => chip.props.label === 'Verdura')
        ?.props.onPress();
    });
  }

  it('shows validation for required fields without calling the service', async () => {
    const tree = await render();
    const save = tree.root
      .findAllByType(PrimaryButton)
      .find(button => button.props.children === 'Salvar produto');

    await act(async () => save?.props.onPress());

    expect(mockedProductsService.createProduct).not.toHaveBeenCalled();
    expect(JSON.stringify(tree.toJSON())).toContain(
      'Informe o nome do produto.',
    );
    expect(JSON.stringify(tree.toJSON())).toContain('Selecione uma categoria.');
    expect(JSON.stringify(tree.toJSON())).toContain('Informe um resumo curto.');
  });

  it('creates a product with the existing API payload and returns after confirmation', async () => {
    const tree = await render();
    await fillRequiredFields(tree);
    const save = tree.root
      .findAllByType(PrimaryButton)
      .find(button => button.props.children === 'Salvar produto');

    await act(async () => save?.props.onPress());

    expect(mockedProductsService.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Tomate',
        category: 'VEGETABLE',
        shortDescription: 'Resumo curto',
        benefits: [],
        nutrients: [],
      }),
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      'Produto salvo.',
      undefined,
      expect.any(Array),
    );
    const alertCalls = jest.mocked(Alert.alert).mock.calls;
    const buttons = alertCalls[alertCalls.length - 1]?.[2];
    await act(async () => buttons?.[0]?.onPress?.());
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('loads an existing product and presents the visual-content navigation', async () => {
    const tree = await render('product-1');
    expect(mockedProductsService.getProductById).toHaveBeenCalledWith(
      'product-1',
    );
    expect(JSON.stringify(tree.toJSON())).toContain('Tomate');

    const visualContentButton = tree.root
      .findAllByType(SecondaryButton)
      .find(button => button.props.children === 'Conteúdo visual');
    await act(async () => visualContentButton?.props.onPress());
    expect(navigation.navigate).toHaveBeenCalledWith(
      'AdminProductVisualContent',
      { productId: 'product-1' },
    );
  });

  it('keeps the administrative screen unavailable to regular users', async () => {
    mockedUseAuth.mockReturnValue({
      user: { ...adminUser, role: 'USER' },
    } as ReturnType<typeof useAuth>);

    const tree = await render();

    expect(JSON.stringify(tree.toJSON())).toContain(
      'Você não pode acessar esta área.',
    );
    expect(mockedProductsService.createProduct).not.toHaveBeenCalled();
    expect(mockedProductsService.getProductById).not.toHaveBeenCalled();
  });
});
