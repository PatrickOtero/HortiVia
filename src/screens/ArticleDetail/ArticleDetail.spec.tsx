import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { CompactProductCard, SectionTitle } from '../../components';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useArticleById } from '../../features/articles/hooks/useArticleById';
import { ArticleDetailScreen } from './index';

jest.mock('../../features/articles/hooks/useArticleById', () => ({
  useArticleById: jest.fn(),
}));

const mockedUseArticleById = useArticleById as jest.Mock;

describe('ArticleDetailScreen', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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
          route={{
            key: 'ArticleDetail',
            name: 'ArticleDetail',
            params: { articleId: 'article-1' },
          } as never}
        />
      </ThemeProvider>,
    );
  }

  it('hides related products when none are available', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    const sectionTitles = renderer!.root
      .findAllByType(SectionTitle)
      .map(section => section.props.title);

    expect(sectionTitles).not.toContain('Produtos relacionados');
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
