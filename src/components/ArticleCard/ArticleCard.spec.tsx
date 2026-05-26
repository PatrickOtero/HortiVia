import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { SavedArticleButton } from '../SavedArticleButton';
import { useToggleArticleSaved } from '../../features/articles/hooks/useToggleArticleSaved';
import { ArticleCard } from './index';

jest.mock('../../features/articles/hooks/useToggleArticleSaved', () => ({
  useToggleArticleSaved: jest.fn(),
}));

const mockedUseToggleArticleSaved = useToggleArticleSaved as jest.Mock;

describe('ArticleCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the save button and does not open the article when saving', async () => {
    const toggleSaved = jest.fn();
    const onPress = jest.fn();

    mockedUseToggleArticleSaved.mockReturnValue({
      isSaved: true,
      isSubmitting: false,
      toggleSaved,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <ArticleCard
            article={{
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
            }}
            showSaveButton
            onPress={onPress}
          />
        </ThemeProvider>,
      );
    });

    const saveButton = renderer!.root.findByType(SavedArticleButton);
    const cardButton = renderer!.root.findByProps({ testID: 'article-card' });

    expect(saveButton.props.isSaved).toBe(true);

    const stopPropagation = jest.fn();

    await ReactTestRenderer.act(async () => {
      saveButton.props.onPress({
        stopPropagation,
      });
    });

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(toggleSaved).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      cardButton.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('prefers the explicit saved state over stale article data', async () => {
    mockedUseToggleArticleSaved.mockReturnValue({
      isSaved: false,
      isSubmitting: false,
      toggleSaved: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <ArticleCard
            article={{
              id: 'article-2',
              title: 'Como escolher tomate',
              slug: 'como-escolher-tomate',
              summary: 'Veja sinais simples no tomate.',
              category: 'TIPS',
              imageUrl: null,
              tags: [],
              author: {
                id: 'author-1',
                name: 'Equipe HortiVia',
                avatarUrl: null,
              },
              isSaved: false,
            }}
            showSaveButton
            isSaved
            onPress={jest.fn()}
          />
        </ThemeProvider>,
      );
    });

    const saveButton = renderer!.root.findByType(SavedArticleButton);

    expect(saveButton.props.isSaved).toBe(true);
  });
});
