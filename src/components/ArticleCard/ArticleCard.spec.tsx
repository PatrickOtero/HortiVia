import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ArticleReactionButton } from '../ArticleReactionButton';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useArticleReaction } from '../../features/articles/hooks/useArticleReaction';
import { SavedArticleButton } from '../SavedArticleButton';
import { useToggleArticleSaved } from '../../features/articles/hooks/useToggleArticleSaved';
import { ArticleCard } from './index';

jest.mock('../../features/articles/hooks/useArticleReaction', () => ({
  useArticleReaction: jest.fn(),
}));

jest.mock('../../features/articles/hooks/useToggleArticleSaved', () => ({
  useToggleArticleSaved: jest.fn(),
}));

const mockedUseArticleReaction = useArticleReaction as jest.Mock;
const mockedUseToggleArticleSaved = useToggleArticleSaved as jest.Mock;

const baseArticle = {
  id: 'article-1',
  title: 'Como conservar folhas',
  slug: 'como-conservar-folhas',
  summary: 'Dicas para manter as folhas firmes.',
  category: 'STORAGE' as const,
  imageUrl: 'https://example.com/fallback-image.jpg',
  coverImageUrl: 'https://example.com/cover-image.jpg',
  tags: [],
  publishedAt: '2026-05-26T10:00:00.000Z',
  readingTimeMinutes: 2,
  author: {
    id: 'author-1',
    name: 'Equipe HortiVia',
    avatarUrl: null,
  },
  isSaved: true,
};

describe('ArticleCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseArticleReaction.mockReturnValue({
      isReacted: false,
      reactionsCount: 12,
      isLoading: false,
      toggleReaction: jest.fn(),
    });
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
          <ArticleCard article={baseArticle} showSaveButton onPress={onPress} />
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
              ...baseArticle,
              id: 'article-2',
              title: 'Como escolher tomate',
              slug: 'como-escolher-tomate',
              category: 'TIPS',
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

  it('shows the title only once', async () => {
    mockedUseToggleArticleSaved.mockReturnValue({
      isSaved: false,
      isSubmitting: false,
      toggleSaved: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <ArticleCard article={baseArticle} onPress={jest.fn()} />
        </ThemeProvider>,
      );
    });

    const output = JSON.stringify(renderer!.toJSON());
    const titleMatches = output.match(/Como conservar folhas/g) ?? [];

    expect(titleMatches).toHaveLength(1);
  });

  it('uses coverImageUrl before imageUrl', async () => {
    mockedUseToggleArticleSaved.mockReturnValue({
      isSaved: false,
      isSubmitting: false,
      toggleSaved: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <ArticleCard article={baseArticle} onPress={jest.fn()} />
        </ThemeProvider>,
      );
    });

    const output = JSON.stringify(renderer!.toJSON());

    expect(output).toContain('https://example.com/cover-image.jpg');
    expect(output).not.toContain('https://example.com/fallback-image.jpg');
  });

  it('renders the useful count and does not open the article when toggling it', async () => {
    const toggleReaction = jest.fn();
    const onPress = jest.fn();

    mockedUseToggleArticleSaved.mockReturnValue({
      isSaved: false,
      isSubmitting: false,
      toggleSaved: jest.fn(),
    });
    mockedUseArticleReaction.mockReturnValue({
      isReacted: false,
      reactionsCount: 12,
      isLoading: false,
      toggleReaction,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <ArticleCard article={baseArticle} onPress={onPress} />
        </ThemeProvider>,
      );
    });

    const reactionButton = renderer!.root.findByType(ArticleReactionButton);

    expect(reactionButton.props.count).toBe(12);

    const stopPropagation = jest.fn();

    await ReactTestRenderer.act(async () => {
      reactionButton.props.onPress({ stopPropagation });
    });

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(toggleReaction).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });
});
