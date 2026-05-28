import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  ArticleReactionButton,
  CompactProductCard,
  SavedArticleButton,
  SectionTitle,
} from '../../components';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useArticleReaction } from '../../features/articles/hooks/useArticleReaction';
import { useArticleById } from '../../features/articles/hooks/useArticleById';
import { ArticleDetailScreen } from './index';

jest.mock('../../features/articles/hooks/useArticleReaction', () => ({
  useArticleReaction: jest.fn(),
}));

jest.mock('../../features/articles/hooks/useArticleById', () => ({
  useArticleById: jest.fn(),
}));

const mockedUseArticleReaction = useArticleReaction as jest.Mock;
const mockedUseArticleById = useArticleById as jest.Mock;

describe('ArticleDetailScreen', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseArticleReaction.mockReturnValue({
      isReacted: false,
      reactionsCount: 12,
      isLoading: false,
      toggleReaction: jest.fn(),
    });
    mockedUseArticleById.mockReturnValue({
      article: {
        id: 'article-1',
        title: 'Como escolher um abacate no ponto certo',
        slug: 'como-escolher-um-abacate-no-ponto-certo',
        summary: 'Sinais simples para acertar na escolha.',
        subtitle: 'Observe textura, aroma e firmeza.',
        category: 'TIPS',
        imageUrl: null,
        coverImageUrl: 'https://example.com/article-cover.jpg',
        coverImageAlt: 'Abacate cortado ao meio',
        tags: ['abacate'],
        publishedAt: '2026-05-26T10:00:00.000Z',
        readingTimeMinutes: 1,
        reactionsCount: 12,
        isReacted: false,
        author: {
          id: 'author-1',
          name: 'Equipe HortiVia',
          avatarUrl: null,
        },
        content: 'Observe a textura e a casca.',
        blocks: [
          {
            id: 'block-2',
            kind: 'PARAGRAPH',
            body: 'Procure um aroma suave e agradavel.',
            sortOrder: 2,
          },
          {
            id: 'block-1',
            kind: 'HEADING',
            title: 'Veja antes de apertar',
            sortOrder: 1,
          },
        ],
        relatedProducts: [],
      },
      isLoading: false,
      isNotFound: false,
      retry: jest.fn(),
    });
  });

  function renderScreen() {
    return ReactTestRenderer.create(
      <ThemeProvider>
        <ArticleDetailScreen
          navigation={{ navigate, goBack: jest.fn() } as never}
          route={
            {
              key: 'ArticleDetail',
              name: 'ArticleDetail',
              params: { articleId: 'article-1' },
            } as never
          }
        />
      </ThemeProvider>,
    );
  }

  function getRenderedOutput(renderer: ReactTestRenderer.ReactTestRenderer) {
    return JSON.stringify(renderer.toJSON());
  }

  it('renders blocks, subtitle and reading time when available', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    const output = getRenderedOutput(renderer!);

    expect(output).toContain('Observe textura, aroma e firmeza.');
    expect(output).toContain('Veja antes de apertar');
    expect(output).toContain('Procure um aroma suave e agradavel.');
    expect(output).toContain('1 min de leitura');
    expect(output).toContain('12 pessoas acharam útil.');
  });

  it('renders the title after the cover image content', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    const output = getRenderedOutput(renderer!);
    const imageIndex = output.indexOf('https://example.com/article-cover.jpg');
    const titleIndex = output.indexOf(
      'Como escolher um abacate no ponto certo',
    );

    expect(imageIndex).toBeGreaterThanOrEqual(0);
    expect(titleIndex).toBeGreaterThan(imageIndex);
  });

  it('falls back to plain content when blocks are empty', async () => {
    mockedUseArticleById.mockReturnValue({
      article: {
        id: 'article-1',
        title: 'Como conservar folhas',
        slug: 'como-conservar-folhas',
        summary: 'Dicas simples para o dia a dia.',
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
        content: 'Lave.\n\nSeque bem antes de guardar.',
        blocks: [],
      },
      isLoading: false,
      isNotFound: false,
      retry: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    const output = getRenderedOutput(renderer!);

    expect(output).toContain('Lave.');
    expect(output).toContain('Seque bem antes de guardar.');
  });

  it('renders related products when present', async () => {
    mockedUseArticleById.mockReturnValue({
      article: {
        id: 'article-1',
        title: 'Como escolher um abacate no ponto certo',
        slug: 'como-escolher-um-abacate-no-ponto-certo',
        summary: 'Sinais simples para acertar na escolha.',
        category: 'TIPS',
        imageUrl: null,
        tags: ['abacate'],
        publishedAt: '2026-05-26T10:00:00.000Z',
        readingTimeMinutes: 1,
        author: {
          id: 'author-1',
          name: 'Equipe HortiVia',
          avatarUrl: null,
        },
        content: 'Observe a textura e a casca.',
        blocks: [],
        relatedProducts: [
          {
            id: 'product-1',
            name: 'Abacate',
            slug: 'abacate',
            category: 'FRUIT',
            shortDescription: 'Vai bem em torradas, vitaminas e cremes.',
            imageUrl: null,
          },
        ],
      },
      isLoading: false,
      isNotFound: false,
      retry: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    const relatedCards = renderer!.root.findAllByType(CompactProductCard);
    const sectionTitles = renderer!.root
      .findAllByType(SectionTitle)
      .map(section => section.props.title);

    expect(sectionTitles).toContain('Produtos relacionados');
    expect(relatedCards).toHaveLength(1);
  });

  it('does not crash when related products are missing', async () => {
    mockedUseArticleById.mockReturnValue({
      article: {
        id: 'article-1',
        title: 'Como escolher um abacate no ponto certo',
        slug: 'como-escolher-um-abacate-no-ponto-certo',
        summary: 'Sinais simples para acertar na escolha.',
        category: 'TIPS',
        imageUrl: null,
        tags: ['abacate'],
        publishedAt: '2026-05-26T10:00:00.000Z',
        readingTimeMinutes: 1,
        author: {
          id: 'author-1',
          name: 'Equipe HortiVia',
          avatarUrl: null,
        },
        content: 'Observe a textura e a casca.',
        blocks: [],
      },
      isLoading: false,
      isNotFound: false,
      retry: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    const sectionTitles = renderer!.root
      .findAllByType(SectionTitle)
      .map(section => section.props.title);

    expect(sectionTitles).not.toContain('Produtos relacionados');
  });

  it('keeps the save button visible', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    expect(renderer!.root.findAllByType(SavedArticleButton)).toHaveLength(1);
  });

  it('renders the active useful state from the reaction hook', async () => {
    mockedUseArticleReaction.mockReturnValue({
      isReacted: true,
      reactionsCount: 19,
      isLoading: false,
      toggleReaction: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    const reactionButton = renderer!.root.findByType(ArticleReactionButton);

    expect(reactionButton.props.isActive).toBe(true);
    expect(reactionButton.props.count).toBe(19);
  });

  it('taps the useful action without affecting block rendering', async () => {
    const toggleReaction = jest.fn();

    mockedUseArticleReaction.mockReturnValue({
      isReacted: false,
      reactionsCount: 12,
      isLoading: false,
      toggleReaction,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    const reactionButton = renderer!.root.findByType(ArticleReactionButton);
    const outputBefore = getRenderedOutput(renderer!);

    expect(outputBefore).toContain('Procure um aroma suave e agradavel.');

    await ReactTestRenderer.act(async () => {
      reactionButton.props.onPress();
    });

    expect(toggleReaction).toHaveBeenCalledTimes(1);
    expect(getRenderedOutput(renderer!)).toContain(
      'Procure um aroma suave e agradavel.',
    );
  });

  it('opens product detail when tapping a related product', async () => {
    mockedUseArticleById.mockReturnValue({
      article: {
        id: 'article-1',
        title: 'Como escolher um abacate no ponto certo',
        slug: 'como-escolher-um-abacate-no-ponto-certo',
        summary: 'Sinais simples para acertar na escolha.',
        category: 'TIPS',
        imageUrl: null,
        tags: ['abacate'],
        publishedAt: '2026-05-26T10:00:00.000Z',
        readingTimeMinutes: 1,
        author: {
          id: 'author-1',
          name: 'Equipe HortiVia',
          avatarUrl: null,
        },
        content: 'Observe a textura e a casca.',
        blocks: [],
        relatedProducts: [
          {
            id: 'product-1',
            name: 'Abacate',
            slug: 'abacate',
            category: 'FRUIT',
            shortDescription: 'Vai bem em torradas, vitaminas e cremes.',
            imageUrl: null,
          },
        ],
      },
      isLoading: false,
      isNotFound: false,
      retry: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    const relatedCard = renderer!.root.findByType(CompactProductCard);

    await ReactTestRenderer.act(async () => {
      relatedCard.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('ProductDetail', {
      productId: 'product-1',
    });
  });
});
