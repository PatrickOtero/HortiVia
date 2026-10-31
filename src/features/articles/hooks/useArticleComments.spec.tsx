import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { articlesService } from '../services/articles.service';
import type {
  ArticleComment,
  PaginatedArticleCommentsResponse,
} from '../types/article';
import { useArticleComments } from './useArticleComments';

jest.mock('../services/articles.service', () => ({
  ARTICLE_COMMENTS_PAGE_LIMIT: 10,
  articlesService: {
    listArticleComments: jest.fn(),
    createArticleComment: jest.fn(),
    updateArticleComment: jest.fn(),
    deleteArticleComment: jest.fn(),
    moderateArticleComment: jest.fn(),
  },
}));

const mockedArticlesService = articlesService as jest.Mocked<
  typeof articlesService
>;

function comment(id: string, body = id): ArticleComment {
  return {
    id,
    body,
    createdAt: '2026-10-01T12:00:00.000Z',
    author: { id: `author-${id}`, name: `Author ${id}` },
  };
}

function response(
  items: ArticleComment[],
  page = 1,
  totalPages = 1,
): PaginatedArticleCommentsResponse {
  return { items, page, limit: 10, total: items.length, totalPages };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(resolvePromise => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe('useArticleComments', () => {
  type HookState = ReturnType<typeof useArticleComments>;
  let latest: HookState | null;
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  let activeArticleId: string;

  function Probe() {
    latest = useArticleComments({ articleId: activeArticleId });
    return null;
  }

  async function mount() {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<Probe />);
    });
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

  it('ignores repeated next-page calls made before React updates loading state', async () => {
    const nextPage = deferred<PaginatedArticleCommentsResponse>();
    mockedArticlesService.listArticleComments
      .mockResolvedValueOnce(response([comment('first')], 1, 2))
      .mockReturnValueOnce(nextPage.promise);
    await mount();

    let firstRequest!: Promise<void>;
    let secondRequest!: Promise<void>;
    await ReactTestRenderer.act(async () => {
      firstRequest = latest!.loadMore();
      secondRequest = latest!.loadMore();
      expect(mockedArticlesService.listArticleComments).toHaveBeenCalledTimes(
        2,
      );
      nextPage.resolve(response([comment('second')], 2, 2));
      await Promise.all([firstRequest, secondRequest]);
    });

    expect(latest?.comments.map(item => item.id)).toEqual(['first', 'second']);
  });

  it('deduplicates overlapping initial-page refreshes', async () => {
    const firstPage = deferred<PaginatedArticleCommentsResponse>();
    mockedArticlesService.listArticleComments.mockReturnValue(
      firstPage.promise,
    );
    await mount();

    await ReactTestRenderer.act(async () => {
      const firstRefresh = latest!.refresh();
      const duplicateRefresh = latest!.refresh();
      expect(mockedArticlesService.listArticleComments).toHaveBeenCalledTimes(
        1,
      );
      firstPage.resolve(response([comment('first')]));
      await Promise.all([firstRefresh, duplicateRefresh]);
    });

    expect(latest?.comments.map(item => item.id)).toEqual(['first']);
  });

  it('preserves loaded comments and retries the same page after a network failure', async () => {
    mockedArticlesService.listArticleComments
      .mockResolvedValueOnce(response([comment('first')], 1, 2))
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(response([comment('second')], 2, 2));
    await mount();

    await ReactTestRenderer.act(async () => latest?.loadMore());
    expect(latest?.comments.map(item => item.id)).toEqual(['first']);
    expect(latest?.errorMessage).toBe(
      'Nao foi possivel carregar os comentarios.',
    );

    await ReactTestRenderer.act(async () => latest?.loadMore());
    expect(mockedArticlesService.listArticleComments).toHaveBeenLastCalledWith(
      'article-1',
      { page: 2, limit: 10 },
    );
    expect(latest?.comments.map(item => item.id)).toEqual(['first', 'second']);
    expect(latest?.errorMessage).toBeNull();
  });

  it('allows only one concurrent mutation for the same comment', async () => {
    const update = deferred<ArticleComment>();
    mockedArticlesService.listArticleComments.mockResolvedValue(
      response([comment('existing')]),
    );
    mockedArticlesService.updateArticleComment.mockReturnValue(update.promise);
    await mount();

    await ReactTestRenderer.act(async () => {
      const firstUpdate = latest!.updateComment('existing', 'Updated');
      const duplicateUpdate = latest!.updateComment(
        'existing',
        'Second update',
      );
      expect(mockedArticlesService.updateArticleComment).toHaveBeenCalledTimes(
        1,
      );
      update.resolve(comment('existing', 'Updated'));
      await Promise.all([firstUpdate, duplicateUpdate]);
    });

    expect(latest?.comments[0].body).toBe('Updated');
    expect(latest?.isUpdatingComment('existing')).toBe(false);
  });

  it('does not submit duplicate comment creations before state rerenders', async () => {
    const created = deferred<ArticleComment>();
    mockedArticlesService.listArticleComments.mockResolvedValue(response([]));
    mockedArticlesService.createArticleComment.mockReturnValue(created.promise);
    await mount();

    await ReactTestRenderer.act(async () => {
      const first = latest!.createComment('New comment');
      const duplicate = latest!.createComment('New comment');
      expect(mockedArticlesService.createArticleComment).toHaveBeenCalledTimes(
        1,
      );
      created.resolve(comment('created', 'New comment'));
      await Promise.all([first, duplicate]);
    });

    expect(latest?.comments.map(item => item.id)).toEqual(['created']);
  });

  it('does not let an old article response replace the new article comments', async () => {
    const oldResponse = deferred<PaginatedArticleCommentsResponse>();
    mockedArticlesService.listArticleComments
      .mockReturnValueOnce(oldResponse.promise)
      .mockResolvedValueOnce(response([comment('new-article-comment')]));
    await mount();

    await ReactTestRenderer.act(async () => {
      activeArticleId = 'article-2';
      renderer?.update(<Probe />);
    });

    await ReactTestRenderer.act(async () => {
      oldResponse.resolve(response([comment('stale-comment')]));
      await oldResponse.promise;
    });

    expect(latest?.comments.map(item => item.id)).toEqual([
      'new-article-comment',
    ]);
  });

  it('does not apply a pending mutation after switching articles', async () => {
    const oldUpdate = deferred<ArticleComment>();
    mockedArticlesService.listArticleComments
      .mockResolvedValueOnce(response([comment('old-comment')]))
      .mockResolvedValueOnce(response([comment('new-comment')]));
    mockedArticlesService.updateArticleComment.mockReturnValue(
      oldUpdate.promise,
    );
    await mount();

    let pendingUpdate!: Promise<ArticleComment | null>;
    await ReactTestRenderer.act(async () => {
      pendingUpdate = latest!.updateComment('old-comment', 'Stale update');
    });
    await ReactTestRenderer.act(async () => {
      activeArticleId = 'article-2';
      renderer?.update(<Probe />);
    });
    await ReactTestRenderer.act(async () => {
      oldUpdate.resolve(comment('old-comment', 'Stale update'));
      await pendingUpdate;
    });

    expect(latest?.comments.map(item => item.id)).toEqual(['new-comment']);
  });
});
