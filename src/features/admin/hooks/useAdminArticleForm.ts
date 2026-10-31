import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  IMAGE_LIBRARY_OPTIONS,
  normalizeImageUploadFile,
  validateImageUploadFile,
  type ImageUploadFile,
} from '../../../utils/images/imagePicker';
import { articlesService } from '../../articles/services/articles.service';
import type {
  ArticleBlock,
  ArticleCategory,
  CreateArticlePayload,
} from '../../articles/types/article';
import { sortArticleBlocks } from '../../articles/utils/articleBlocks';
import {
  ADMIN_LOAD_DATA_ERROR_MESSAGE,
  getSafeAdminImageErrorMessage,
  isAdminAccessDeniedError,
} from '../utils/adminFeedback';
import { formatTags, parseTags } from '../utils/adminContent';

export type ArticleFormValues = {
  title: string;
  summary: string;
  content: string;
  category: ArticleCategory | null;
  imageUrl: string;
  tags: string;
  isPublished: boolean;
};

type ArticleFormErrors = Partial<
  Record<'title' | 'summary' | 'content' | 'category', string>
>;

const MAX_ARTICLE_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const ARTICLE_IMAGE_FALLBACK_FILE_NAME = 'article-image.jpg';
const ARTICLE_IMAGE_INVALID_MESSAGE = 'Escolha uma imagem válida.';
const ARTICLE_IMAGE_TOO_LARGE_MESSAGE = 'A imagem deve ter no máximo 5 MB.';
const ARTICLE_IMAGE_UPLOAD_ERROR_MESSAGE = 'Não foi possível enviar a imagem.';
const ARTICLE_IMAGE_SUCCESS_MESSAGE = 'Imagem atualizada.';
const SAVE_ARTICLE_BEFORE_IMAGE_MESSAGE =
  'Salve o artigo antes de enviar a imagem.';

const INITIAL_FORM_VALUES: ArticleFormValues = {
  title: '',
  summary: '',
  content: '',
  category: null,
  imageUrl: '',
  tags: '',
  isPublished: false,
};

function validateForm(values: ArticleFormValues): ArticleFormErrors {
  const errors: ArticleFormErrors = {};

  if (!values.title.trim()) errors.title = 'Informe o título do artigo.';
  if (!values.summary.trim()) errors.summary = 'Informe o resumo do artigo.';
  if (!values.content.trim()) errors.content = 'Escreva o conteúdo do artigo.';
  if (!values.category) errors.category = 'Selecione uma categoria.';

  return errors;
}

type UseAdminArticleFormOptions = {
  initialArticleId?: string;
  onArticleSaved: (articleId: string) => void;
};

export function useAdminArticleForm({
  initialArticleId,
  onArticleSaved,
}: UseAdminArticleFormOptions) {
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(
    initialArticleId ?? null,
  );
  const isEditing = Boolean(currentArticleId);
  const [formValues, setFormValues] = useState<ArticleFormValues>(INITIAL_FORM_VALUES);
  const [formErrors, setFormErrors] = useState<ArticleFormErrors>({});
  const [screenError, setScreenError] = useState('');
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [remoteImageUrl, setRemoteImageUrl] = useState<string | null>(null);
  const [articleBlocks, setArticleBlocks] = useState<ArticleBlock[]>([]);
  const [selectedImageFile, setSelectedImageFile] = useState<ImageUploadFile | null>(
    null,
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageSuccessMessage, setImageSuccessMessage] = useState('');
  const [imageErrorMessage, setImageErrorMessage] = useState('');
  const [hasImageLoadError, setHasImageLoadError] = useState(false);
  const [hasAccessDeniedError, setHasAccessDeniedError] = useState(false);

  useEffect(() => {
    setCurrentArticleId(initialArticleId ?? null);
  }, [initialArticleId]);

  useEffect(() => {
    if (!currentArticleId) {
      setArticleBlocks([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const articleId = currentArticleId;

    async function loadArticle() {
      setIsLoading(true);
      setScreenError('');

      try {
        const article = await articlesService.getAdminArticleById(articleId);
        if (!isMounted) return;

        setFormValues({
          title: article.title,
          summary: article.summary,
          content: article.content,
          category: article.category,
          imageUrl: article.imageUrl ?? '',
          tags: formatTags(article.tags),
          isPublished: Boolean(article.publishedAt),
        });
        setRemoteImageUrl(article.imageUrl ?? null);
        setArticleBlocks(sortArticleBlocks(article.blocks ?? []));
        setSelectedImageFile(null);
        setImageErrorMessage('');
        setImageSuccessMessage('');
        setHasAccessDeniedError(false);
      } catch (error) {
        if (!isMounted) return;

        if (isAdminAccessDeniedError(error)) {
          setHasAccessDeniedError(true);
          setScreenError('');
          return;
        }

        setScreenError(ADMIN_LOAD_DATA_ERROR_MESSAGE);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadArticle();
    return () => {
      isMounted = false;
    };
  }, [currentArticleId]);

  useEffect(() => {
    setHasImageLoadError(false);
  }, [remoteImageUrl, selectedImageFile?.uri]);

  const previewImageUrl = selectedImageFile?.uri ?? remoteImageUrl;
  const shouldShowImage = Boolean(previewImageUrl) && !hasImageLoadError;

  function updateField<K extends keyof ArticleFormValues>(
    field: K,
    value: ArticleFormValues[K],
  ) {
    setFormValues(current => ({ ...current, [field]: value }));
    setFormErrors(current => ({ ...current, [field]: undefined }));
    setScreenError('');
  }

  async function handleSelectImage() {
    if (isUploadingImage) return;
    setImageErrorMessage('');
    setImageSuccessMessage('');

    try {
      const response = await launchImageLibrary(IMAGE_LIBRARY_OPTIONS);
      if (response.didCancel) return;

      if (response.errorCode || response.errorMessage) {
        setImageErrorMessage(ARTICLE_IMAGE_UPLOAD_ERROR_MESSAGE);
        return;
      }

      const asset = response.assets?.[0];
      const file = asset
        ? normalizeImageUploadFile(asset, ARTICLE_IMAGE_FALLBACK_FILE_NAME)
        : null;

      if (!file) {
        setImageErrorMessage(ARTICLE_IMAGE_INVALID_MESSAGE);
        return;
      }

      const validationMessage = validateImageUploadFile(file, {
        invalidMessage: ARTICLE_IMAGE_INVALID_MESSAGE,
        maxSizeInBytes: MAX_ARTICLE_IMAGE_FILE_SIZE,
        tooLargeMessage: ARTICLE_IMAGE_TOO_LARGE_MESSAGE,
      });

      if (validationMessage) {
        setImageErrorMessage(validationMessage);
        return;
      }

      setSelectedImageFile(file);
      setHasImageLoadError(false);
    } catch {
      setImageErrorMessage(ARTICLE_IMAGE_UPLOAD_ERROR_MESSAGE);
    }
  }

  async function uploadSelectedImage(articleId: string) {
    if (!selectedImageFile || isUploadingImage) return false;

    setIsUploadingImage(true);
    setImageErrorMessage('');
    setImageSuccessMessage('');

    try {
      const article = await articlesService.uploadArticleImage(
        articleId,
        selectedImageFile,
      );
      setRemoteImageUrl(article.imageUrl ?? null);
      setSelectedImageFile(null);
      setHasImageLoadError(false);
      setFormValues(current => ({ ...current, imageUrl: article.imageUrl ?? '' }));
      setImageSuccessMessage(ARTICLE_IMAGE_SUCCESS_MESSAGE);
      return true;
    } catch (error) {
      if (isAdminAccessDeniedError(error)) {
        setHasAccessDeniedError(true);
        return false;
      }

      setImageErrorMessage(
        getSafeAdminImageErrorMessage(error, {
          invalidMessage: ARTICLE_IMAGE_INVALID_MESSAGE,
          tooLargeMessage: ARTICLE_IMAGE_TOO_LARGE_MESSAGE,
          uploadMessage: ARTICLE_IMAGE_UPLOAD_ERROR_MESSAGE,
        }),
      );
      return false;
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleUploadImage() {
    if (!currentArticleId) {
      setImageSuccessMessage('');
      setImageErrorMessage(SAVE_ARTICLE_BEFORE_IMAGE_MESSAGE);
      return;
    }

    await uploadSelectedImage(currentArticleId);
  }

  async function handleSubmit() {
    const errors = validateForm(formValues);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const payload: CreateArticlePayload = {
      title: formValues.title,
      summary: formValues.summary,
      content: formValues.content,
      category: formValues.category!,
      imageUrl: formValues.imageUrl,
      tags: parseTags(formValues.tags),
      isPublished: formValues.isPublished,
    };
    const wasEditing = Boolean(currentArticleId);
    setIsSaving(true);
    setScreenError('');

    try {
      const article = currentArticleId
        ? await articlesService.updateArticle(currentArticleId, payload)
        : await articlesService.createArticle(payload);

      setCurrentArticleId(article.id);
      onArticleSaved(article.id);
      setRemoteImageUrl(article.imageUrl ?? null);
      setArticleBlocks(sortArticleBlocks(article.blocks ?? []));
      setFormValues(current => ({ ...current, imageUrl: article.imageUrl ?? '' }));

      if (selectedImageFile && !(await uploadSelectedImage(article.id))) {
        Alert.alert(
          wasEditing ? 'Artigo atualizado.' : 'Artigo salvo.',
          ARTICLE_IMAGE_UPLOAD_ERROR_MESSAGE,
        );
        return;
      }

      Alert.alert(
        wasEditing ? 'Artigo atualizado.' : 'Artigo salvo.',
        wasEditing
          ? selectedImageFile
            ? ARTICLE_IMAGE_SUCCESS_MESSAGE
            : 'Continue editando os blocos e imagens do artigo nesta tela.'
          : 'Agora voce ja pode criar blocos e enviar imagens sem sair desta tela.',
      );
    } catch (error) {
      if (isAdminAccessDeniedError(error)) {
        setHasAccessDeniedError(true);
        return;
      }
      setScreenError('Não foi possível salvar o artigo.');
    } finally {
      setIsSaving(false);
    }
  }

  function updateArticleBlock(updatedBlock: ArticleBlock) {
    setArticleBlocks(current =>
      sortArticleBlocks(
        current.map(block =>
          block.id === updatedBlock.id ? { ...block, ...updatedBlock } : block,
        ),
      ),
    );
  }

  function addArticleBlock(block: ArticleBlock) {
    setArticleBlocks(current => sortArticleBlocks([...current, block]));
  }

  function removeArticleBlock(blockId: string) {
    setArticleBlocks(current => current.filter(block => block.id !== blockId));
  }

  return {
    currentArticleId,
    isEditing,
    formValues,
    formErrors,
    screenError,
    isLoading,
    isSaving,
    articleBlocks,
    selectedImageFile,
    isUploadingImage,
    imageSuccessMessage,
    imageErrorMessage,
    hasImageLoadError,
    hasAccessDeniedError,
    previewImageUrl,
    shouldShowImage,
    saveArticleBeforeImageMessage: SAVE_ARTICLE_BEFORE_IMAGE_MESSAGE,
    updateField,
    handleSelectImage,
    handleUploadImage,
    handleSubmit,
    setHasImageLoadError,
    setHasAccessDeniedError,
    updateArticleBlock,
    addArticleBlock,
    removeArticleBlock,
  };
}
