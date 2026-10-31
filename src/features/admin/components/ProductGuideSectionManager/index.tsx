import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
  EmptyStateCard,
  FilterChip,
  InputField,
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
  TextButton,
} from '../../../../components';
import type { ProductGuideSection } from '../../../products/types/product';
import { productsService } from '../../../products/services/products.service';
import { AdminFormSection } from '../AdminFormSection';
import { ProductVisualContentCard } from '../ProductVisualContentCard';
import {
  getInitialGuideSectionFormValuesFromItem,
  getProductGuideSectionKindValueLabel,
  INITIAL_PRODUCT_GUIDE_SECTION_FORM_VALUES,
  PRODUCT_GUIDE_SECTION_KIND_OPTIONS,
  toCreateProductGuideSectionPayload,
  toUpdateProductGuideSectionPayload,
  validateProductGuideSectionForm,
  type ProductGuideSectionFormErrors,
  type ProductGuideSectionFormValues,
} from '../../utils/adminVisualContent';
import {
  ADMIN_REMOVE_ERROR_MESSAGE,
  getSafeAdminImageErrorMessage,
  getSafeAdminSaveErrorMessage,
  isAdminAccessDeniedError,
} from '../../utils/adminFeedback';
import { selectProductVisualImage } from '../../utils/productVisualImagePicker';
import type { ImageUploadFile } from '../../../../utils/images/imagePicker';
import * as S from '../ProductVisualContentManagers/styles';

type ProductGuideSectionManagerProps = {
  productId: string;
  sections: ProductGuideSection[];
  onChanged: () => Promise<void>;
  onAccessDenied: () => void;
};

type SectionEditor = { mode: 'create' } | { mode: 'edit'; sectionId: string };

const IMAGE_INVALID_MESSAGE = 'Escolha uma imagem válida.';
const IMAGE_TOO_LARGE_MESSAGE = 'A imagem deve ter no máximo 5 MB.';

function buildSectionPreview(section: ProductGuideSection) {
  return [section.body ?? '', ...(section.bullets ?? [])]
    .filter(Boolean)
    .join(' ')
    .slice(0, 120);
}

export function ProductGuideSectionManager({
  productId,
  sections,
  onChanged,
  onAccessDenied,
}: ProductGuideSectionManagerProps) {
  const [editor, setEditor] = useState<SectionEditor | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageUploadFile | null>(
    null,
  );
  const [values, setValues] = useState<ProductGuideSectionFormValues>(
    INITIAL_PRODUCT_GUIDE_SECTION_FORM_VALUES,
  );
  const [errors, setErrors] = useState<ProductGuideSectionFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const editingSection =
    editor?.mode === 'edit'
      ? sections.find(section => section.id === editor.sectionId) ?? null
      : null;

  function resetEditor() {
    setEditor(null);
    setValues(INITIAL_PRODUCT_GUIDE_SECTION_FORM_VALUES);
    setErrors({});
    setSelectedImage(null);
  }

  function updateField<K extends keyof ProductGuideSectionFormValues>(
    field: K,
    value: ProductGuideSectionFormValues[K],
  ) {
    setValues(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
  }

  function startCreate() {
    setFeedbackMessage('');
    setErrorMessage('');
    setEditor({ mode: 'create' });
    setValues(INITIAL_PRODUCT_GUIDE_SECTION_FORM_VALUES);
    setErrors({});
    setSelectedImage(null);
  }

  function startEdit(section: ProductGuideSection) {
    setFeedbackMessage('');
    setErrorMessage('');
    setEditor({ mode: 'edit', sectionId: section.id });
    setValues(getInitialGuideSectionFormValuesFromItem(section));
    setErrors({});
    setSelectedImage(null);
  }

  async function chooseImage() {
    const result = await selectProductVisualImage('product-guide-section.jpg');
    if (result.status === 'error') {
      setErrorMessage(result.message);
      return;
    }
    if (result.status === 'selected') {
      setSelectedImage(result.file);
      setErrorMessage('');
    }
  }

  async function uploadImage(sectionId: string) {
    if (!selectedImage) return true;
    try {
      await productsService.uploadProductGuideSectionImage(
        productId,
        sectionId,
        selectedImage,
      );
      return true;
    } catch (error) {
      if (isAdminAccessDeniedError(error)) {
        onAccessDenied();
        return false;
      }
      setErrorMessage(
        getSafeAdminImageErrorMessage(error, {
          invalidMessage: IMAGE_INVALID_MESSAGE,
          tooLargeMessage: IMAGE_TOO_LARGE_MESSAGE,
          uploadMessage:
            'A seção foi salva, mas não foi possível enviar a imagem.',
        }),
      );
      await onChanged();
      return false;
    }
  }

  async function saveSection() {
    const nextErrors = validateProductGuideSectionForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      let savedSectionId: string;
      if (editor?.mode === 'edit') {
        const updated = await productsService.updateProductGuideSection(
          productId,
          editor.sectionId,
          toUpdateProductGuideSectionPayload(values),
        );
        savedSectionId = updated.id;
        setFeedbackMessage('Seção atualizada.');
      } else {
        const created = await productsService.createProductGuideSection(
          productId,
          toCreateProductGuideSectionPayload(values),
        );
        savedSectionId = created.id;
        setFeedbackMessage('Seção adicionada.');
      }

      if (!(await uploadImage(savedSectionId))) return;
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

  async function removeImage() {
    if (!editingSection) return;
    setIsSaving(true);
    setErrorMessage('');
    try {
      await productsService.removeProductGuideSectionImage(
        productId,
        editingSection.id,
      );
      setSelectedImage(null);
      setFeedbackMessage('Seção atualizada.');
      await onChanged();
    } catch (error) {
      if (isAdminAccessDeniedError(error)) {
        onAccessDenied();
        return;
      }
      setErrorMessage(ADMIN_REMOVE_ERROR_MESSAGE);
    } finally {
      setIsSaving(false);
    }
  }

  function confirmDelete(section: ProductGuideSection) {
    Alert.alert(
      'Remover este item?',
      'Esta ação não altera o produto, apenas remove este conteúdo visual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(section.id);
            setErrorMessage('');
            try {
              await productsService.deleteProductGuideSection(
                productId,
                section.id,
              );
              setFeedbackMessage('Seção removida.');
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
        title="Seções do guia"
        description="Crie orientações práticas como escolha, conservação e aproveitamento."
      >
        <S.Stack>
          {feedbackMessage ? (
            <S.SuccessText>{feedbackMessage}</S.SuccessText>
          ) : null}
          {errorMessage ? <S.ErrorText>{errorMessage}</S.ErrorText> : null}

          {sections.length === 0 ? (
            <EmptyStateCard
              title="Nenhuma seção cadastrada."
              description="Adicione orientações práticas para completar este guia."
            >
              <PrimaryButton onPress={startCreate}>
                Adicionar seção
              </PrimaryButton>
            </EmptyStateCard>
          ) : (
            <S.Stack>
              {sections.map(section => (
                <ProductVisualContentCard
                  key={section.id}
                  title={section.title}
                  subtitle={[
                    buildSectionPreview(section),
                    typeof section.sortOrder === 'number'
                      ? `Ordem ${section.sortOrder}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' • ')}
                  badgeLabel={getProductGuideSectionKindValueLabel(
                    (
                      {
                        choose: 'CHOOSE',
                        observe: 'OBSERVE',
                        store: 'STORE',
                        use: 'USE',
                        quickFacts: 'QUICK_FACTS',
                        other: 'OTHER',
                      } as const
                    )[section.kind],
                  )}
                  imageUrl={section.imageUrl}
                  onEdit={() => startEdit(section)}
                  onDelete={() => confirmDelete(section)}
                  isDeleting={deletingId === section.id}
                />
              ))}
            </S.Stack>
          )}

          {editor ? (
            <S.EditorCard>
              <S.EditorHeader>
                <S.EditorTitle>
                  {editor.mode === 'edit' ? 'Editar seção' : 'Nova seção'}
                </S.EditorTitle>
              </S.EditorHeader>
              <S.FieldGroup>
                <S.FieldLabel>Tipo da seção</S.FieldLabel>
                <S.ChipRow>
                  {PRODUCT_GUIDE_SECTION_KIND_OPTIONS.map(option => (
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
                label="Título"
                value={values.title}
                onChangeText={value => updateField('title', value)}
                helperText={errors.title}
              />
              <InputField
                label="Texto principal"
                value={values.body}
                onChangeText={value => updateField('body', value)}
                helperText={errors.body}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
              <ProductVisualContentCard
                title="Imagem da seção"
                subtitle={
                  selectedImage
                    ? 'Arquivo selecionado para envio.'
                    : editingSection?.imageUrl
                    ? 'Imagem atual cadastrada.'
                    : 'Esta seção ainda não tem imagem.'
                }
                imageUrl={selectedImage?.uri ?? editingSection?.imageUrl}
              />
              <S.Actions>
                <SecondaryButton onPress={chooseImage} disabled={isSaving}>
                  Escolher imagem
                </SecondaryButton>
                {editingSection?.imageUrl ? (
                  <TextButton
                    fullWidth={false}
                    onPress={removeImage}
                    loading={isSaving}
                    disabled={isSaving}
                  >
                    Remover imagem
                  </TextButton>
                ) : null}
              </S.Actions>
              <InputField
                label="Texto alternativo da imagem"
                value={values.imageAlt}
                onChangeText={value => updateField('imageAlt', value)}
              />
              <InputField
                label="Legenda da imagem"
                value={values.imageCaption}
                onChangeText={value => updateField('imageCaption', value)}
              />
              <InputField
                label="Pontos principais"
                value={values.bullets}
                onChangeText={value => updateField('bullets', value)}
                helperText="Use um item por linha, separados por vírgula, ou cole um array JSON."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <InputField
                label="Sinais ideais"
                value={values.idealPoints}
                onChangeText={value => updateField('idealPoints', value)}
                helperText="Use um item por linha, separados por vírgula, ou cole um array JSON."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <InputField
                label="Sinais de atenção"
                value={values.avoidPoints}
                onChangeText={value => updateField('avoidPoints', value)}
                multiline
                helperText="Use um item por linha, separados por vírgula, ou cole um array JSON."
                numberOfLines={4}
                textAlignVertical="top"
              />
              <InputField
                label="Ordem"
                value={values.sortOrder}
                onChangeText={value => updateField('sortOrder', value)}
                keyboardType="number-pad"
                helperText={errors.sortOrder}
              />
              <S.Actions>
                <PrimaryButton onPress={saveSection} loading={isSaving}>
                  Salvar
                </PrimaryButton>
                <SecondaryButton onPress={resetEditor} disabled={isSaving}>
                  Cancelar
                </SecondaryButton>
              </S.Actions>
            </S.EditorCard>
          ) : sections.length > 0 ? (
            <SecondaryButton onPress={startCreate}>
              Adicionar seção
            </SecondaryButton>
          ) : null}
        </S.Stack>
      </AdminFormSection>
    </SurfaceCard>
  );
}
