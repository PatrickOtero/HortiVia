import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert, Switch } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  FilterChip,
  InputField,
  PrimaryButton,
  SecondaryButton,
} from '../../../../components';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import { useAuth } from '../../../auth/hooks/useAuth';
import { articlesService } from '../../../articles/services/articles.service';
import { AdminArticleFormScreen } from './index';

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('../../../auth/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../articles/services/articles.service', () => ({
  articlesService: {
    getAdminArticleById: jest.fn(),
    createArticle: jest.fn(),
    updateArticle: jest.fn(),
    uploadArticleImage: jest.fn(),
  },
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedArticlesService = articlesService as jest.Mocked<typeof articlesService>;
const mockedLaunchImageLibrary = launchImageLibrary as jest.MockedFunction<
  typeof launchImageLibrary
>;

const savedArticle = {
  id: 'article-1',
  title: 'Ideias com tomate',
  slug: 'ideias-com-tomate',
  summary: 'Sugestões para a cozinha.',
  content: 'Texto do artigo.',
  category: 'RECIPES' as const,
  imageUrl: null,
  coverImageUrl: null,
  coverImageAlt: '',
  tags: [],
  author: { id: 'admin-1', name: 'Editora', avatarUrl: null },
  blocks: [],
  relatedProducts: [],
};

describe('AdminArticleFormScreen article preview and publication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    mockedUseAuth.mockReturnValue({
      user: {
        id: 'admin-1',
        name: 'Editora',
        email: 'editor@hortivia.test',
        role: 'ADMIN',
        avatarUrl: null,
        gender: null,
        emailVerified: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      accessToken: 'test-token',
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
    } as ReturnType<typeof useAuth>);
    mockedArticlesService.createArticle.mockResolvedValue(savedArticle);
    mockedArticlesService.getAdminArticleById.mockResolvedValue(savedArticle);
  });

  async function renderScreen(articleId?: string) {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ThemeProvider>
          <AdminArticleFormScreen
            navigation={{
              goBack: jest.fn(),
              setParams: jest.fn(),
            } as never}
            route={{
              key: 'AdminArticleForm',
              name: 'AdminArticleForm',
              params: articleId ? { articleId } : undefined,
            } as never}
          />
        </ThemeProvider>,
      );
    });

    return renderer!;
  }

  async function fillRequiredFields(renderer: ReactTestRenderer.ReactTestRenderer) {
    const inputs = renderer.root.findAllByType(InputField);
    const title = inputs.find(input => input.props.label === 'Título');
    const summary = inputs.find(input => input.props.label === 'Resumo');
    const content = inputs.find(input => input.props.label === 'Conteúdo');

    await ReactTestRenderer.act(async () => {
      title?.props.onChangeText('Ideias com tomate');
      summary?.props.onChangeText('Sugestões para a cozinha.');
      content?.props.onChangeText('Texto do artigo.');
      renderer.root
        .findAllByType(FilterChip)
        .find(chip => chip.props.label === 'Uso na cozinha')
        ?.props.onPress();
    });
  }

  it('previews the content and saves a new article as a draft by default', async () => {
    const renderer = await renderScreen();
    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain('admin-article-preview');
    expect(output).toContain('Rascunho');
    expect(output).toContain('Salvar rascunho');
    expect(renderer.root.findByType(Switch).props.value).toBe(false);

    await fillRequiredFields(renderer);

    const saveButton = renderer.root
      .findAllByType(PrimaryButton)
      .find(button => button.props.children === 'Salvar rascunho');

    await ReactTestRenderer.act(async () => {
      await saveButton?.props.onPress();
    });

    expect(mockedArticlesService.createArticle).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Ideias com tomate',
        category: 'RECIPES',
        isPublished: false,
      }),
    );
  });

  it('publishes only after the administrator enables publication', async () => {
    const renderer = await renderScreen();

    await fillRequiredFields(renderer);

    await ReactTestRenderer.act(async () => {
      renderer.root.findByType(Switch).props.onValueChange(true);
    });

    const publishButton = renderer.root
      .findAllByType(PrimaryButton)
      .find(button => button.props.children === 'Salvar e publicar');

    expect(publishButton).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      await publishButton?.props.onPress();
    });

    expect(mockedArticlesService.createArticle).toHaveBeenCalledWith(
      expect.objectContaining({ isPublished: true }),
    );
  });

  it('shows required field errors without sending an incomplete article', async () => {
    const renderer = await renderScreen();
    const saveButton = renderer.root
      .findAllByType(PrimaryButton)
      .find(button => button.props.children === 'Salvar rascunho');

    await ReactTestRenderer.act(async () => {
      await saveButton?.props.onPress();
    });

    expect(mockedArticlesService.createArticle).not.toHaveBeenCalled();
    expect(JSON.stringify(renderer.toJSON())).toContain('Informe o título do artigo.');
    expect(JSON.stringify(renderer.toJSON())).toContain('Selecione uma categoria.');
  });

  it('loads an existing article and saves edits without changing its publication state', async () => {
    const publishedArticle = {
      ...savedArticle,
      publishedAt: '2026-06-01T12:00:00.000Z',
    };
    mockedArticlesService.getAdminArticleById.mockResolvedValue(publishedArticle);
    mockedArticlesService.updateArticle.mockResolvedValue(publishedArticle);

    const renderer = await renderScreen('article-1');

    expect(mockedArticlesService.getAdminArticleById).toHaveBeenCalledWith(
      'article-1',
    );
    expect(renderer.root.findByType(Switch).props.value).toBe(true);

    const summary = renderer.root
      .findAllByType(InputField)
      .find(input => input.props.label === 'Resumo');

    await ReactTestRenderer.act(async () => {
      summary?.props.onChangeText('Resumo revisado.');
    });

    const saveButton = renderer.root
      .findAllByType(PrimaryButton)
      .find(button => button.props.children === 'Salvar alterações publicadas');

    await ReactTestRenderer.act(async () => {
      await saveButton?.props.onPress();
    });

    expect(mockedArticlesService.updateArticle).toHaveBeenCalledWith(
      'article-1',
      expect.objectContaining({
        summary: 'Resumo revisado.',
        isPublished: true,
      }),
    );
  });

  it('uploads a selected cover after the article has been saved', async () => {
    mockedLaunchImageLibrary.mockResolvedValue({
      didCancel: false,
      errorCode: undefined,
      errorMessage: undefined,
      assets: [
        {
          uri: 'file:///cover.jpg',
          fileName: 'cover.jpg',
          type: 'image/jpeg',
          fileSize: 1024,
        },
      ],
    });
    mockedArticlesService.uploadArticleImage.mockResolvedValue({
      ...savedArticle,
      imageUrl: 'https://cdn.hortivia.test/cover.jpg',
    });

    const renderer = await renderScreen();
    const changeImageButton = renderer.root
      .findAllByType(SecondaryButton)
      .find(button => button.props.children === 'Alterar imagem');

    await ReactTestRenderer.act(async () => {
      await changeImageButton?.props.onPress();
    });
    await fillRequiredFields(renderer);

    const saveButton = renderer.root
      .findAllByType(PrimaryButton)
      .find(button => button.props.children === 'Salvar rascunho');

    await ReactTestRenderer.act(async () => {
      await saveButton?.props.onPress();
    });

    expect(mockedArticlesService.createArticle).toHaveBeenCalledTimes(1);
    expect(mockedArticlesService.uploadArticleImage).toHaveBeenCalledWith(
      'article-1',
      expect.objectContaining({
        uri: 'file:///cover.jpg',
        name: 'article-image.jpg',
        type: 'image/jpeg',
      }),
    );
  });

  it('keeps the saved article available when uploading its selected cover fails', async () => {
    mockedLaunchImageLibrary.mockResolvedValue({
      didCancel: false,
      errorCode: undefined,
      errorMessage: undefined,
      assets: [
        {
          uri: 'file:///cover.jpg',
          fileName: 'cover.jpg',
          type: 'image/jpeg',
          fileSize: 1024,
        },
      ],
    });
    mockedArticlesService.uploadArticleImage.mockRejectedValueOnce(
      new Error('network error'),
    );

    const renderer = await renderScreen();
    const changeImageButton = renderer.root
      .findAllByType(SecondaryButton)
      .find(button => button.props.children === 'Alterar imagem');

    await ReactTestRenderer.act(async () => {
      await changeImageButton?.props.onPress();
    });
    await fillRequiredFields(renderer);

    const saveButton = renderer.root
      .findAllByType(PrimaryButton)
      .find(button => button.props.children === 'Salvar rascunho');

    await ReactTestRenderer.act(async () => {
      await saveButton?.props.onPress();
    });

    expect(mockedArticlesService.createArticle).toHaveBeenCalledTimes(1);
    expect(mockedArticlesService.uploadArticleImage).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(renderer.toJSON())).toContain('Blocos do artigo');
    expect(Alert.alert).toHaveBeenCalledWith(
      'Artigo salvo.',
      'Não foi possível enviar a imagem.',
    );
  });
});
