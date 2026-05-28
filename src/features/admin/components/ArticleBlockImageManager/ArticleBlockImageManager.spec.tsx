import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { launchImageLibrary } from 'react-native-image-picker';
import { InputField, PrimaryButton, SecondaryButton, TextButton } from '../../../../components';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import { useAuth } from '../../../auth/hooks/useAuth';
import { articlesService } from '../../../articles/services/articles.service';
import { ArticleBlockImageManager } from './index';

jest.mock('../../../auth/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../articles/services/articles.service', () => ({
  articlesService: {
    uploadArticleBlockImage: jest.fn(),
    updateArticleBlockImage: jest.fn(),
    deleteArticleBlockImage: jest.fn(),
  },
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedLaunchImageLibrary = launchImageLibrary as jest.MockedFunction<
  typeof launchImageLibrary
>;
const mockedArticlesService = articlesService as jest.Mocked<typeof articlesService>;

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

describe('ArticleBlockImageManager', () => {
  const baseBlock = {
    id: 'block-1',
    articleId: 'article-1',
    kind: 'SECTION' as const,
    title: 'Secagem correta',
    body: 'Seque bem antes de guardar.',
    sortOrder: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue(createAuthValue('ADMIN'));
  });

  async function renderManager(
    props?: Partial<React.ComponentProps<typeof ArticleBlockImageManager>>,
  ) {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <ArticleBlockImageManager
            articleId="article-1"
            block={baseBlock}
            onUpdatedBlock={jest.fn()}
            {...props}
          />
        </ThemeProvider>,
      );
    });

    return renderer!;
  }

  it('shows add image when the block has no image', async () => {
    const renderer = await renderManager();
    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain('Adicionar imagem');
    expect(output).not.toContain('Remover imagem');
  });

  it('shows replace and remove actions when the block already has an image', async () => {
    const renderer = await renderManager({
      block: {
        ...baseBlock,
        imageUrl: 'https://cdn.example.com/block.webp',
      },
    });
    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain('Trocar imagem');
    expect(output).toContain('Remover imagem');
  });

  it('persists metadata without selecting a new file', async () => {
    const onUpdatedBlock = jest.fn();
    mockedArticlesService.updateArticleBlockImage.mockResolvedValue({
      ...baseBlock,
      imageUrl: 'https://cdn.example.com/block.webp',
      imageAlt: 'Folhas secando',
      imageCaption: 'Secagem correta',
      updatedAt: '2026-05-27T10:00:00.000Z',
    });

    const renderer = await renderManager({
      block: {
        ...baseBlock,
        imageUrl: 'https://cdn.example.com/block.webp',
      },
      onUpdatedBlock,
    });

    const inputs = renderer.root.findAllByType(InputField);

    await ReactTestRenderer.act(async () => {
      inputs[0]?.props.onChangeText('Folhas secando');
      inputs[1]?.props.onChangeText('Secagem correta');
    });

    const saveButton = renderer.root.findByType(PrimaryButton);

    await ReactTestRenderer.act(async () => {
      await saveButton.props.onPress();
    });

    expect(mockedArticlesService.updateArticleBlockImage).toHaveBeenCalledWith({
      articleId: 'article-1',
      blockId: 'block-1',
      imageUrl: 'https://cdn.example.com/block.webp',
      imageAlt: 'Folhas secando',
      imageCaption: 'Secagem correta',
    });
    expect(onUpdatedBlock).toHaveBeenCalledWith(
      expect.objectContaining({
        imageAlt: 'Folhas secando',
        imageCaption: 'Secagem correta',
      }),
    );
  });

  it('uploads a new image and then persists the returned URL', async () => {
    const onUpdatedBlock = jest.fn();
    mockedLaunchImageLibrary.mockResolvedValue({
      assets: [
        {
          uri: 'file:///tmp/block.webp',
          type: 'image/webp',
          fileName: 'block.webp',
          fileSize: 2048,
        },
      ],
      didCancel: false,
    });
    mockedArticlesService.uploadArticleBlockImage.mockResolvedValue({
      ...baseBlock,
      imageUrl: 'https://cdn.example.com/articles/article-1/blocks/block-1/image.webp',
      imageAlt: 'Folhas secando',
      imageCaption: 'Secagem correta',
    });

    const renderer = await renderManager({
      onUpdatedBlock,
    });

    const selectButton = renderer.root.findByType(SecondaryButton);

    await ReactTestRenderer.act(async () => {
      await selectButton.props.onPress();
    });

    const inputs = renderer.root.findAllByType(InputField);

    await ReactTestRenderer.act(async () => {
      inputs[0]?.props.onChangeText('Folhas secando');
      inputs[1]?.props.onChangeText('Secagem correta');
    });

    const saveButton = renderer.root.findByType(PrimaryButton);

    await ReactTestRenderer.act(async () => {
      await saveButton.props.onPress();
    });

    expect(mockedArticlesService.uploadArticleBlockImage).toHaveBeenCalledWith({
      articleId: 'article-1',
      blockId: 'block-1',
      file: {
        uri: 'file:///tmp/block.webp',
        name: 'article-block-block-1.webp',
        type: 'image/webp',
        size: 2048,
      },
      imageAlt: 'Folhas secando',
      imageCaption: 'Secagem correta',
    });
    expect(onUpdatedBlock).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl:
          'https://cdn.example.com/articles/article-1/blocks/block-1/image.webp',
      }),
    );
  });

  it('preserves the existing image when upload fails', async () => {
    const onUpdatedBlock = jest.fn();
    mockedLaunchImageLibrary.mockResolvedValue({
      assets: [
        {
          uri: 'file:///tmp/block.webp',
          type: 'image/webp',
          fileName: 'block.webp',
          fileSize: 2048,
        },
      ],
      didCancel: false,
    });
    mockedArticlesService.uploadArticleBlockImage.mockRejectedValue(
      new Error('upload-failed'),
    );

    const renderer = await renderManager({
      block: {
        ...baseBlock,
        imageUrl: 'https://cdn.example.com/block.webp',
      },
      onUpdatedBlock,
    });

    const selectButton = renderer.root.findByType(SecondaryButton);

    await ReactTestRenderer.act(async () => {
      await selectButton.props.onPress();
    });

    const saveButton = renderer.root.findByType(PrimaryButton);

    await ReactTestRenderer.act(async () => {
      await saveButton.props.onPress();
    });

    expect(onUpdatedBlock).not.toHaveBeenCalled();
    expect(JSON.stringify(renderer.toJSON())).toContain('Remover imagem');
  });

  it('hides upload controls for non-admin users', async () => {
    mockedUseAuth.mockReturnValue(createAuthValue('USER'));

    const renderer = await renderManager();

    expect(renderer.toJSON()).toBeNull();
  });

  it('removes an existing block image', async () => {
    const onUpdatedBlock = jest.fn();
    mockedArticlesService.deleteArticleBlockImage.mockResolvedValue({
      ...baseBlock,
      imageUrl: undefined,
      imageAlt: undefined,
      imageCaption: undefined,
    });

    const renderer = await renderManager({
      block: {
        ...baseBlock,
        imageUrl: 'https://cdn.example.com/block.webp',
      },
      onUpdatedBlock,
    });

    const removeButton = renderer.root.findByType(TextButton);

    await ReactTestRenderer.act(async () => {
      await removeButton.props.onPress();
    });

    expect(mockedArticlesService.deleteArticleBlockImage).toHaveBeenCalledWith({
      articleId: 'article-1',
      blockId: 'block-1',
    });
    expect(onUpdatedBlock).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: undefined,
      }),
    );
  });
});
