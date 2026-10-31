import React from 'react';
import { PrimaryButton, SecondaryButton } from '../../../../../components';
import * as S from '../styles';

type ProductMainImageFieldProps = {
  productId: string | null;
  previewImageUrl?: string | null;
  shouldShowImage: boolean;
  isSaving: boolean;
  isUploading: boolean;
  hasSelectedImage: boolean;
  successMessage: string;
  errorMessage: string;
  saveBeforeUploadMessage: string;
  onSelect: () => void;
  onUpload: () => void;
  onImageLoadError: () => void;
};

export function ProductMainImageField({
  productId,
  previewImageUrl,
  shouldShowImage,
  isSaving,
  isUploading,
  hasSelectedImage,
  successMessage,
  errorMessage,
  saveBeforeUploadMessage,
  onSelect,
  onUpload,
  onImageLoadError,
}: ProductMainImageFieldProps) {
  return (
    <S.ImageCard>
      <S.ImagePreviewFrame>
        {shouldShowImage ? (
          <S.ImagePreview
            source={{ uri: previewImageUrl ?? undefined }}
            resizeMode="cover"
            onError={onImageLoadError}
          />
        ) : (
          <S.ImageFallback>
            <S.ImageFallbackBadge>
              <S.ImageFallbackBadgeText>HortiVia</S.ImageFallbackBadgeText>
            </S.ImageFallbackBadge>
            <S.ImageFallbackTitle>Imagem do produto</S.ImageFallbackTitle>
            <S.ImageFallbackDescription>
              Adicione uma imagem para destacar este item.
            </S.ImageFallbackDescription>
          </S.ImageFallback>
        )}
      </S.ImagePreviewFrame>

      <S.ImageMeta>
        <S.ImageMetaTitle>Imagem do produto</S.ImageMetaTitle>
        <S.ImageMetaDescription>
          {productId
            ? 'Escolha uma nova imagem e envie quando estiver pronta.'
            : 'Escolha uma imagem agora e envie depois de salvar.'}
        </S.ImageMetaDescription>
      </S.ImageMeta>

      <S.ImageActions>
        <SecondaryButton
          fullWidth={false}
          onPress={onSelect}
          disabled={isSaving || isUploading}
        >
          Alterar imagem
        </SecondaryButton>
        <PrimaryButton
          fullWidth={false}
          onPress={onUpload}
          loading={isUploading}
          disabled={!hasSelectedImage || !productId || isSaving}
        >
          Enviar imagem
        </PrimaryButton>
      </S.ImageActions>

      {!productId && hasSelectedImage ? (
        <S.ImageMetaDescription>
          {saveBeforeUploadMessage}
        </S.ImageMetaDescription>
      ) : null}
      {successMessage ? <S.SuccessText>{successMessage}</S.SuccessText> : null}
      {errorMessage ? <S.ErrorText>{errorMessage}</S.ErrorText> : null}
    </S.ImageCard>
  );
}
