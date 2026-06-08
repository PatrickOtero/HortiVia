import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import {
  ArticleReactionButton,
  CompactProductCard,
  SavedArticleButton,
  SectionTitle,
} from '../../components';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useArticleById } from '../../features/articles/hooks/useArticleById';
import { useArticleReaction } from '../../features/articles/hooks/useArticleReaction';
import { useToggleArticleSaved } from '../../features/articles/hooks/useToggleArticleSaved';
import { articlesService } from '../../features/articles/services/articles.service';
import type { ArticleComment } from '../../features/articles/types/article';
import { useOptionalAuth } from '../../features/auth/context/AuthContext';
import { ArticleDetailScreen } from './index';

jest.mock('../../features/articles/hooks/useArticleReaction', () => ({
  useArticleReaction: jest.fn(),
}));

jest.mock('../../features/articles/hooks/useArticleById', () => ({
  useArticleById: jest.fn(),
}));

jest.mock('../../features/articles/hooks/useToggleArticleSaved', () => ({
  useToggleArticleSaved: jest.fn(),
}));

jest.mock('../../features/auth/context/AuthContext', () => ({
  useOptionalAuth: jest.fn(),
}));

jest.mock('../../features/articles/services/articles.service', () => ({
  ARTICLE_COMMENTS_PAGE_LIMIT: 10,
  articlesService: {
    listArticleComments: jest.fn(),
    createArticleComment: jest.fn(),
    updateArticleComment: jest.fn(),
    deleteArticleComment: jest.fn(),
    moderateArticleComment: jest.fn(),
  },
}));

const mockedUseArticleReaction = useArticleReaction as jest.Mock;
const mockedUseArticleById = useArticleById as jest.Mock;
const mockedUseToggleArticleSaved = useToggleArticleSaved as jest.Mock;
const mockedUseOptionalAuth = useOptionalAuth as jest.Mock;
const mockedArticlesService = articlesService as jest.Mocked<typeof articlesService>;

function createArticleDetail(overrides?: Record<string, unknown>) {
  return {
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
    commentsCount: 0,
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
    ...overrides,
  };
}

function createComment(overrides?: Partial<ArticleComment>): ArticleComment {
  return {
    id: 'comment-1',
    body: 'Comentario de teste',
    status: 'VISIBLE',
    createdAt: '2026-06-02T10:00:00.000Z',
    updatedAt: '2026-06-02T10:00:00.000Z',
    author: {
      id: 'user-1',
      name: 'Pessoa leitora',
    },
    ...overrides,
  };
}

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
      article: createArticleDetail(),
      isLoading: false,
      isNotFound: false,
      retry: jest.fn(),
    });
    mockedUseToggleArticleSaved.mockReturnValue({
      isSaved: false,
      isSubmitting: false,
      toggleSaved: jest.fn(),
    });
    mockedUseOptionalAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'user-1',
        name: 'Pessoa leitora',
        role: 'USER',
      },
    });
    mockedArticlesService.listArticleComments.mockResolvedValue({
      items: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
    mockedArticlesService.createArticleComment.mockImplementation(
      async (_articleId, body) =>
        createComment({
          body,
        }),
    );
    mockedArticlesService.updateArticleComment.mockImplementation(
      async (_articleId, commentId, body) =>
        createComment({
          id: commentId,
          body,
        }),
    );
    mockedArticlesService.deleteArticleComment.mockResolvedValue();
    mockedArticlesService.moderateArticleComment.mockImplementation(
      async (_articleId, commentId, status) =>
        createComment({
          id: commentId,
          status,
        }),
    );
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

  async function renderAndWait() {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = renderScreen();
    });

    return renderer!;
  }

  function getRenderedOutput(renderer: ReactTestRenderer.ReactTestRenderer) {
    return JSON.stringify(renderer.toJSON());
  }

  function findPressablesByTestId(
    renderer: ReactTestRenderer.ReactTestRenderer,
    testID: string,
  ) {
    return renderer.root.findAll(
      node =>
        node.props.testID === testID &&
        typeof node.props.onPress === 'function',
    );
  }

  it('renders blocks, useful action and comments empty state', async () => {
    const renderer = await renderAndWait();
    const output = getRenderedOutput(renderer);

    expect(output).toContain('Observe textura, aroma e firmeza.');
    expect(output).toContain('Veja antes de apertar');
    expect(output).toContain('Procure um aroma suave e agradavel.');
    expect(output).toContain('12 pessoas acharam util.');
    expect(output).toContain('Nenhum comentario ainda.');
  });

  it('shows the composer for authenticated users', async () => {
    const renderer = await renderAndWait();

    expect(renderer.root.findByProps({ testID: 'comment-composer-input' })).toBeTruthy();
    expect(getRenderedOutput(renderer)).toContain('Publicar comentario');
  });

  it('shows the login prompt for unauthenticated users', async () => {
    mockedUseOptionalAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    const renderer = await renderAndWait();
    const output = getRenderedOutput(renderer);

    expect(output).toContain('Entre para comentar.');
    expect(renderer.root.findAllByProps({ testID: 'comment-composer-input' })).toHaveLength(0);
  });

  it('publishes a valid comment and adds it to the local list', async () => {
    const renderer = await renderAndWait();
    const composerInput = renderer.root.findByProps({
      testID: 'comment-composer-input',
    });
    const submitButton = renderer.root.findByProps({
      testID: 'comment-submit-button',
    });

    await ReactTestRenderer.act(async () => {
      composerInput.props.onChangeText('Comentario util');
    });

    await ReactTestRenderer.act(async () => {
      submitButton.props.onPress();
    });

    expect(mockedArticlesService.createArticleComment).toHaveBeenCalledWith(
      'article-1',
      'Comentario util',
    );
    expect(getRenderedOutput(renderer)).toContain('Comentario util');

    const composerAfterSubmit = renderer.root.findByProps({
      testID: 'comment-composer-input',
    });

    expect(composerAfterSubmit.props.value).toBe('');
  });

  it('blocks empty comment submission', async () => {
    const renderer = await renderAndWait();
    const submitButton = renderer.root.findByProps({
      testID: 'comment-submit-button',
    });

    await ReactTestRenderer.act(async () => {
      submitButton.props.onPress();
    });

    expect(mockedArticlesService.createArticleComment).not.toHaveBeenCalled();
    expect(getRenderedOutput(renderer)).toContain(
      'Escreva um comentario antes de publicar.',
    );
  });

  it('shows the edit action only for the owner comment', async () => {
    mockedArticlesService.listArticleComments.mockResolvedValue({
      items: [
        createComment({
          id: 'comment-owner',
          body: 'Meu comentario',
          author: {
            id: 'user-1',
            name: 'Pessoa leitora',
          },
        }),
        createComment({
          id: 'comment-other',
          body: 'Comentario de outra pessoa',
          author: {
            id: 'user-2',
            name: 'Outra pessoa',
          },
        }),
      ],
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });

    const renderer = await renderAndWait();

    expect(
      findPressablesByTestId(renderer, 'comment-action-edit-comment-owner')
        .length,
    ).toBeGreaterThan(0);
    expect(
      findPressablesByTestId(renderer, 'comment-action-edit-comment-other'),
    ).toHaveLength(0);
  });

  it('saves an edited own comment and updates it locally', async () => {
    mockedArticlesService.listArticleComments.mockResolvedValue({
      items: [
        createComment({
          id: 'comment-owner',
          body: 'Texto original',
        }),
      ],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });

    const renderer = await renderAndWait();
    const editButton = renderer.root.findByProps({
      testID: 'comment-action-edit-comment-owner',
    });

    await ReactTestRenderer.act(async () => {
      editButton.props.onPress();
    });

    const editInput = renderer.root.findByProps({
      testID: 'comment-edit-input-comment-owner',
    });

    await ReactTestRenderer.act(async () => {
      editInput.props.onChangeText('Texto atualizado');
    });

    const saveButton = renderer.root.findByProps({
      testID: 'comment-save-button-comment-owner',
    });

    await ReactTestRenderer.act(async () => {
      saveButton.props.onPress();
    });

    expect(mockedArticlesService.updateArticleComment).toHaveBeenCalledWith(
      'article-1',
      'comment-owner',
      'Texto atualizado',
    );
    expect(getRenderedOutput(renderer)).toContain('Texto atualizado');
    expect(getRenderedOutput(renderer)).not.toContain('Texto original');
  });

  it('shows delete only for owner and admin users', async () => {
    mockedArticlesService.listArticleComments.mockResolvedValue({
      items: [
        createComment({
          id: 'comment-owner',
          body: 'Meu comentario',
          author: {
            id: 'user-1',
            name: 'Pessoa leitora',
          },
        }),
        createComment({
          id: 'comment-other',
          body: 'Comentario de outra pessoa',
          author: {
            id: 'user-2',
            name: 'Outra pessoa',
          },
        }),
      ],
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });

    const rendererForUser = await renderAndWait();

    expect(
      findPressablesByTestId(
        rendererForUser,
        'comment-action-remove-comment-owner',
      ).length,
    ).toBeGreaterThan(0);
    expect(
      findPressablesByTestId(
        rendererForUser,
        'comment-action-remove-comment-other',
      ),
    ).toHaveLength(0);

    mockedUseOptionalAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'admin-1',
        name: 'Admin',
        role: 'ADMIN',
      },
    });

    const rendererForAdmin = await renderAndWait();

    expect(
      findPressablesByTestId(
        rendererForAdmin,
        'comment-action-remove-comment-owner',
      ).length,
    ).toBeGreaterThan(0);
    expect(
      findPressablesByTestId(
        rendererForAdmin,
        'comment-action-remove-comment-other',
      ).length,
    ).toBeGreaterThan(0);
  });

  it('removes a comment locally after confirmation', async () => {
    mockedArticlesService.listArticleComments.mockResolvedValue({
      items: [
        createComment({
          id: 'comment-owner',
          body: 'Vou sair da lista',
        }),
      ],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });

    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _message, buttons) => {
        buttons?.[1]?.onPress?.();
      });

    const renderer = await renderAndWait();
    const removeButton = renderer.root.findByProps({
      testID: 'comment-action-remove-comment-owner',
    });

    await ReactTestRenderer.act(async () => {
      removeButton.props.onPress();
    });

    expect(mockedArticlesService.deleteArticleComment).toHaveBeenCalledWith(
      'article-1',
      'comment-owner',
    );
    expect(getRenderedOutput(renderer)).not.toContain('Vou sair da lista');

    alertSpy.mockRestore();
  });

  it('appends comments when loading more', async () => {
    mockedArticlesService.listArticleComments
      .mockResolvedValueOnce({
        items: [
          createComment({
            id: 'comment-1',
            body: 'Primeira pagina',
          }),
        ],
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        items: [
          createComment({
            id: 'comment-2',
            body: 'Segunda pagina',
          }),
        ],
        page: 2,
        limit: 10,
        total: 2,
        totalPages: 2,
      });

    const renderer = await renderAndWait();
    const loadMoreButton = renderer.root.findByProps({
      testID: 'comments-load-more-button',
    });

    await ReactTestRenderer.act(async () => {
      loadMoreButton.props.onPress();
    });

    expect(mockedArticlesService.listArticleComments).toHaveBeenNthCalledWith(
      1,
      'article-1',
      {
        page: 1,
        limit: 10,
      },
    );
    expect(mockedArticlesService.listArticleComments).toHaveBeenNthCalledWith(
      2,
      'article-1',
      {
        page: 2,
        limit: 10,
      },
    );
    expect(getRenderedOutput(renderer)).toContain('Primeira pagina');
    expect(getRenderedOutput(renderer)).toContain('Segunda pagina');
  });

  it('keeps the save button visible', async () => {
    const renderer = await renderAndWait();

    expect(renderer.root.findAllByType(SavedArticleButton)).toHaveLength(1);
  });

  it('renders the active useful state from the reaction hook', async () => {
    mockedUseArticleReaction.mockReturnValue({
      isReacted: true,
      reactionsCount: 19,
      isLoading: false,
      toggleReaction: jest.fn(),
    });

    const renderer = await renderAndWait();
    const reactionButton = renderer.root.findByType(ArticleReactionButton);

    expect(reactionButton.props.isActive).toBe(true);
    expect(reactionButton.props.count).toBe(19);
  });

  it('taps the useful action without affecting article blocks', async () => {
    const toggleReaction = jest.fn();
    mockedUseArticleReaction.mockReturnValue({
      isReacted: false,
      reactionsCount: 12,
      isLoading: false,
      toggleReaction,
    });

    const renderer = await renderAndWait();
    const reactionButton = renderer.root.findByType(ArticleReactionButton);
    const outputBefore = getRenderedOutput(renderer);

    expect(outputBefore).toContain('Procure um aroma suave e agradavel.');

    await ReactTestRenderer.act(async () => {
      reactionButton.props.onPress();
    });

    expect(toggleReaction).toHaveBeenCalledTimes(1);
    expect(getRenderedOutput(renderer)).toContain(
      'Procure um aroma suave e agradavel.',
    );
  });

  it('renders related products when present', async () => {
    mockedUseArticleById.mockReturnValue({
      article: createArticleDetail({
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
      }),
      isLoading: false,
      isNotFound: false,
      retry: jest.fn(),
    });

    const renderer = await renderAndWait();
    const relatedCards = renderer.root.findAllByType(CompactProductCard);
    const sectionTitles = renderer.root
      .findAllByType(SectionTitle)
      .map(section => section.props.title);

    expect(sectionTitles).toContain('Produtos relacionados');
    expect(relatedCards).toHaveLength(1);
  });
});
