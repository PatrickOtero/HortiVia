import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useAuth } from '../../auth/hooks/useAuth';
import { articlesService } from '../services/articles.service';
import {
  SavedArticlesProvider,
  useSavedArticles,
} from './SavedArticlesContext';
import type { SavedArticle } from '../types/article';

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

  function createArticle(
    overrides: Partial<{
      id: string;
      title: string;
      slug: string;
      summary: string;
      category: 'TIPS' | 'STORAGE' | 'SEASONALITY' | 'RECIPES' | 'WASTE_REDUCTION';
      isSaved: boolean;
    }> = {},
  ) {
    return {
      id: overrides.id ?? 'article-1',
      title: overrides.title ?? 'Como conservar folhas',
      slug: overrides.slug ?? 'como-conservar-folhas',
      summary: overrides.summary ?? 'Dicas para manter as folhas firmes.',
      category: overrides.category ?? 'STORAGE',
      imageUrl: null,
      tags: [],
      publishedAt: '2026-05-26T10:00:00.000Z',
      readingTimeMinutes: 2,
      author: {
        id: 'author-1',
        name: 'Equipe HortiVia',
        avatarUrl: null,
      },
      isSaved: overrides.isSaved ?? false,
    };
  }

  function createSavedArticle(
    overrides: Partial<{
      id: string;
      title: string;
      slug: string;
      summary: string;
      category: 'TIPS' | 'STORAGE' | 'SEASONALITY' | 'RECIPES' | 'WASTE_REDUCTION';
    }> = {},
  ): SavedArticle {
    return {
      ...createArticle({
        ...overrides,
        isSaved: true,
      }),
      isSaved: true,
    };
  }

  async function renderProvider() {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SavedArticlesProvider>
          <HookProbe />
        </SavedArticlesProvider>,
      );
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    latestHook = null;
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    mockedArticlesService.saveArticle.mockResolvedValue({
      message: 'Artigo salvo.',
    });
    mockedArticlesService.unsaveArticle.mockResolvedValue({
      message: 'Artigo removido das leituras salvas.',
    });
  });

  it('ends loading after a successful saved articles response', async () => {
    mockedArticlesService.listSavedArticles.mockResolvedValue({
      data: [createSavedArticle({ id: 'article-1' })],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });

    await renderProvider();

    expect(latestHook?.isLoading).toBe(false);
    expect(latestHook?.articles).toHaveLength(1);
    expect(latestHook?.errorMessage).toBeNull();
    expect(latestHook?.savedArticleIds.has('article-1')).toBe(true);
  });

  it('ends loading after a failed saved articles response', async () => {
    mockedArticlesService.listSavedArticles.mockRejectedValue(
      new Error('request failed'),
    );

    await renderProvider();

    expect(latestHook?.isLoading).toBe(false);
    expect(latestHook?.articles).toEqual([]);
    expect(latestHook?.errorMessage).toBe(
      'Não foi possível carregar suas leituras salvas.',
    );
  });

  it('uses savedArticleIds as the source of truth for article state', async () => {
    mockedArticlesService.listSavedArticles.mockResolvedValue({
      data: [createSavedArticle({ id: 'article-1' })],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });

    await renderProvider();

    expect(
      latestHook?.isArticleSaved({
        id: 'article-1',
        isSaved: false,
      }),
    ).toBe(true);
  });

  it('saving from feed updates the saved list without duplicates', async () => {
    mockedArticlesService.listSavedArticles.mockResolvedValue({
      data: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });

    await renderProvider();

    const article = createArticle({
      id: 'article-2',
      title: 'Como escolher tomate',
      slug: 'como-escolher-tomate',
      category: 'TIPS',
    });

    await ReactTestRenderer.act(async () => {
      await latestHook?.toggleSavedArticle(article);
    });

    expect(latestHook?.articles).toHaveLength(1);
    expect(latestHook?.savedArticleIds.has('article-2')).toBe(true);

    await ReactTestRenderer.act(async () => {
      await latestHook?.toggleSavedArticle({
        ...article,
        isSaved: true,
      });
    });

    expect(latestHook?.articles).toHaveLength(0);
    expect(latestHook?.savedArticleIds.has('article-2')).toBe(false);
  });

  it('unsaving from the saved list removes the article globally', async () => {
    mockedArticlesService.listSavedArticles.mockResolvedValue({
      data: [createSavedArticle({ id: 'article-3' })],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });

    await renderProvider();

    await ReactTestRenderer.act(async () => {
      await latestHook?.toggleSavedArticle(
        createArticle({ id: 'article-3', isSaved: true }),
      );
    });

    expect(latestHook?.articles).toEqual([]);
    expect(latestHook?.savedArticleIds.has('article-3')).toBe(false);
  });

  it('ends per-article loading after a failed save rollback', async () => {
    mockedArticlesService.listSavedArticles.mockResolvedValue({
      data: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });
    mockedArticlesService.saveArticle.mockRejectedValueOnce(
      new Error('save failed'),
    );

    await renderProvider();

    await ReactTestRenderer.act(async () => {
      await expect(
        latestHook?.toggleSavedArticle(createArticle({ id: 'article-4' })) ??
          Promise.reject(new Error('missing hook')),
      ).rejects.toBeTruthy();
    });

    expect(latestHook?.isArticleSaveLoading('article-4')).toBe(false);
    expect(latestHook?.articles).toEqual([]);
  });
});
