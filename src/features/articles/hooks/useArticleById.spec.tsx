import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { articlesService } from '../services/articles.service';
import type { ArticleDetail } from '../types/article';
import { useArticleById } from './useArticleById';

jest.mock('../services/articles.service', () => ({
  articlesService: { getArticleById: jest.fn() },
}));

const mockedArticlesService = articlesService as jest.Mocked<
  typeof articlesService
>;

function article(id: string): ArticleDetail {
  return {
    id,
    title: id,
    slug: id,
    summary: '',
    content: '',
    category: 'TIPS',
    imageUrl: null,
    tags: [],
    author: { id: 'author-1', name: 'Author', avatarUrl: null },
    blocks: [],
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(resolvePromise => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe('useArticleById request lifecycle', () => {
  type HookState = ReturnType<typeof useArticleById>;
  let latest: HookState | null;
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  let activeArticleId: string;

  function Probe() {
    latest = useArticleById({ articleId: activeArticleId });
    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    latest = null;
    activeArticleId = 'article-1';
  });

  afterEach(async () => {
    if (renderer) {
      await ReactTestRenderer.act(async () => renderer?.unmount());
      renderer = undefined;
    }
  });

  it('keeps only the response for the currently selected article', async () => {
    const oldRequest = deferred<ArticleDetail>();
    mockedArticlesService.getArticleById
      .mockReturnValueOnce(oldRequest.promise)
      .mockResolvedValueOnce(article('article-2'));

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<Probe />);
    });
    await ReactTestRenderer.act(async () => {
      activeArticleId = 'article-2';
      renderer?.update(<Probe />);
    });
    await ReactTestRenderer.act(async () => {
      oldRequest.resolve(article('article-1'));
      await oldRequest.promise;
    });

    expect(latest?.article?.id).toBe('article-2');
  });

  it('ignores a pending article response after unmount', async () => {
    const request = deferred<ArticleDetail>();
    mockedArticlesService.getArticleById.mockReturnValue(request.promise);
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<Probe />);
    });

    await ReactTestRenderer.act(async () => renderer?.unmount());
    renderer = undefined;
    await ReactTestRenderer.act(async () => {
      request.resolve(article('article-1'));
      await request.promise;
    });

    expect(latest?.article).toBeNull();
  });
});
