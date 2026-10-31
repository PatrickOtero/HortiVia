import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { launchImageLibrary } from 'react-native-image-picker';
import { productsService } from '../../products/services/products.service';
import type { ProductDetail } from '../../products/types/product';
import { useAdminProductForm } from './useAdminProductForm';

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('../../products/services/products.service', () => ({
  productsService: {
    getProductById: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    uploadProductImage: jest.fn(),
  },
}));

const mockedProductsService = productsService as jest.Mocked<
  typeof productsService
>;
const mockedLaunchImageLibrary = launchImageLibrary as jest.MockedFunction<
  typeof launchImageLibrary
>;

function product(id: string, overrides: Partial<ProductDetail> = {}) {
  return {
    id,
    name: 'Tomate',
    slug: 'tomate',
    category: 'VEGETABLE' as const,
    shortDescription: 'Descrição curta',
    imageUrl: 'https://images.test/tomate.jpg',
    benefits: ['Benefício'],
    howToChoose: ['Escolha'],
    howToStore: ['Conserve'],
    usageTips: ['Use'],
    nutrients: [{ label: 'Nutriente', value: 'valor' }],
    mainImages: [],
    guideSections: [],
    ...overrides,
  };
}

describe('useAdminProductForm', () => {
  let tree: Renderer.ReactTestRenderer | undefined;
  let form: ReturnType<typeof useAdminProductForm>;

  function Probe({ productId }: { productId?: string }) {
    form = useAdminProductForm({ initialProductId: productId });
    return null;
  }

  async function mount(productId?: string) {
    await act(async () => {
      tree = Renderer.create(<Probe productId={productId} />);
    });
  }

  async function fillRequiredFields() {
    await act(async () => {
      form.updateField('name', 'Tomate');
      form.updateField('category', 'VEGETABLE');
      form.updateField('shortDescription', 'Descrição curta');
      form.updateField('benefits', 'Benefício 1\nBenefício 2');
      form.updateField('nutrients', 'Nutriente: valor');
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockedProductsService.createProduct.mockResolvedValue(product('new-id'));
    mockedProductsService.updateProduct.mockResolvedValue(
      product('existing-id'),
    );
    mockedProductsService.getProductById.mockResolvedValue(
      product('existing-id'),
    );
  });

  afterEach(async () => {
    if (tree) await act(async () => tree?.unmount());
    tree = undefined;
  });

  it('loads and maps an existing product for editing', async () => {
    await mount('existing-id');

    expect(mockedProductsService.getProductById).toHaveBeenCalledWith(
      'existing-id',
    );
    expect(form.formValues).toMatchObject({
      name: 'Tomate',
      category: 'VEGETABLE',
      benefits: 'Benefício',
      nutrients: 'Nutriente: valor',
    });
  });

  it('does not apply a load response for a product that is no longer selected', async () => {
    let resolveOld!: (value: ProductDetail) => void;
    let resolveNew!: (value: ProductDetail) => void;
    mockedProductsService.getProductById
      .mockReturnValueOnce(new Promise(resolve => (resolveOld = resolve)))
      .mockReturnValueOnce(new Promise(resolve => (resolveNew = resolve)));

    await mount('old-id');
    await act(async () => tree?.update(<Probe productId="new-id" />));
    await act(async () => resolveNew(product('new-id', { name: 'Novo' })));
    await act(async () => resolveOld(product('old-id', { name: 'Antigo' })));

    expect(form.currentProductId).toBe('new-id');
    expect(form.formValues.name).toBe('Novo');
  });

  it('can retry a failed edit load without leaving stale form data', async () => {
    mockedProductsService.getProductById
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(product('existing-id'));
    await mount('existing-id');

    expect(form.screenError).toBe('Não foi possível carregar os dados.');
    await act(async () => form.reloadProduct());

    expect(form.screenError).toBe('');
    expect(form.formValues.name).toBe('Tomate');
  });

  it('creates a product with parsed multiline content and nutrients', async () => {
    await mount();
    await fillRequiredFields();

    let result!: Awaited<ReturnType<typeof form.handleSubmit>>;
    await act(async () => {
      result = await form.handleSubmit();
    });

    expect(mockedProductsService.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Tomate',
        category: 'VEGETABLE',
        benefits: ['Benefício 1', 'Benefício 2'],
        nutrients: [{ label: 'Nutriente', value: 'valor' }],
      }),
    );
    expect(result).toMatchObject({ status: 'saved', wasEditing: false });
    expect(form.currentProductId).toBe('new-id');
  });

  it('updates an existing product without losing its current fields', async () => {
    await mount('existing-id');
    await act(async () => {
      form.updateField('shortDescription', 'Resumo alterado');
    });

    let result!: Awaited<ReturnType<typeof form.handleSubmit>>;
    await act(async () => {
      result = await form.handleSubmit();
    });

    expect(mockedProductsService.updateProduct).toHaveBeenCalledWith(
      'existing-id',
      expect.objectContaining({ shortDescription: 'Resumo alterado' }),
    );
    expect(result).toMatchObject({ status: 'saved', wasEditing: true });
  });

  it('keeps a saved product and selected image when its upload fails', async () => {
    mockedLaunchImageLibrary.mockResolvedValue({
      didCancel: false,
      errorCode: undefined,
      errorMessage: undefined,
      assets: [
        {
          uri: 'file:///tomate.jpg',
          fileName: 'tomate.jpg',
          type: 'image/jpeg',
          fileSize: 1024,
        },
      ],
    });
    mockedProductsService.uploadProductImage.mockRejectedValue(
      new Error('network error'),
    );
    await mount();

    await act(async () => form.handleSelectImage());
    await fillRequiredFields();
    let result!: Awaited<ReturnType<typeof form.handleSubmit>>;
    await act(async () => {
      result = await form.handleSubmit();
    });

    expect(mockedProductsService.createProduct).toHaveBeenCalledTimes(1);
    expect(mockedProductsService.uploadProductImage).toHaveBeenCalledWith(
      'new-id',
      expect.objectContaining({
        uri: 'file:///tomate.jpg',
        name: 'product-image.jpg',
        type: 'image/jpeg',
      }),
    );
    expect(result).toMatchObject({ status: 'image-upload-failed' });
    expect(form.currentProductId).toBe('new-id');
    expect(form.selectedImageFile?.uri).toBe('file:///tomate.jpg');
    expect(form.formValues.name).toBe('Tomate');
  });

  it('does not start an image upload before a product exists', async () => {
    mockedLaunchImageLibrary.mockResolvedValue({
      didCancel: false,
      errorCode: undefined,
      errorMessage: undefined,
      assets: [
        {
          uri: 'file:///tomate.jpg',
          fileName: 'tomate.jpg',
          type: 'image/jpeg',
          fileSize: 1024,
        },
      ],
    });
    await mount();
    await act(async () => form.handleSelectImage());

    await act(async () => {
      await form.handleUploadImage();
    });

    expect(mockedProductsService.uploadProductImage).not.toHaveBeenCalled();
    expect(form.imageErrorMessage).toBe(
      'Salve o produto antes de enviar a imagem.',
    );
  });

  it('replaces the main product image through the existing upload service', async () => {
    mockedLaunchImageLibrary.mockResolvedValue({
      didCancel: false,
      errorCode: undefined,
      errorMessage: undefined,
      assets: [
        {
          uri: 'file:///replacement.png',
          fileName: 'replacement.png',
          type: 'image/png',
          fileSize: 1024,
        },
      ],
    });
    mockedProductsService.uploadProductImage.mockResolvedValue(
      product('existing-id', {
        imageUrl: 'https://images.test/replacement.png',
      }),
    );
    await mount('existing-id');
    await act(async () => form.handleSelectImage());

    let didUpload = false;
    await act(async () => {
      didUpload = await form.handleUploadImage();
    });

    expect(didUpload).toBe(true);
    expect(mockedProductsService.uploadProductImage).toHaveBeenCalledWith(
      'existing-id',
      expect.objectContaining({
        uri: 'file:///replacement.png',
        type: 'image/png',
      }),
    );
    expect(form.formValues.imageUrl).toBe(
      'https://images.test/replacement.png',
    );
    expect(form.imageSuccessMessage).toBe('Imagem atualizada.');
  });

  it('rejects an image that exceeds the existing five megabyte limit', async () => {
    mockedLaunchImageLibrary.mockResolvedValue({
      didCancel: false,
      errorCode: undefined,
      errorMessage: undefined,
      assets: [
        {
          uri: 'file:///too-large.jpg',
          fileName: 'too-large.jpg',
          type: 'image/jpeg',
          fileSize: 5 * 1024 * 1024 + 1,
        },
      ],
    });
    await mount();

    await act(async () => form.handleSelectImage());

    expect(form.selectedImageFile).toBeNull();
    expect(form.imageErrorMessage).toBe('A imagem deve ter no máximo 5 MB.');
    expect(mockedProductsService.uploadProductImage).not.toHaveBeenCalled();
  });

  it('prevents a second submit while the first save is pending', async () => {
    let resolveSave!: (value: ProductDetail) => void;
    mockedProductsService.createProduct.mockReturnValue(
      new Promise(resolve => (resolveSave = resolve)),
    );
    await mount();
    await fillRequiredFields();

    let first!: ReturnType<typeof form.handleSubmit>;
    let second!: ReturnType<typeof form.handleSubmit>;
    await act(async () => {
      first = form.handleSubmit();
      second = form.handleSubmit();
      expect(mockedProductsService.createProduct).toHaveBeenCalledTimes(1);
      resolveSave(product('new-id'));
      await Promise.all([first, second]);
    });
  });
});
