import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { articlesService } from '../services/articles.service';
import {
  ArticleReactionsProvider,
  useArticleReactions,
} from './ArticleReactionsContext';

jest.mock('../services/articles.service', () => ({
  articlesService: {
    reactToArticle: jest.fn(),
    removeArticleReaction: jest.fn(),
  },
}));

const mockedArticlesService = articlesService as jest.Mocked<
  typeof articlesService
>;

describe('ArticleReactionsContext', () => {
  type HookSnapshot = ReturnType<typeof useArticleReactions>;

  let latestHook: HookSnapshot | null = null;

  function HookProbe() {
    latestHook = useArticleReactions();
    return null;
  }

  async function renderProvider() {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <ArticleReactionsProvider>
          <HookProbe />
        </ArticleReactionsProvider>,
      );
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    latestHook = null;
    mockedArticlesService.reactToArticle.mockResolvedValue({
      message: 'Marcado como útil.',
      isReacted: true,
      reactionsCount: 3,
    });
    mockedArticlesService.removeArticleReaction.mockResolvedValue({
      message: 'Marcação removida.',
      isReacted: false,
      reactionsCount: 2,
    });
  });

  it('syncs incoming article states by id', async () => {
    await renderProvider();

    await ReactTestRenderer.act(async () => {
      latestHook?.syncArticleReactions({
        id: 'article-1',
        isReacted: true,
        reactionsCount: 4,
      });
    });

    expect(
      latestHook?.getArticleReactionState({
        id: 'article-1',
        isReacted: false,
        reactionsCount: 0,
      }),
    ).toEqual({
      isReacted: true,
      reactionsCount: 4,
    });
  });

  it('toggles useful state with optimistic update and backend confirmation', async () => {
    await renderProvider();

    let result:
      | {
          isReacted: boolean;
          reactionsCount: number;
        }
      | undefined;

    await ReactTestRenderer.act(async () => {
      result = await latestHook?.toggleArticleReaction({
        id: 'article-2',
        isReacted: false,
        reactionsCount: 2,
      });
    });

    expect(mockedArticlesService.reactToArticle).toHaveBeenCalledWith(
      'article-2',
      3,
    );
    expect(result).toEqual({
      isReacted: true,
      reactionsCount: 3,
    });
    expect(
      latestHook?.getArticleReactionState({
        id: 'article-2',
        isReacted: false,
        reactionsCount: 0,
      }),
    ).toEqual({
      isReacted: true,
      reactionsCount: 3,
    });
  });

  it('rolls back a failed toggle and clears loading', async () => {
    mockedArticlesService.reactToArticle.mockRejectedValueOnce(
      new Error('failed'),
    );

    await renderProvider();

    await ReactTestRenderer.act(async () => {
      await expect(
        latestHook?.toggleArticleReaction({
          id: 'article-3',
          isReacted: false,
          reactionsCount: 1,
        }) ?? Promise.reject(new Error('missing hook')),
      ).rejects.toBeTruthy();
    });

    expect(latestHook?.isArticleReactionLoading('article-3')).toBe(false);
    expect(
      latestHook?.getArticleReactionState({
        id: 'article-3',
        isReacted: false,
        reactionsCount: 1,
      }),
    ).toEqual({
      isReacted: false,
      reactionsCount: 1,
    });
  });

  it('never lets the useful count become negative', async () => {
    mockedArticlesService.removeArticleReaction.mockResolvedValueOnce({
      message: 'Marcação removida.',
      isReacted: false,
      reactionsCount: 0,
    });

    await renderProvider();

    await ReactTestRenderer.act(async () => {
      await latestHook?.toggleArticleReaction({
        id: 'article-4',
        isReacted: true,
        reactionsCount: 0,
      });
    });

    expect(
      latestHook?.getArticleReactionState({
        id: 'article-4',
        isReacted: true,
        reactionsCount: 0,
      }),
    ).toEqual({
      isReacted: false,
      reactionsCount: 0,
    });
  });

  it('ignores repeated taps while the same article is already loading', async () => {
    let resolveReaction:
      | ((value: { message: string; isReacted: boolean; reactionsCount: number }) => void)
      | undefined;

    mockedArticlesService.reactToArticle.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveReaction = resolve;
        }),
    );

    await renderProvider();

    let firstResult:
      | {
          isReacted: boolean;
          reactionsCount: number;
        }
      | undefined;
    let secondResult:
      | {
          isReacted: boolean;
          reactionsCount: number;
        }
      | undefined;

    await ReactTestRenderer.act(async () => {
      const firstToggle = latestHook?.toggleArticleReaction({
        id: 'article-5',
        isReacted: false,
        reactionsCount: 2,
      });
      const secondToggle = latestHook?.toggleArticleReaction({
        id: 'article-5',
        isReacted: false,
        reactionsCount: 2,
      });

      secondResult = await secondToggle;

      resolveReaction?.({
        message: 'Marcado como útil.',
        isReacted: true,
        reactionsCount: 3,
      });

      firstResult = await firstToggle;
    });

    expect(mockedArticlesService.reactToArticle).toHaveBeenCalledTimes(1);
    expect(firstResult).toEqual({
      isReacted: true,
      reactionsCount: 3,
    });
    expect(secondResult).toEqual({
      isReacted: true,
      reactionsCount: 3,
    });
    expect(
      latestHook?.getArticleReactionState({
        id: 'article-5',
        isReacted: false,
        reactionsCount: 0,
      }),
    ).toEqual({
      isReacted: true,
      reactionsCount: 3,
    });
  });

  it('keeps the updated useful count when the backend response omits reactionsCount', async () => {
    mockedArticlesService.reactToArticle.mockResolvedValueOnce({
      message: 'Marcado como Ãºtil.',
      isReacted: true,
      reactionsCount: 1,
    });

    await renderProvider();

    await ReactTestRenderer.act(async () => {
      await latestHook?.toggleArticleReaction({
        id: 'article-6',
        isReacted: false,
        reactionsCount: 0,
      });
    });

    expect(mockedArticlesService.reactToArticle).toHaveBeenCalledWith(
      'article-6',
      1,
    );
    expect(
      latestHook?.getArticleReactionState({
        id: 'article-6',
        isReacted: false,
        reactionsCount: 0,
      }),
    ).toEqual({
      isReacted: true,
      reactionsCount: 1,
    });
  });
});
