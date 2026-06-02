import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ArticleReactionButton } from '../ArticleReactionButton';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useArticleReaction } from '../../features/articles/hooks/useArticleReaction';
import { CompactArticleCard } from './index';

jest.mock('../../features/articles/hooks/useArticleReaction', () => ({
  useArticleReaction: jest.fn(),
}));

const mockedUseArticleReaction = useArticleReaction as jest.Mock;

describe('CompactArticleCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseArticleReaction.mockReturnValue({
      isReacted: true,
      reactionsCount: 8,
      isLoading: false,
      toggleReaction: jest.fn(),
    });
  });

  it('renders the shared useful state when reaction data is available', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <CompactArticleCard
            article={{
              id: 'article-1',
              title: 'Como conservar folhas',
              summary: 'Dicas simples para manter folhas frescas.',
              category: 'STORAGE',
              imageUrl: null,
              reactionsCount: 2,
              isReacted: false,
            }}
            onPress={jest.fn()}
          />
        </ThemeProvider>,
      );
    });

    const reactionButton = renderer!.root.findByType(ArticleReactionButton);

    expect(reactionButton.props.isActive).toBe(true);
    expect(reactionButton.props.count).toBe(8);
    expect(reactionButton.props.showLabel).toBe(false);
  });
});
