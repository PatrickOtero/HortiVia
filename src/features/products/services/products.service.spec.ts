import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import { productsService } from './products.service';

jest.mock('../../../services/api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('productsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createProductImage calls the correct endpoint with normalized payload', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        id: 'image-1',
        url: 'https://cdn.hortivia.com/abacate-hero.jpg',
        alt: 'Abacate inteiro',
        caption: 'Imagem principal',
        kind: 'HERO',
        sortOrder: 0,
        isPrimary: true,
      },
    });

    const result = await productsService.createProductImage('product-1', {
      url: ' https://cdn.hortivia.com/abacate-hero.jpg ',
      kind: 'HERO',
      alt: ' Abacate inteiro ',
      caption: ' Imagem principal ',
      sortOrder: 0,
      isPrimary: true,
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.products.images('product-1'),
      {
        url: 'https://cdn.hortivia.com/abacate-hero.jpg',
        alt: 'Abacate inteiro',
        caption: 'Imagem principal',
        kind: 'HERO',
        sortOrder: 0,
        isPrimary: true,
      },
    );
    expect(result.imageUrl).toBe('https://cdn.hortivia.com/abacate-hero.jpg');
  });

  it('updateProductImage calls the correct endpoint', async () => {
    mockedApiClient.patch.mockResolvedValue({
      data: {
        id: 'image-1',
        url: 'https://cdn.hortivia.com/abacate-hero.jpg',
        alt: null,
        caption: 'Nova legenda',
        kind: 'USAGE',
        sortOrder: 2,
        isPrimary: false,
      },
    });

    await productsService.updateProductImage('product-1', 'image-1', {
      caption: ' Nova legenda ',
      kind: 'USAGE',
      sortOrder: 2,
    });

    expect(mockedApiClient.patch).toHaveBeenCalledWith(
      API_ENDPOINTS.products.imageDetail('product-1', 'image-1'),
      {
        caption: 'Nova legenda',
        kind: 'USAGE',
        sortOrder: 2,
      },
    );
  });

  it('createProductGuideSection converts multiline arrays and calls the correct endpoint', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        id: 'section-1',
        kind: 'CHOOSE',
        title: 'Como escolher',
        body: 'Prefira frutos firmes.',
        imageUrl: null,
        imageAlt: null,
        imageCaption: null,
        bullets: ['Casca íntegra', 'Leve maciez'],
        idealPoints: ['Boa firmeza'],
        avoidPoints: ['Rachaduras'],
        sortOrder: 1,
      },
    });

    const result = await productsService.createProductGuideSection('product-1', {
      kind: 'CHOOSE',
      title: ' Como escolher ',
      body: ' Prefira frutos firmes. ',
      bullets: ['Casca íntegra', 'Leve maciez'],
      idealPoints: ['Boa firmeza'],
      avoidPoints: ['Rachaduras'],
      sortOrder: 1,
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.products.guideSections('product-1'),
      {
        kind: 'CHOOSE',
        title: 'Como escolher',
        body: 'Prefira frutos firmes.',
        bullets: ['Casca íntegra', 'Leve maciez'],
        idealPoints: ['Boa firmeza'],
        avoidPoints: ['Rachaduras'],
        sortOrder: 1,
      },
    );
    expect(result.title).toBe('Como escolher');
  });

  it('deleteProductImage calls the correct endpoint', async () => {
    mockedApiClient.delete.mockResolvedValue({});

    await productsService.deleteProductImage('product-1', 'image-1');

    expect(mockedApiClient.delete).toHaveBeenCalledWith(
      API_ENDPOINTS.products.imageDetail('product-1', 'image-1'),
    );
  });

  it('deleteProductGuideSection calls the correct endpoint', async () => {
    mockedApiClient.delete.mockResolvedValue({});

    await productsService.deleteProductGuideSection('product-1', 'section-1');

    expect(mockedApiClient.delete).toHaveBeenCalledWith(
      API_ENDPOINTS.products.guideSectionDetail('product-1', 'section-1'),
    );
  });

  it('favoriteProduct calls the correct endpoint', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        message: 'Produto adicionado aos favoritos.',
      },
    });

    const result = await productsService.favoriteProduct('product-1');

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.products.favorite('product-1'),
    );
    expect(result.message).toBe('Produto adicionado aos favoritos.');
  });

  it('unfavoriteProduct calls the correct endpoint', async () => {
    mockedApiClient.delete.mockResolvedValue({
      data: {
        message: 'Produto removido dos favoritos.',
      },
    });

    const result = await productsService.unfavoriteProduct('product-1');

    expect(mockedApiClient.delete).toHaveBeenCalledWith(
      API_ENDPOINTS.products.favorite('product-1'),
    );
    expect(result.message).toBe('Produto removido dos favoritos.');
  });

  it('listFavoriteProducts calls the correct endpoint and maps the response', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: {
        items: [
          {
            id: 'product-1',
            name: 'Abacate',
            slug: 'abacate',
            category: 'FRUIT',
            shortDescription: 'Cremoso e nutritivo.',
            imageUrl: 'https://cdn.hortivia.com/abacate.jpg',
          },
        ],
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });

    const result = await productsService.listFavoriteProducts({
      page: 1,
      limit: 20,
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      API_ENDPOINTS.favorites.products,
      {
        params: {
          page: 1,
          limit: 20,
        },
      },
    );
    expect(result.data[0]?.isFavorite).toBe(true);
    expect(result.meta.total).toBe(1);
  });
});
