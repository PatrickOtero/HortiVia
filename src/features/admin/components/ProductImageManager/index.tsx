import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
  EmptyStateCard,
  FilterChip,
  InputField,
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
} from '../../../../components';
import type {
  ProductGuideImage,
  ProductImageKind,
} from '../../../products/types/product';
import { productsService } from '../../../products/services/products.service';
import { AdminFormSection } from '../AdminFormSection';
import { ProductVisualContentCard } from '../ProductVisualContentCard';
import {
  getProductImageKindLabel,
  INITIAL_PRODUCT_IMAGE_FORM_VALUES,
  PRODUCT_IMAGE_KIND_OPTIONS,
  toCreateProductImagePayload,
  toUpdateProductImagePayload,
  validateProductImageForm,
  getInitialImageFormValuesFromItem,
  type ProductImageFormErrors,
  type ProductImageFormValues,
} from '../../utils/adminVisualContent';
import {
  ADMIN_REMOVE_ERROR_MESSAGE,
  getSafeAdminSaveErrorMessage,
  isAdminAccessDeniedError,
} from '../../utils/adminFeedback';
import { selectProductVisualImage } from '../../utils/productVisualImagePicker';
import type { ImageUploadFile } from '../../../../utils/images/imagePicker';
import * as S from '../ProductVisualContentManagers/styles';

type ProductImageManagerProps = {
  productId: string;
  images: ProductGuideImage[];
  legacyImage: ProductGuideImage | null;
  onChanged: () => Promise<void>;
  onAccessDenied: () => void;
};

type ImageEditor = { mode: 'create' } | { mode: 'edit'; imageId: string };

export function ProductImageManager({
  productId,
  images,
  legacyImage,
  onChanged,
  onAccessDenied,
}: ProductImageManagerProps) {
  const [editor, setEditor] = useState<ImageEditor | null>(null);
  const [selectedFile, setSelectedFile] = useState<ImageUploadFile | null>(
    null,
  );
  const [values, setValues] = useState<ProductImageFormValues>(
    INITIAL_PRODUCT_IMAGE_FORM_VALUES,
  );
  const [errors, setErrors] = useState<ProductImageFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const editingImage =
    editor?.mode === 'edit'
      ? images.find(image => image.id === editor.imageId) ?? null
      : null;

  function resetEditor() {
    setEditor(null);
    setValues(INITIAL_PRODUCT_IMAGE_FORM_VALUES);
    setErrors({});
    setSelectedFile(null);
  }

  function updateField<K extends keyof ProductImageFormValues>(
    field: K,
    value: ProductImageFormValues[K],
  ) {
    setValues(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
  }

  function startCreate() {
    setFeedbackMessage('');
    setErrorMessage('');
    setEditor({ mode: 'create' });
    setValues(INITIAL_PRODUCT_IMAGE_FORM_VALUES);
    setErrors({});
    setSelectedFile(null);
  }

  function startEdit(image: ProductGuideImage) {
    setFeedbackMessage('');
    setErrorMessage('');
    setEditor({ mode: 'edit', imageId: image.id });
    setValues(getInitialImageFormValuesFromItem(image));
    setErrors({});
    setSelectedFile(null);
  }

  async function chooseImage() {
    const result = await selectProductVisualImage('product-gallery-image.jpg');
    if (result.status === 'error') {
      setErrorMessage(result.message);
      return;
    }
    if (result.status === 'selected') {
      setSelectedFile(result.file);
      setErrorMessage('');
    }
  }

  async function saveImage() {
    const nextErrors = validateProductImageForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    if (editor?.mode === 'create' && !selectedFile) {
      setErrorMessage('Escolha uma imagem antes de salvar.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      if (editor?.mode === 'edit' && editor.imageId) {
        if (selectedFile) {
          await productsService.replaceProductImageFile(
            productId,
            editor.imageId,
            selectedFile,
            toUpdateProductImagePayload(values),
          );
        } else {
          await productsService.updateProductImage(
            productId,
            editor.imageId,
            toUpdateProductImagePayload(values),
          );
        }
        setFeedbackMessage('Imagem atualizada.');
      } else if (selectedFile) {
        await productsService.createProductImageWithUpload(
          productId,
          selectedFile,
          toCreateProductImagePayload(values),
        );
        setFeedbackMessage('Imagem adicionada.');
      }
      resetEditor();
      await onChanged();
    } catch (error) {
      if (isAdminAccessDeniedError(error)) {
        onAccessDenied();
        return;
      }
      setErrorMessage(getSafeAdminSaveErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function confirmDelete(image: ProductGuideImage) {
    Alert.alert(
      'Remover este item?',
      'Esta ação não altera o produto, apenas remove este conteúdo visual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(image.id);
            setErrorMessage('');
            try {
              await productsService.deleteProductImage(productId, image.id);
              setFeedbackMessage('Imagem removida.');
              await onChanged();
            } catch (error) {
              if (isAdminAccessDeniedError(error)) {
                onAccessDenied();
                return;
              }
              setErrorMessage(ADMIN_REMOVE_ERROR_MESSAGE);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  }

  return (
    <SurfaceCard>
      <AdminFormSection
        title="Galeria do produto"
        description="Use imagens que ajudem o usuário a reconhecer o produto em diferentes situações."
      >
        <S.Stack>
          {feedbackMessage ? (
            <S.SuccessText>{feedbackMessage}</S.SuccessText>
          ) : null}
          {errorMessage ? <S.ErrorText>{errorMessage}</S.ErrorText> : null}

          {legacyImage ? (
            <ProductVisualContentCard
              title="Imagem atual do produto"
              subtitle="Ela ainda vem da imagem principal do cadastro."
              imageUrl={legacyImage.imageUrl}
              badgeLabel="Imagem principal"
            />
          ) : null}

          {images.length === 0 ? (
            <EmptyStateCard
              title="Nenhuma imagem cadastrada."
              description="Adicione imagens para enriquecer a visualização deste produto."
            >
              <PrimaryButton onPress={startCreate}>
                Adicionar imagem
              </PrimaryButton>
            </EmptyStateCard>
          ) : (
            <S.Stack>
              {images.map(image => (
                <ProductVisualContentCard
                  key={image.id}
                  title={getProductImageKindLabel(
                    (image.kind as ProductImageKind) ?? 'OTHER',
                  )}
                  subtitle={
                    [
                      image.caption,
                      typeof image.sortOrder === 'number'
                        ? `Ordem ${image.sortOrder}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' • ') || 'Sem legenda'
                  }
                  badgeLabel={image.isPrimary ? 'Imagem principal' : null}
                  imageUrl={image.imageUrl}
                  onEdit={() => startEdit(image)}
                  onDelete={() => confirmDelete(image)}
                  isDeleting={deletingId === image.id}
                />
              ))}
            </S.Stack>
          )}

          {editor ? (
            <S.EditorCard>
              <S.EditorHeader>
                <S.EditorTitle>
                  {editor.mode === 'edit' ? 'Editar imagem' : 'Nova imagem'}
                </S.EditorTitle>
              </S.EditorHeader>
              <ProductVisualContentCard
                title="Prévia da imagem"
                subtitle={
                  selectedFile
                    ? 'Arquivo selecionado para envio.'
                    : editingImage?.imageUrl
                    ? 'Imagem atual cadastrada.'
                    : 'Escolha uma imagem para enviar.'
                }
                imageUrl={selectedFile?.uri ?? editingImage?.imageUrl}
              />
              <S.Actions>
                <SecondaryButton onPress={chooseImage} disabled={isSaving}>
                  Escolher imagem
                </SecondaryButton>
              </S.Actions>
              <S.FieldGroup>
                <S.FieldLabel>Tipo da imagem</S.FieldLabel>
                <S.ChipRow>
                  {PRODUCT_IMAGE_KIND_OPTIONS.map(option => (
                    <FilterChip
                      key={option.value}
                      label={option.label}
                      active={values.kind === option.value}
                      onPress={() => updateField('kind', option.value)}
                    />
                  ))}
                </S.ChipRow>
                {errors.kind ? <S.ErrorText>{errors.kind}</S.ErrorText> : null}
              </S.FieldGroup>
              <InputField
                label="Texto alternativo"
                value={values.alt}
                onChangeText={value => updateField('alt', value)}
              />
              <InputField
                label="Legenda"
                value={values.caption}
                onChangeText={value => updateField('caption', value)}
              />
              <InputField
                label="Ordem"
                value={values.sortOrder}
                onChangeText={value => updateField('sortOrder', value)}
                keyboardType="number-pad"
                helperText={errors.sortOrder}
              />
              <S.FieldGroup>
                <S.FieldLabel>Imagem principal</S.FieldLabel>
                <S.ChipRow>
                  <FilterChip
                    label="Sim"
                    active={values.isPrimary}
                    onPress={() => updateField('isPrimary', true)}
                  />
                  <FilterChip
                    label="Não"
                    active={!values.isPrimary}
                    onPress={() => updateField('isPrimary', false)}
                  />
                </S.ChipRow>
              </S.FieldGroup>
              <S.Actions>
                <PrimaryButton onPress={saveImage} loading={isSaving}>
                  Salvar
                </PrimaryButton>
                <SecondaryButton onPress={resetEditor} disabled={isSaving}>
                  Cancelar
                </SecondaryButton>
              </S.Actions>
            </S.EditorCard>
          ) : images.length > 0 ? (
            <SecondaryButton onPress={startCreate}>
              Adicionar imagem
            </SecondaryButton>
          ) : null}
        </S.Stack>
      </AdminFormSection>
    </SurfaceCard>
  );
}
