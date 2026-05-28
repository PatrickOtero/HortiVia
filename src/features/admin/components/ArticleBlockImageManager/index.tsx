import React, { useEffect, useMemo, useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  InputField,
  PrimaryButton,
  SecondaryButton,
  TextButton,
} from '../../../../components';
import {
  IMAGE_LIBRARY_OPTIONS,
  normalizeImageUploadFile,
  type ImageUploadFile,
} from '../../../../utils/images/imagePicker';
import { useAuth } from '../../../auth/hooks/useAuth';
import { articlesService } from '../../../articles/services/articles.service';
import type { ArticleBlock } from '../../../articles/types/article';
import {
  ARTICLE_IMAGE_INVALID_MESSAGE,
  validateArticleImageUploadFile,
} from '../../../articles/utils/articleImageUpload';
import { isAdminAccessDeniedError } from '../../utils/adminFeedback';
import * as S from './styles';

type ArticleBlockImageManagerProps = {
  articleId: string;
  block: ArticleBlock;
  onUpdatedBlock: (block: ArticleBlock) => void;
};

const BLOCK_IMAGE_UPLOAD_ERROR_MESSAGE =
  'Nao foi possivel enviar a imagem do bloco.';
const BLOCK_IMAGE_SAVE_ERROR_MESSAGE =
  'Nao foi possivel salvar os dados da imagem.';
const BLOCK_IMAGE_REMOVE_ERROR_MESSAGE =
  'Nao foi possivel remover a imagem.';

const IMAGE_ENABLED_BLOCK_KINDS = new Set<ArticleBlock['kind']>([
  'IMAGE',
  'TIP',
  'WARNING',
  'SECTION',
  'PARAGRAPH',
  'OTHER',
]);

const BLOCK_KIND_LABELS: Record<ArticleBlock['kind'], string> = {
  PARAGRAPH: 'Paragrafo',
  HEADING: 'Titulo',
  IMAGE: 'Imagem',
  TIP: 'Dica',
  WARNING: 'Atencao',
  CHECKLIST: 'Checklist',
  STEPS: 'Passos',
  QUOTE: 'Cita',
  PRODUCT_REFERENCE: 'Referencia',
  SECTION: 'Secao',
  OTHER: 'Outro',
};

function buildFallbackFileName(block: ArticleBlock) {
  return `article-block-${block.id}.jpg`;
}

function buildBlockTitle(block: ArticleBlock) {
  if (block.title?.trim()) {
    return block.title.trim();
  }

  if (block.body?.trim()) {
    return block.body.trim().slice(0, 72);
  }

  return `Bloco ${BLOCK_KIND_LABELS[block.kind]}`;
}

function buildBlockDescription(block: ArticleBlock) {
  if (block.kind === 'IMAGE') {
    return 'A imagem e o conteudo principal deste bloco.';
  }

  return 'A imagem funciona como apoio visual e e opcional.';
}

export function ArticleBlockImageManager({
  articleId,
  block,
  onUpdatedBlock,
}: ArticleBlockImageManagerProps) {
  const { user } = useAuth();
  const [selectedImageFile, setSelectedImageFile] = useState<ImageUploadFile | null>(
    null,
  );
  const [imageAlt, setImageAlt] = useState(block.imageAlt ?? '');
  const [imageCaption, setImageCaption] = useState(block.imageCaption ?? '');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasPreviewError, setHasPreviewError] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const supportsImage = IMAGE_ENABLED_BLOCK_KINDS.has(block.kind);
  const previewImageUrl = selectedImageFile?.uri ?? block.imageUrl;
  const hasImage = Boolean(previewImageUrl);
  const shouldShowPreview = hasImage && !hasPreviewError;
  const title = useMemo(() => buildBlockTitle(block), [block]);
  const description = useMemo(() => buildBlockDescription(block), [block]);

  useEffect(() => {
    setImageAlt(block.imageAlt ?? '');
    setImageCaption(block.imageCaption ?? '');
    setSelectedImageFile(null);
    setHasPreviewError(false);
  }, [block.id, block.imageUrl, block.imageAlt, block.imageCaption]);

  useEffect(() => {
    setHasPreviewError(false);
  }, [previewImageUrl]);

  if (!isAdmin || !supportsImage) {
    return null;
  }

  function clearFeedback() {
    setFeedbackMessage('');
    setErrorMessage('');
  }

  async function handleSelectImage() {
    if (isSavingImage || isRemovingImage) {
      return;
    }

    clearFeedback();

    try {
      const pickerResponse = await launchImageLibrary(IMAGE_LIBRARY_OPTIONS);

      if (pickerResponse.didCancel) {
        return;
      }

      if (pickerResponse.errorCode || pickerResponse.errorMessage) {
        setErrorMessage(BLOCK_IMAGE_UPLOAD_ERROR_MESSAGE);
        return;
      }

      const selectedAsset = pickerResponse.assets?.[0];

      if (!selectedAsset) {
        setErrorMessage(ARTICLE_IMAGE_INVALID_MESSAGE);
        return;
      }

      const nextImageFile = normalizeImageUploadFile(
        selectedAsset,
        buildFallbackFileName(block),
      );

      if (!nextImageFile) {
        setErrorMessage(ARTICLE_IMAGE_INVALID_MESSAGE);
        return;
      }

      const validationMessage = validateArticleImageUploadFile(nextImageFile);

      if (validationMessage) {
        setErrorMessage(validationMessage);
        return;
      }

      setSelectedImageFile(nextImageFile);
      setHasPreviewError(false);
    } catch {
      setErrorMessage(BLOCK_IMAGE_UPLOAD_ERROR_MESSAGE);
    }
  }

  async function handleSaveImage() {
    if (isSavingImage || isRemovingImage) {
      return;
    }

    clearFeedback();
    setIsSavingImage(true);

    try {
      if (selectedImageFile) {
        if (typeof selectedImageFile.size !== 'number' || selectedImageFile.size <= 0) {
          setErrorMessage(ARTICLE_IMAGE_INVALID_MESSAGE);
          return;
        }

        const uploadedBlock = await articlesService.uploadArticleBlockImage({
          articleId,
          blockId: block.id,
          file: selectedImageFile,
          imageAlt,
          imageCaption,
        });

        onUpdatedBlock({
          ...block,
          ...uploadedBlock,
        });
        setSelectedImageFile(null);
        setFeedbackMessage('Imagem do bloco atualizada.');
        return;
      }

      if (!block.imageUrl?.trim()) {
        setErrorMessage(BLOCK_IMAGE_UPLOAD_ERROR_MESSAGE);
        return;
      }

      const updatedBlock = await articlesService.updateArticleBlockImage({
        articleId,
        blockId: block.id,
        imageUrl: block.imageUrl,
        imageAlt,
        imageCaption,
      });

      onUpdatedBlock({
        ...block,
        ...updatedBlock,
      });
      setSelectedImageFile(null);
      setFeedbackMessage('Imagem do bloco atualizada.');
    } catch (error) {
      if (block.imageUrl) {
        setSelectedImageFile(null);
      }

      if (isAdminAccessDeniedError(error)) {
        setErrorMessage(BLOCK_IMAGE_SAVE_ERROR_MESSAGE);
        return;
      }

      setErrorMessage(
        selectedImageFile
          ? BLOCK_IMAGE_UPLOAD_ERROR_MESSAGE
          : BLOCK_IMAGE_SAVE_ERROR_MESSAGE,
      );
    } finally {
      setIsSavingImage(false);
    }
  }

  async function handleRemoveImage() {
    if (!block.imageUrl || isSavingImage || isRemovingImage) {
      return;
    }

    clearFeedback();
    setIsRemovingImage(true);

    try {
      const updatedBlock = await articlesService.deleteArticleBlockImage({
        articleId,
        blockId: block.id,
      });

      onUpdatedBlock({
        ...block,
        ...updatedBlock,
      });
      setSelectedImageFile(null);
      setImageAlt('');
      setImageCaption('');
      setFeedbackMessage('Imagem removida.');
    } catch (error) {
      if (isAdminAccessDeniedError(error)) {
        setErrorMessage(BLOCK_IMAGE_REMOVE_ERROR_MESSAGE);
        return;
      }

      setErrorMessage(BLOCK_IMAGE_REMOVE_ERROR_MESSAGE);
    } finally {
      setIsRemovingImage(false);
    }
  }

  return (
    <S.Container>
      <S.Header>
        <S.HeaderRow>
          <S.Title>{title}</S.Title>
          <S.KindBadge>
            <S.KindBadgeText>{BLOCK_KIND_LABELS[block.kind]}</S.KindBadgeText>
          </S.KindBadge>
        </S.HeaderRow>
        <S.Description>{description}</S.Description>
      </S.Header>

      <S.PreviewFrame>
        {shouldShowPreview ? (
          <S.PreviewImage
            source={{ uri: previewImageUrl ?? undefined }}
            resizeMode="cover"
            accessibilityLabel={imageAlt.trim() || title}
            onError={() => setHasPreviewError(true)}
          />
        ) : (
          <S.PreviewFallback>
            <S.PreviewFallbackTitle>Sem imagem</S.PreviewFallbackTitle>
            <S.PreviewFallbackDescription>
              Adicione uma imagem para este bloco quando fizer sentido.
            </S.PreviewFallbackDescription>
          </S.PreviewFallback>
        )}
      </S.PreviewFrame>

      <S.Actions>
        <SecondaryButton
          fullWidth={false}
          onPress={handleSelectImage}
          disabled={isSavingImage || isRemovingImage}
        >
          {block.imageUrl ? 'Trocar imagem' : 'Adicionar imagem'}
        </SecondaryButton>
        <PrimaryButton
          fullWidth={false}
          onPress={handleSaveImage}
          loading={isSavingImage}
          disabled={isRemovingImage || (!selectedImageFile && !block.imageUrl)}
        >
          Salvar imagem
        </PrimaryButton>
        {block.imageUrl ? (
          <TextButton
            fullWidth={false}
            onPress={handleRemoveImage}
            loading={isRemovingImage}
            disabled={isSavingImage}
          >
            Remover imagem
          </TextButton>
        ) : null}
      </S.Actions>

      <InputField
        label="Texto alternativo"
        value={imageAlt}
        onChangeText={setImageAlt}
        helperText="Opcional, mas recomendado para acessibilidade."
      />
      <InputField
        label="Legenda da imagem"
        value={imageCaption}
        onChangeText={setImageCaption}
      />

      {feedbackMessage ? (
        <S.FeedbackText $tone="success">{feedbackMessage}</S.FeedbackText>
      ) : null}
      {errorMessage ? (
        <S.FeedbackText $tone="danger">{errorMessage}</S.FeedbackText>
      ) : null}
    </S.Container>
  );
}
