import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  FilterChip,
  InputField,
  PrimaryButton,
  SecondaryButton,
  TextButton,
} from '../../../../components';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import { useAuth } from '../../../auth/hooks/useAuth';
import { articlesService } from '../../../articles/services/articles.service';
import { ArticleBlockImageManager } from '../ArticleBlockImageManager';
import { ArticleBlockManager } from './index';

jest.mock('../../../auth/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../articles/services/articles.service', () => ({
  articlesService: {
    createArticleBlock: jest.fn(),
    updateArticleBlock: jest.fn(),
    deleteArticleBlock: jest.fn(),
  },
}));

jest.mock('../ArticleBlockImageManager', () => ({
  ArticleBlockImageManager: jest.fn(() => null),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedArticlesService = articlesService as jest.Mocked<typeof articlesService>;
const mockedArticleBlockImageManager =
  ArticleBlockImageManager as jest.MockedFunction<typeof ArticleBlockImageManager>;

function createAuthValue(role: 'ADMIN' | 'USER'): ReturnType<typeof useAuth> {
  return {
    user: {
      id: `${role.toLowerCase()}-1`,
      name: role === 'ADMIN' ? 'Admin' : 'User',
      email: `${role.toLowerCase()}@hortivia.com`,
      role,
      avatarUrl: null,
      gender: null,
      emailVerified: true,
      createdAt: '2026-05-27T10:00:00.000Z',
      updatedAt: '2026-05-27T10:00:00.000Z',
    },
    accessToken: 'token',
    isAuthenticated: true,
    isLoading: false,
    signIn: jest.fn(),
    registerAccount: jest.fn(),
    confirmEmail: jest.fn(),
    resendConfirmation: jest.fn(),
    requestPasswordReset: jest.fn(),
    resendPasswordResetCode: jest.fn(),
    resetPassword: jest.fn(),
    signOut: jest.fn(),
    loadAuthenticatedUser: jest.fn(),
    syncUser: jest.fn(),
  };
}

describe('ArticleBlockManager', () => {
  const blocks = [
    {
      id: 'block-1',
      articleId: 'article-1',
      kind: 'SECTION' as const,
      title: 'Secagem correta',
      body: 'Seque bem antes de guardar.',
      items: ['Use um pano limpo'],
      sortOrder: 1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue(createAuthValue('ADMIN'));
  });

  async function renderManager(
    props?: Partial<React.ComponentProps<typeof ArticleBlockManager>>,
  ) {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <ArticleBlockManager
            articleId="article-1"
            blocks={[]}
            onCreateBlock={jest.fn()}
            onUpdateBlock={jest.fn()}
            onDeleteBlock={jest.fn()}
            {...props}
          />
        </ThemeProvider>,
      );
    });

    return renderer!;
  }

  it('shows add button and empty state when there are no blocks', async () => {
    const renderer = await renderManager();
    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain('Adicionar bloco');
    expect(output).toContain('Nenhum bloco cadastrado.');
  });

  it('shows the save block message before image controls on create mode', async () => {
    const renderer = await renderManager();
    const addButton = renderer.root.findByType(PrimaryButton);

    await ReactTestRenderer.act(async () => {
      addButton.props.onPress();
    });

    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain('Salve o bloco para adicionar imagem.');
    expect(mockedArticleBlockImageManager).not.toHaveBeenCalled();
  });

  it('creates a block from the editor', async () => {
    const onCreateBlock = jest.fn();
    mockedArticlesService.createArticleBlock.mockResolvedValue({
      ...blocks[0],
      id: 'block-2',
      title: 'Novo bloco',
      sortOrder: 0,
    });

    const renderer = await renderManager({
      onCreateBlock,
    });

    const addButton = renderer.root.findByType(PrimaryButton);

    await ReactTestRenderer.act(async () => {
      addButton.props.onPress();
    });

    const chips = renderer.root.findAllByType(FilterChip);
    const sectionChip = chips.find(chip => chip.props.label === 'Secao');

    await ReactTestRenderer.act(async () => {
      sectionChip?.props.onPress();
    });

    let inputs = renderer.root.findAllByType(InputField);

    await ReactTestRenderer.act(async () => {
      inputs[0]?.props.onChangeText('Novo bloco');
      inputs[1]?.props.onChangeText('Texto do bloco');
      inputs[2]?.props.onChangeText('0');
    });

    const addItemButton = renderer.root
      .findAllByType(SecondaryButton)
      .find(button => button.props.children === 'Adicionar item');

    await ReactTestRenderer.act(async () => {
      addItemButton?.props.onPress();
    });

    inputs = renderer.root.findAllByType(InputField);

    await ReactTestRenderer.act(async () => {
      inputs[2]?.props.onChangeText('Item 1');
      inputs[3]?.props.onChangeText('0');
    });

    const saveButton = renderer.root
      .findAllByType(PrimaryButton)
      .find(button => button.props.children === 'Criar bloco');

    await ReactTestRenderer.act(async () => {
      await saveButton?.props.onPress();
    });

    expect(mockedArticlesService.createArticleBlock).toHaveBeenCalledWith('article-1', {
      kind: 'SECTION',
      title: 'Novo bloco',
      body: 'Texto do bloco',
      items: ['Item 1'],
      sortOrder: 0,
    });
    expect(onCreateBlock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'block-2',
        title: 'Novo bloco',
      }),
    );
  });

  it('updates an existing block and renders image controls only for saved block editing', async () => {
    const onUpdateBlock = jest.fn();
    mockedArticlesService.updateArticleBlock.mockResolvedValue({
      ...blocks[0],
      body: 'Texto atualizado',
      sortOrder: 2,
    });

    const renderer = await renderManager({
      blocks,
      onUpdateBlock,
    });

    const editButton = renderer.root
      .findAllByType(SecondaryButton)
      .find(button => button.props.children === 'Editar');

    await ReactTestRenderer.act(async () => {
      editButton?.props.onPress();
    });

    const inputs = renderer.root.findAllByType(InputField);

    await ReactTestRenderer.act(async () => {
      inputs[1]?.props.onChangeText('Texto atualizado');
      inputs[3]?.props.onChangeText('2');
    });

    const saveButton = renderer.root
      .findAllByType(PrimaryButton)
      .find(button => button.props.children === 'Salvar bloco');

    await ReactTestRenderer.act(async () => {
      await saveButton?.props.onPress();
    });

    expect(mockedArticlesService.updateArticleBlock).toHaveBeenCalledWith(
      'article-1',
      'block-1',
      {
        kind: 'SECTION',
        title: 'Secagem correta',
        body: 'Texto atualizado',
        items: ['Use um pano limpo'],
        sortOrder: 2,
      },
    );
    expect(onUpdateBlock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'block-1',
        body: 'Texto atualizado',
      }),
    );
    expect(mockedArticleBlockImageManager).toHaveBeenCalledWith(
      expect.objectContaining({
        articleId: 'article-1',
        block: expect.objectContaining({
          id: 'block-1',
        }),
      }),
      undefined,
    );
  });

  it('deletes an existing block', async () => {
    const onDeleteBlock = jest.fn();
    mockedArticlesService.deleteArticleBlock.mockResolvedValue();

    const renderer = await renderManager({
      blocks,
      onDeleteBlock,
    });

    const deleteButton = renderer.root
      .findAllByType(TextButton)
      .find(button => button.props.children === 'Remover bloco');

    await ReactTestRenderer.act(async () => {
      await deleteButton?.props.onPress();
    });

    expect(mockedArticlesService.deleteArticleBlock).toHaveBeenCalledWith(
      'article-1',
      'block-1',
    );
    expect(onDeleteBlock).toHaveBeenCalledWith('block-1');
  });

  it('hides block controls for non-admin users', async () => {
    mockedUseAuth.mockReturnValue(createAuthValue('USER'));

    const renderer = await renderManager();

    expect(renderer.toJSON()).toBeNull();
  });
});
