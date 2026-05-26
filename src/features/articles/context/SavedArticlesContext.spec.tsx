import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useAuth } from '../../auth/hooks/useAuth';
import { articlesService } from '../services/articles.service';
import {
  SavedArticlesProvider,
  useSavedArticles,
} from './SavedArticlesContext';

jest.mock('../../auth/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../services/articles.service', () => ({
  ARTICLES_PAGE_LIMIT: 20,
  articlesService: {
    listSavedArticles: jest.fn(),
    saveArticle: jest.fn(),
    unsaveArticle: jest.fn(),
  },
}));

const mockedUseAuth = useAuth as jest.Mock;
const mockedArticlesService = articlesService as jest.Mocked<typeof articlesService>;

describe('SavedArticlesContext', () => {
  type HookSnapshot = ReturnType<typeof useSavedArticles>;

  let latestHook: HookSnapshot | null = null;

  function HookProbe() {
    latestHook = useSavedArticles();
    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    latestHook = null;
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('ends loading after a successful saved articles response', async () => {
    mockedArticlesService.listSavedArticles.mockResolvedValue({
      data: [
        {
          id: 'article-1',
          title: 'Como conservar folhas',
          slug: 'como-conservar-folhas',
          summary: 'Dicas para manter as folhas firmes.',
          category: 'STORAGE',
          imageUrl: null,
          tags: [],
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
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SavedArticlesProvider>
          <HookProbe />
        </SavedArticlesProvider>,
      );
    });

    expect(latestHook?.isLoading).toBe(false);
    expect(latestHook?.articles).toHaveLength(1);
    expect(latestHook?.errorMessage).toBeNull();
    expect(latestHook?.savedArticleIds.has('article-1')).toBe(true);
  });

  it('ends loading after a failed saved articles response', async () => {
    mockedArticlesService.listSavedArticles.mockRejectedValue(
      new Error('request failed'),
    );

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SavedArticlesProvider>
          <HookProbe />
        </SavedArticlesProvider>,
      );
    });

    expect(latestHook?.isLoading).toBe(false);
    expect(latestHook?.articles).toEqual([]);
    expect(latestHook?.errorMessage).toBe(
      'Não foi possível carregar suas leituras salvas.',
    );
  });
});
