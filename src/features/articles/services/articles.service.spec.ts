import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import { uploadFileUriToPresignedUrl } from '../../../services/api/presignedUpload';
import { articlesService } from './articles.service';

jest.mock('../../../services/api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../../services/api/presignedUpload', () => ({
  uploadFileUriToPresignedUrl: jest.fn(),
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockedUploadFileUriToPresignedUrl =
  uploadFileUriToPresignedUrl as jest.MockedFunction<
    typeof uploadFileUriToPresignedUrl
  >;

describe('articlesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls the save endpoint', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        message: 'Artigo salvo.',
      },
    });

    const result = await articlesService.saveArticle('article-1');

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.articles.save('article-1'),
    );
    expect(result).toEqual({
      message: 'Artigo salvo.',
    });
  });

  it('calls the unsave endpoint', async () => {
    mockedApiClient.delete.mockResolvedValue({
      data: {
        message: 'Artigo removido das leituras salvas.',
      },
    });

    const result = await articlesService.unsaveArticle('article-1');

    expect(mockedApiClient.delete).toHaveBeenCalledWith(
      API_ENDPOINTS.articles.save('article-1'),
    );
    expect(result).toEqual({
      message: 'Artigo removido das leituras salvas.',
    });
  });

  it('calls the useful mark endpoint', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        message: 'Marcado como útil.',
        isReacted: true,
        reactionsCount: 12,
      },
    });

    const result = await articlesService.reactToArticle('article-1');

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.articles.reactions('article-1'),
    );
    expect(result).toEqual({
      message: 'Marcado como útil.',
      isReacted: true,
      reactionsCount: 12,
    });
  });

  it('calls the remove useful mark endpoint', async () => {
    mockedApiClient.delete.mockResolvedValue({
      data: {
        message: 'Remover marcação.',
        isReacted: false,
        reactionsCount: 11,
      },
    });

    const result = await articlesService.removeArticleReaction('article-1');

    expect(mockedApiClient.delete).toHaveBeenCalledWith(
      API_ENDPOINTS.articles.reactions('article-1'),
    );
    expect(result).toEqual({
      message: 'Remover marcação.',
      isReacted: false,
      reactionsCount: 11,
    });
  });

  it('lists saved articles', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: {
        items: [
          {
            id: 'article-1',
            title: 'Como conservar folhas',
            slug: 'como-conservar-folhas',
            summary: 'Dicas para manter as folhas firmes.',
            category: 'STORAGE',
            imageUrl: null,
            publishedAt: '2026-05-26T10:00:00.000Z',
            readingTimeMinutes: 2,
            author: {
              id: 'author-1',
              name: 'Equipe HortiVia',
              avatarUrl: null,
            },
            isSaved: true,
          },
        ],
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });

    const result = await articlesService.listSavedArticles({
      page: 1,
      limit: 20,
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      API_ENDPOINTS.saved.articles,
      {
        params: {
          page: 1,
          limit: 20,
        },
      },
    );
    expect(result.data[0]).toMatchObject({
      id: 'article-1',
      title: 'Como conservar folhas',
      isSaved: true,
    });
    expect(result.meta.total).toBe(1);
  });

  it('creates an article block', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        id: 'block-1',
        articleId: 'article-1',
        kind: 'SECTION',
        title: 'Secagem correta',
        body: 'Seque bem antes de guardar.',
        items: ['Use um pano limpo'],
        sortOrder: 1,
        createdAt: '2026-05-27T10:00:00.000Z',
        updatedAt: '2026-05-27T10:00:00.000Z',
      },
    });

    const result = await articlesService.createArticleBlock('article-1', {
      kind: 'SECTION',
      title: 'Secagem correta',
      body: 'Seque bem antes de guardar.',
      items: ['Use um pano limpo'],
      sortOrder: 1,
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.articles.blocks('article-1'),
      {
        kind: 'SECTION',
        title: 'Secagem correta',
        body: 'Seque bem antes de guardar.',
        items: ['Use um pano limpo'],
        sortOrder: 1,
      },
    );
    expect(result).toMatchObject({
      id: 'block-1',
      articleId: 'article-1',
      kind: 'SECTION',
      title: 'Secagem correta',
    });
  });

  it('loads article detail for admin editing', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: {
        id: 'article-1',
        title: 'Como conservar folhas',
        slug: 'como-conservar-folhas',
        summary: 'Dicas para manter as folhas firmes.',
        category: 'STORAGE',
        content: 'Conteudo admin.',
        imageUrl: null,
        blocks: [],
        relatedProducts: [],
        author: {
          id: 'author-1',
          name: 'Equipe HortiVia',
          avatarUrl: null,
        },
      },
    });

    const result = await articlesService.getAdminArticleById('article-1');

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      API_ENDPOINTS.articles.adminDetail('article-1'),
    );
    expect(result).toMatchObject({
      id: 'article-1',
      title: 'Como conservar folhas',
      content: 'Conteudo admin.',
    });
  });

  it('updates an article block', async () => {
    mockedApiClient.patch.mockResolvedValue({
      data: {
        id: 'block-1',
        articleId: 'article-1',
        kind: 'TIP',
        title: 'Dica de secagem',
        body: 'Use papel toalha.',
        items: ['Secar antes de fechar o pote'],
        sortOrder: 2,
        createdAt: '2026-05-27T10:00:00.000Z',
        updatedAt: '2026-05-27T10:05:00.000Z',
      },
    });

    const result = await articlesService.updateArticleBlock(
      'article-1',
      'block-1',
      {
        kind: 'TIP',
        title: 'Dica de secagem',
        body: 'Use papel toalha.',
        items: ['Secar antes de fechar o pote'],
        sortOrder: 2,
      },
    );

    expect(mockedApiClient.patch).toHaveBeenCalledWith(
      API_ENDPOINTS.articles.blockDetail('article-1', 'block-1'),
      {
        kind: 'TIP',
        title: 'Dica de secagem',
        body: 'Use papel toalha.',
        items: ['Secar antes de fechar o pote'],
        sortOrder: 2,
      },
    );
    expect(result).toMatchObject({
      id: 'block-1',
      articleId: 'article-1',
      kind: 'TIP',
      sortOrder: 2,
    });
  });

  it('deletes an article block', async () => {
    mockedApiClient.delete.mockResolvedValue({ data: undefined });

    await articlesService.deleteArticleBlock('article-1', 'block-1');

    expect(mockedApiClient.delete).toHaveBeenCalledWith(
      API_ENDPOINTS.articles.blockDetail('article-1', 'block-1'),
    );
  });

  it('requests a block image upload URL', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        uploadUrl: 'https://upload.example.com',
        url: 'https://cdn.example.com/articles/article-1/blocks/block-1/image.webp',
        key: 'articles/article-1/blocks/block-1/image.webp',
      },
    });

    const result = await articlesService.createArticleBlockImageUpload({
      articleId: 'article-1',
      blockId: 'block-1',
      fileName: 'block-image.webp',
      contentType: 'image/webp',
      fileSize: 2048,
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.articles.blockImageUpload('article-1', 'block-1'),
      {
        fileName: 'block-image.webp',
        contentType: 'image/webp',
        fileSize: 2048,
      },
    );
    expect(result).toEqual({
      uploadUrl: 'https://upload.example.com',
      imageUrl:
        'https://cdn.example.com/articles/article-1/blocks/block-1/image.webp',
      key: 'articles/article-1/blocks/block-1/image.webp',
    });
  });

  it('uploads a selected file to a presigned URL', async () => {
    mockedUploadFileUriToPresignedUrl.mockResolvedValue();

    await articlesService.uploadFileToPresignedUrl({
      uploadUrl: 'https://upload.example.com',
      fileUri: 'file:///tmp/image.webp',
      contentType: 'image/webp',
    });

    expect(mockedUploadFileUriToPresignedUrl).toHaveBeenCalledWith({
      uploadUrl: 'https://upload.example.com',
      fileUri: 'file:///tmp/image.webp',
      contentType: 'image/webp',
    });
  });

  it('persists block image metadata', async () => {
    mockedApiClient.patch.mockResolvedValue({
      data: {
        id: 'block-1',
        articleId: 'article-1',
        kind: 'SECTION',
        title: 'Secagem',
        body: 'Texto',
        imageUrl:
          'https://cdn.example.com/articles/article-1/blocks/block-1/image.webp',
        imageAlt: 'Folhas secando',
        imageCaption: 'Secagem correta',
        items: [],
        sortOrder: 2,
        createdAt: '2026-05-27T10:00:00.000Z',
        updatedAt: '2026-05-27T10:05:00.000Z',
      },
    });

    const result = await articlesService.updateArticleBlockImage({
      articleId: 'article-1',
      blockId: 'block-1',
      imageUrl:
        'https://cdn.example.com/articles/article-1/blocks/block-1/image.webp',
      imageAlt: 'Folhas secando',
      imageCaption: 'Secagem correta',
    });

    expect(mockedApiClient.patch).toHaveBeenCalledWith(
      API_ENDPOINTS.articles.blockImage('article-1', 'block-1'),
      {
        imageUrl:
          'https://cdn.example.com/articles/article-1/blocks/block-1/image.webp',
        imageAlt: 'Folhas secando',
        imageCaption: 'Secagem correta',
      },
    );
    expect(result).toMatchObject({
      id: 'block-1',
      articleId: 'article-1',
      imageUrl:
        'https://cdn.example.com/articles/article-1/blocks/block-1/image.webp',
      imageAlt: 'Folhas secando',
      imageCaption: 'Secagem correta',
    });
  });

  it('uploads block image with multipart payload', async () => {
    mockedApiClient.post.mockResolvedValue({
      data: {
        id: 'block-1',
        articleId: 'article-1',
        kind: 'SECTION',
        title: 'Secagem',
        body: 'Texto',
        imageUrl:
          'https://cdn.example.com/articles/article-1/blocks/block-1/image.webp',
        imageAlt: 'Folhas secando',
        imageCaption: 'Secagem correta',
        items: [],
        sortOrder: 2,
        createdAt: '2026-05-27T10:00:00.000Z',
        updatedAt: '2026-05-27T10:05:00.000Z',
      },
    });

    const result = await articlesService.uploadArticleBlockImage({
      articleId: 'article-1',
      blockId: 'block-1',
      file: {
        uri: 'file:///tmp/block.webp',
        name: 'block.webp',
        type: 'image/webp',
        size: 2048,
      },
      imageAlt: 'Folhas secando',
      imageCaption: 'Secagem correta',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.articles.blockImage('article-1', 'block-1'),
      expect.any(FormData),
    );
    expect(result).toMatchObject({
      id: 'block-1',
      articleId: 'article-1',
      imageUrl:
        'https://cdn.example.com/articles/article-1/blocks/block-1/image.webp',
      imageAlt: 'Folhas secando',
      imageCaption: 'Secagem correta',
    });
  });

  it('deletes block image metadata', async () => {
    mockedApiClient.delete.mockResolvedValue({
      data: {
        id: 'block-1',
        articleId: 'article-1',
        kind: 'SECTION',
        title: 'Secagem',
        body: 'Texto',
        imageUrl: null,
        imageAlt: null,
        imageCaption: null,
        items: [],
        sortOrder: 2,
        createdAt: '2026-05-27T10:00:00.000Z',
        updatedAt: '2026-05-27T10:05:00.000Z',
      },
    });

    const result = await articlesService.deleteArticleBlockImage({
      articleId: 'article-1',
      blockId: 'block-1',
    });

    expect(mockedApiClient.delete).toHaveBeenCalledWith(
      API_ENDPOINTS.articles.blockImage('article-1', 'block-1'),
    );
    expect(result).toMatchObject({
      id: 'block-1',
      articleId: 'article-1',
      imageUrl: undefined,
      imageAlt: undefined,
      imageCaption: undefined,
    });
  });
});
