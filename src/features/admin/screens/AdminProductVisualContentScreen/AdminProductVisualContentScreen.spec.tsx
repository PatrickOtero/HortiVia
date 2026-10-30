import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  FilterChip,
  InputField,
  PrimaryButton,
  SecondaryButton,
} from '../../../../components';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import type { ProductDetail } from '../../../products/types/product';
import { productsService } from '../../../products/services/products.service';
import { useAuth } from '../../../auth/hooks/useAuth';
import { AdminProductVisualContentScreen } from './index';

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('../../../auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));

jest.mock('../../../products/services/products.service', () => ({
  productsService: {
    getProductById: jest.fn(),
    createProductImageWithUpload: jest.fn(),
    updateProductImage: jest.fn(),
    replaceProductImageFile: jest.fn(),
    deleteProductImage: jest.fn(),
    createProductGuideSection: jest.fn(),
    updateProductGuideSection: jest.fn(),
    deleteProductGuideSection: jest.fn(),
    uploadProductGuideSectionImage: jest.fn(),
    removeProductGuideSectionImage: jest.fn(),
  },
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedProductsService = productsService as jest.Mocked<
  typeof productsService
>;
const mockedLaunchImageLibrary = launchImageLibrary as jest.MockedFunction<
  typeof launchImageLibrary
>;

const product = {
  id: 'product-1',
  name: 'Abacate',
  slug: 'abacate',
  category: 'FRUIT',
  shortDescription: 'Fruta para teste.',
  imageUrl: null,
  benefits: [],
  howToChoose: [],
  howToStore: [],
  usageTips: [],
  nutrients: [],
  mainImages: [],
  guideSections: [],
} as ProductDetail;

describe('AdminProductVisualContentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({ user: { role: 'ADMIN' } } as ReturnType<
      typeof useAuth
    >);
    mockedProductsService.getProductById.mockResolvedValue(product);
    mockedProductsService.createProductGuideSection.mockResolvedValue({
      id: 'section-1',
      kind: 'choose',
      title: 'Como escolher',
      body: 'Observe a firmeza.',
      bullets: [],
    });
    mockedProductsService.createProductImageWithUpload.mockResolvedValue({
      id: 'image-1',
      imageUrl: 'https://images.example/abacate.jpg',
      kind: 'HERO',
    });
  });

  async function renderScreen() {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <AdminProductVisualContentScreen
            navigation={{ canGoBack: () => true, goBack: jest.fn() } as never}
            route={
              {
                key: 'visual',
                name: 'AdminProductVisualContent',
                params: { productId: 'product-1' },
              } as never
            }
          />
        </ThemeProvider>,
      );
    });
    return renderer!;
  }

  it('creates a guide section with its typed fields and reloads the product', async () => {
    const renderer = await renderScreen();

    await ReactTestRenderer.act(async () => {
      renderer.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.children === 'Adicionar seção')
        ?.props.onPress();
    });

    const inputs = renderer.root.findAllByType(InputField);
    await ReactTestRenderer.act(async () => {
      inputs
        .find(input => input.props.label === 'Título')
        ?.props.onChangeText('Como escolher');
      inputs
        .find(input => input.props.label === 'Texto principal')
        ?.props.onChangeText('Observe a firmeza.');
      renderer.root
        .findAllByType(FilterChip)
        .find(chip => chip.props.label === 'Como escolher')
        ?.props.onPress();
    });

    await ReactTestRenderer.act(async () => {
      renderer.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.children === 'Salvar')
        ?.props.onPress();
    });

    expect(
      mockedProductsService.createProductGuideSection,
    ).toHaveBeenCalledWith(
      'product-1',
      expect.objectContaining({
        kind: 'CHOOSE',
        title: 'Como escolher',
        body: 'Observe a firmeza.',
      }),
    );
    expect(mockedProductsService.getProductById).toHaveBeenCalledTimes(2);
  });

  it('uploads a selected gallery image with validated image metadata', async () => {
    mockedLaunchImageLibrary.mockResolvedValue({
      didCancel: false,
      assets: [
        {
          uri: 'file:///abacate.jpg',
          fileName: 'abacate.jpg',
          type: 'image/jpeg',
          fileSize: 1024,
        },
      ],
    });
    const renderer = await renderScreen();

    await ReactTestRenderer.act(async () => {
      renderer.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.children === 'Adicionar imagem')
        ?.props.onPress();
    });

    await ReactTestRenderer.act(async () => {
      await renderer.root
        .findAllByType(SecondaryButton)
        .find(button => button.props.children === 'Escolher imagem')
        ?.props.onPress();
    });

    await ReactTestRenderer.act(async () => {
      renderer.root
        .findAllByType(FilterChip)
        .find(chip => chip.props.label === 'Destaque')
        ?.props.onPress();
    });

    await ReactTestRenderer.act(async () => {
      renderer.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.children === 'Salvar')
        ?.props.onPress();
    });

    expect(
      mockedProductsService.createProductImageWithUpload,
    ).toHaveBeenCalledWith(
      'product-1',
      expect.objectContaining({
        uri: 'file:///abacate.jpg',
        type: 'image/jpeg',
      }),
      expect.objectContaining({ kind: 'HERO' }),
    );
    expect(mockedProductsService.getProductById).toHaveBeenCalledTimes(2);
  });
});
