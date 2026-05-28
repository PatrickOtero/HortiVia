import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useOptionalAuth } from '../../auth/context/AuthContext';
import { useOptionalArticleReactions } from '../context/ArticleReactionsContext';
import { useArticleReaction } from './useArticleReaction';

jest.mock('../../auth/context/AuthContext', () => ({
  useOptionalAuth: jest.fn(),
}));

jest.mock('../context/ArticleReactionsContext', () => ({
  useOptionalArticleReactions: jest.fn(),
}));

const mockedUseOptionalAuth = useOptionalAuth as jest.Mock;
const mockedUseOptionalArticleReactions =
  useOptionalArticleReactions as jest.Mock;

describe('useArticleReaction', () => {
  type HookSnapshot = ReturnType<typeof useArticleReaction>;

  let latestHook: HookSnapshot | null = null;

  function HookProbe(props: {
    onRequireAuth?: () => void;
    onError?: (message: string) => void;
  }) {
    latestHook = useArticleReaction({
      article: {
        id: 'article-1',
        isReacted: false,
        reactionsCount: 2,
      },
      onRequireAuth: props.onRequireAuth,
      onError: props.onError,
    });

    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    latestHook = null;
    const articleReactions = {
      syncArticleReactions: jest.fn(),
      getArticleReactionState: jest.fn().mockReturnValue({
        isReacted: false,
        reactionsCount: 2,
      }),
      isArticleReactionLoading: jest.fn().mockReturnValue(false),
      toggleArticleReaction: jest.fn().mockResolvedValue({
        isReacted: true,
        reactionsCount: 3,
      }),
    };

    mockedUseOptionalArticleReactions.mockReturnValue(articleReactions);
  });

  it('shows safe auth behavior for logged-out users', async () => {
    const onRequireAuth = jest.fn();
    const articleReactions = {
      syncArticleReactions: jest.fn(),
      getArticleReactionState: jest.fn().mockReturnValue({
        isReacted: false,
        reactionsCount: 2,
      }),
      isArticleReactionLoading: jest.fn().mockReturnValue(false),
      toggleArticleReaction: jest.fn(),
    };

    mockedUseOptionalAuth.mockReturnValue({
      isAuthenticated: false,
    });
    mockedUseOptionalArticleReactions.mockReturnValue(articleReactions);

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<HookProbe onRequireAuth={onRequireAuth} />);
    });

    await ReactTestRenderer.act(async () => {
      await latestHook?.toggleReaction();
    });

    expect(onRequireAuth).toHaveBeenCalledTimes(1);
    expect(articleReactions.toggleArticleReaction).not.toHaveBeenCalled();
  });

  it('shows a safe error message when no reaction source is available', async () => {
    const onError = jest.fn();

    mockedUseOptionalAuth.mockReturnValue({
      isAuthenticated: true,
    });
    mockedUseOptionalArticleReactions.mockReturnValue(undefined);

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<HookProbe onError={onError} />);
    });

    await ReactTestRenderer.act(async () => {
      await latestHook?.toggleReaction();
    });

    expect(onError).toHaveBeenCalledWith(
      'Não foi possível atualizar esta marcação.',
    );
  });
});
