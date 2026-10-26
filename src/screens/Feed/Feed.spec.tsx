import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { FlatList } from 'react-native';
import { TextButton } from '../../components';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useArticles } from '../../features/articles/hooks/useArticles';
import { useSavedArticles } from '../../features/articles/hooks/useSavedArticles';
import type { ArticleListItem } from '../../features/articles/types/article';
import { FeedScreen } from './index';

jest.mock('../../features/articles/hooks/useArticles', () => ({
  useArticles: jest.fn(),
}));

jest.mock('../../features/articles/hooks/useSavedArticles', () => ({
  useSavedArticles: jest.fn(),
}));

const mockedUseArticles = useArticles as jest.Mock;
const mockedUseSavedArticles = useSavedArticles as jest.Mock;

const article: ArticleListItem = {
  id: 'article-1',
  title: 'Como conservar folhas',
  slug: 'como-conservar-folhas',
  summary: 'Dicas práticas para o dia a dia.',
  category: 'STORAGE',
  imageUrl: null,
  tags: [],
  author: { id: 'author-1', name: 'Equipe HortiVia', avatarUrl: null },
};

describe('FeedScreen pagination', () => {
  const navigate = jest.fn();
  const loadMore = jest.fn().mockResolvedValue(undefined);
  const retryLoadMore = jest.fn().mockResolvedValue(undefined);
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseArticles.mockReturnValue({
      articles: [article],
      categories: [{ value: 'ALL', label: 'Todos' }],
      canOpenArticle: true,
      isLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      loadMoreError: null,
      isError: false,
      isEmpty: false,
      meta: { page: 1, limit: 20, total: 21, totalPages: 2 },
      retry: jest.fn(),
      refresh: jest.fn(),
      loadMore,
      retryLoadMore,
    });
    mockedUseSavedArticles.mockReturnValue({
      isArticleSaved: jest.fn(() => false),
      isArticleSaveLoading: jest.fn(() => false),
      toggleSavedArticle: jest.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(async () => {
    await ReactTestRenderer.act(async () => renderer?.unmount());
  });

  it('requests the next page when the feed approaches its end', async () => {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <FeedScreen
            navigation={{ navigate } as never}
            route={{ key: 'Feed', name: 'Feed' } as never}
          />
        </ThemeProvider>,
      );
    });

    const list = renderer.root.findByType(FlatList);
    expect(list.props.data).toEqual([article]);

    await ReactTestRenderer.act(async () => {
      await list.props.onEndReached();
    });

    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  it('uses the explicit retry action after an article page failure', async () => {
    mockedUseArticles.mockReturnValue({
      articles: [article],
      categories: [{ value: 'ALL', label: 'Todos' }],
      canOpenArticle: true,
      isLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      loadMoreError: 'Falha ao carregar mais artigos.',
      isError: false,
      isEmpty: false,
      meta: { page: 1, limit: 20, total: 21, totalPages: 2 },
      retry: jest.fn(),
      refresh: jest.fn(),
      loadMore,
      retryLoadMore,
    });

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <FeedScreen
            navigation={{ navigate } as never}
            route={{ key: 'Feed', name: 'Feed' } as never}
          />
        </ThemeProvider>,
      );
    });

    const retryButton = renderer.root
      .findAllByType(TextButton)
      .find(button => button.props.children === 'Tentar novamente');
    expect(retryButton).toBeDefined();
    await ReactTestRenderer.act(async () => retryButton?.props.onPress());
    expect(retryLoadMore).toHaveBeenCalledTimes(1);
    expect(loadMore).not.toHaveBeenCalled();
  });
});
