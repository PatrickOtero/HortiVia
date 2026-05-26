import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { EmptyStateCard } from '../../components';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useSavedArticles } from '../../features/articles/hooks/useSavedArticles';
import { SavedArticlesScreen } from './index';

jest.mock('../../features/articles/hooks/useSavedArticles', () => ({
  useSavedArticles: jest.fn(),
}));

const mockedUseSavedArticles = useSavedArticles as jest.Mock;

describe('SavedArticlesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the empty state when the user has no saved articles', async () => {
    mockedUseSavedArticles.mockReturnValue({
      articles: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      isLoading: false,
      isRefreshing: false,
      isError: false,
      isEmpty: true,
      errorMessage: null,
      refreshSavedArticles: jest.fn(),
      retrySavedArticles: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <SavedArticlesScreen
            navigation={{ navigate: jest.fn(), goBack: jest.fn() } as never}
            route={{ key: 'SavedArticles', name: 'SavedArticles' } as never}
          />
        </ThemeProvider>,
      );
    });

    const emptyStateCard = renderer!.root.findByType(EmptyStateCard);

    expect(emptyStateCard.props.title).toBe('Nenhuma leitura salva ainda.');
    expect(emptyStateCard.props.description).toBe(
      'Salve artigos para encontrar conteúdos úteis mais tarde.',
    );
  });
});
