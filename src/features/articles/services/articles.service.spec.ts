import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import { articlesService } from './articles.service';

jest.mock('../../../services/api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

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

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.saved.articles, {
      params: {
        page: 1,
        limit: 20,
      },
    });
    expect(result.data[0]).toMatchObject({
      id: 'article-1',
      title: 'Como conservar folhas',
      isSaved: true,
    });
    expect(result.meta.total).toBe(1);
  });
});
