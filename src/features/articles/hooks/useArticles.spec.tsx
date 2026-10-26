import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { articlesService } from '../services/articles.service';
import type { ArticleListItem, PaginatedResponse } from '../types/article';
import { useArticles } from './useArticles';

jest.mock('../services/articles.service', () => ({
  ARTICLES_PAGE_LIMIT: 20,
  articlesService: { listArticles: jest.fn() },
}));

const mockedArticlesService = articlesService as jest.Mocked<typeof articlesService>;

function article(id: string): ArticleListItem {
  return {
    id,
    title: id,
    slug: id,
    summary: '',
    category: 'TIPS',
    imageUrl: null,
    tags: [],
    author: { id: 'author-1', name: 'Equipe', avatarUrl: null },
  };
}

function page(
  data: ArticleListItem[],
  currentPage: number,
  totalPages: number,
): PaginatedResponse<ArticleListItem> {
  return {
    data,
    meta: { page: currentPage, limit: 20, total: totalPages * 20, totalPages },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(resolvePromise => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe('useArticles pagination', () => {
  type HookSnapshot = ReturnType<typeof useArticles>;
  let latestHook: HookSnapshot | null = null;
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  let activeCategory: 'ALL' | 'TIPS';

  function HookProbe() {
    latestHook = useArticles({ activeCategory });
    return null;
  }

  async function mount() {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<HookProbe />);
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    latestHook = null;
    activeCategory = 'ALL';
  });

  afterEach(async () => {
    await ReactTestRenderer.act(async () => renderer?.unmount());
  });

  it('loads the first page, appends the next page once, and stops at the end', async () => {
    mockedArticlesService.listArticles
      .mockResolvedValueOnce(page([article('a1')], 1, 2))
      .mockResolvedValueOnce(page([article('a1'), article('a2')], 2, 2));
    await mount();

    expect(mockedArticlesService.listArticles).toHaveBeenCalledWith({
      category: undefined,
      page: 1,
      limit: 20,
    });
    await ReactTestRenderer.act(async () => latestHook?.loadMore());
    expect(latestHook?.articles.map(item => item.id)).toEqual(['a1', 'a2']);
    expect(latestHook?.hasMore).toBe(false);
    await ReactTestRenderer.act(async () => latestHook?.loadMore());
    expect(mockedArticlesService.listArticles).toHaveBeenCalledTimes(2);
  });

  it('avoids simultaneous next-page calls and preserves articles for retry on failure', async () => {
    const manualRetry = deferred<PaginatedResponse<ArticleListItem>>();
    mockedArticlesService.listArticles
      .mockResolvedValueOnce(page([article('a1')], 1, 3))
      .mockRejectedValueOnce(new Error('network'))
      .mockReturnValueOnce(manualRetry.promise)
      .mockResolvedValueOnce(page([article('a3')], 3, 3));
    await mount();

    await ReactTestRenderer.act(async () => latestHook?.loadMore());
    expect(latestHook?.articles.map(item => item.id)).toEqual(['a1']);
    expect(latestHook?.loadMoreError).toBe('Não foi possível carregar mais artigos.');

    await ReactTestRenderer.act(async () => {
      await latestHook?.loadMore();
      await latestHook?.loadMore();
    });
    expect(mockedArticlesService.listArticles).toHaveBeenCalledTimes(2);
    expect(latestHook?.articles.map(item => item.id)).toEqual(['a1']);

    await ReactTestRenderer.act(async () => {
      latestHook?.retryLoadMore().catch(() => undefined);
      latestHook?.retryLoadMore().catch(() => undefined);
    });
    expect(mockedArticlesService.listArticles).toHaveBeenCalledTimes(3);

    await ReactTestRenderer.act(async () => {
      manualRetry.resolve(page([article('a2')], 2, 3));
      await manualRetry.promise;
    });
    expect(latestHook?.articles.map(item => item.id)).toEqual(['a1', 'a2']);
    expect(latestHook?.loadMoreError).toBeNull();

    await ReactTestRenderer.act(async () => latestHook?.loadMore());
    expect(mockedArticlesService.listArticles).toHaveBeenCalledTimes(4);
    expect(latestHook?.articles.map(item => item.id)).toEqual(['a1', 'a2', 'a3']);
  });

  it('clears a failed-page block when refreshing the first page', async () => {
    mockedArticlesService.listArticles
      .mockResolvedValueOnce(page([article('a1')], 1, 2))
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(page([article('a1-refreshed')], 1, 2))
      .mockResolvedValueOnce(page([article('a2')], 2, 2));
    await mount();

    await ReactTestRenderer.act(async () => latestHook?.loadMore());
    expect(latestHook?.loadMoreError).not.toBeNull();
    await ReactTestRenderer.act(async () => latestHook?.refresh());
    expect(latestHook?.articles.map(item => item.id)).toEqual(['a1-refreshed']);
    expect(latestHook?.loadMoreError).toBeNull();
    await ReactTestRenderer.act(async () => latestHook?.loadMore());
    expect(mockedArticlesService.listArticles).toHaveBeenCalledTimes(4);
    expect(latestHook?.articles.map(item => item.id)).toEqual([
      'a1-refreshed',
      'a2',
    ]);
  });

  it('resets to page one and ignores an old category response', async () => {
    const oldRequest = deferred<PaginatedResponse<ArticleListItem>>();
    mockedArticlesService.listArticles
      .mockReturnValueOnce(oldRequest.promise)
      .mockResolvedValueOnce(page([article('fresh')], 1, 1));
    await mount();

    await ReactTestRenderer.act(async () => {
      activeCategory = 'TIPS';
      renderer.update(<HookProbe />);
    });
    await ReactTestRenderer.act(async () => {
      oldRequest.resolve(page([article('stale')], 1, 1));
      await oldRequest.promise;
    });

    expect(mockedArticlesService.listArticles).toHaveBeenLastCalledWith({
      category: 'TIPS',
      page: 1,
      limit: 20,
    });
    expect(latestHook?.articles.map(item => item.id)).toEqual(['fresh']);
  });

  it('clears the pagination failure when the category changes', async () => {
    mockedArticlesService.listArticles
      .mockResolvedValueOnce(page([article('old')], 1, 2))
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(page([article('tips')], 1, 2))
      .mockResolvedValueOnce(page([article('tips-next')], 2, 2));
    await mount();

    await ReactTestRenderer.act(async () => latestHook?.loadMore());
    expect(latestHook?.loadMoreError).not.toBeNull();

    await ReactTestRenderer.act(async () => {
      activeCategory = 'TIPS';
      renderer.update(<HookProbe />);
    });
    expect(latestHook?.articles.map(item => item.id)).toEqual(['tips']);
    expect(latestHook?.loadMoreError).toBeNull();

    await ReactTestRenderer.act(async () => latestHook?.loadMore());
    expect(mockedArticlesService.listArticles).toHaveBeenCalledTimes(4);
    expect(latestHook?.articles.map(item => item.id)).toEqual([
      'tips',
      'tips-next',
    ]);
  });
});
