import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useOptionalAuth } from '../../auth/context/AuthContext';
import {
  ArticleReactionsProvider,
  useArticleReactions,
} from '../context/ArticleReactionsContext';
import { articlesService } from '../services/articles.service';
import { useArticleReaction } from './useArticleReaction';

jest.mock('../../auth/context/AuthContext', () => ({
  useOptionalAuth: jest.fn(),
}));

jest.mock('../services/articles.service', () => ({
  articlesService: {
    reactToArticle: jest.fn(),
    removeArticleReaction: jest.fn(),
  },
}));

const mockedUseOptionalAuth = useOptionalAuth as jest.Mock;
const mockedArticlesService = articlesService as jest.Mocked<
  typeof articlesService
>;

describe('useArticleReaction integration', () => {
  type HookSnapshot = ReturnType<typeof useArticleReaction>;

  let latestHook: HookSnapshot | null = null;

  function HookProbe() {
    useArticleReactions();

    latestHook = useArticleReaction({
      article: {
        id: 'article-1',
        isReacted: false,
        reactionsCount: 0,
      },
    });

    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    latestHook = null;
    mockedUseOptionalAuth.mockReturnValue({
      isAuthenticated: true,
    });
    mockedArticlesService.reactToArticle.mockResolvedValue({
      message: 'Marcado como útil.',
      isReacted: true,
      reactionsCount: 1,
    });
  });

  it('keeps the updated useful count instead of resetting to stale article props', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <ArticleReactionsProvider>
          <HookProbe />
        </ArticleReactionsProvider>,
      );
    });

    expect(latestHook?.reactionsCount).toBe(0);

    await ReactTestRenderer.act(async () => {
      await latestHook?.toggleReaction();
    });

    expect(latestHook?.isReacted).toBe(true);
    expect(latestHook?.reactionsCount).toBe(1);
    expect(mockedArticlesService.reactToArticle).toHaveBeenCalledWith(
      'article-1',
      1,
    );
  });
});
