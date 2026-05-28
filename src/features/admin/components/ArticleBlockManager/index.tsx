import React, { useMemo, useState } from 'react';
import {
  EmptyStateCard,
  FilterChip,
  InputField,
  PrimaryButton,
  SecondaryButton,
  TextButton,
} from '../../../../components';
import { useAuth } from '../../../auth/hooks/useAuth';
import { normalizeBlockItems } from '../../../articles/utils/articleBlocks';
import { articlesService } from '../../../articles/services/articles.service';
import type {
  ArticleBlock,
  ArticleBlockKind,
} from '../../../articles/types/article';
import {
  ADMIN_REMOVE_ERROR_MESSAGE,
  getSafeAdminSaveErrorMessage,
} from '../../utils/adminFeedback';
import { ArticleBlockImageManager } from '../ArticleBlockImageManager';
import * as S from './styles';

type ArticleBlockManagerProps = {
  articleId: string;
  blocks: ArticleBlock[];
  onCreateBlock: (block: ArticleBlock) => void;
  onUpdateBlock: (block: ArticleBlock) => void;
  onDeleteBlock: (blockId: string) => void;
};

type EditorState =
  | {
      mode: 'create';
    }
  | {
      mode: 'edit';
      blockId: string;
    }
  | null;

type BlockFormValues = {
  kind: ArticleBlockKind;
  title: string;
  body: string;
  items: string[];
  sortOrder: string;
};

type BlockFormErrors = Partial<Record<'sortOrder', string>>;

type ActionState =
  | {
      blockId: string;
      type: 'save' | 'delete' | 'move-up' | 'move-down';
    }
  | null;

const BLOCK_KIND_OPTIONS: Array<{
  value: ArticleBlockKind;
  label: string;
}> = [
  { value: 'SECTION', label: 'Secao' },
  { value: 'PARAGRAPH', label: 'Paragrafo' },
  { value: 'HEADING', label: 'Titulo' },
  { value: 'IMAGE', label: 'Imagem' },
  { value: 'TIP', label: 'Dica' },
  { value: 'WARNING', label: 'Atencao' },
  { value: 'CHECKLIST', label: 'Checklist' },
  { value: 'STEPS', label: 'Passos' },
  { value: 'QUOTE', label: 'Citacao' },
  { value: 'PRODUCT_REFERENCE', label: 'Referencia' },
  { value: 'OTHER', label: 'Outro' },
];

const INITIAL_BLOCK_KIND: ArticleBlockKind = 'SECTION';

function getNextSortOrder(blocks: ArticleBlock[]) {
  return (
    blocks.reduce((highest, block) => {
      const currentSortOrder =
        typeof block.sortOrder === 'number' ? block.sortOrder : 0;

      return currentSortOrder > highest ? currentSortOrder : highest;
    }, -1) + 1
  );
}

function buildInitialFormValues(
  blocks: ArticleBlock[],
  block?: ArticleBlock,
): BlockFormValues {
  return {
    kind: block?.kind ?? INITIAL_BLOCK_KIND,
    title: block?.title ?? '',
    body: block?.body ?? '',
    items: normalizeBlockItems(block?.items),
    sortOrder: String(block?.sortOrder ?? getNextSortOrder(blocks)),
  };
}

function buildBlockTitle(block: ArticleBlock) {
  if (block.title?.trim()) {
    return block.title.trim();
  }

  const kindLabel = BLOCK_KIND_OPTIONS.find(
    option => option.value === block.kind,
  )?.label;

  return kindLabel ? `Bloco ${kindLabel}` : 'Bloco';
}

function buildBlockPreview(block: ArticleBlock) {
  const bodyPreview = block.body?.trim();

  if (bodyPreview) {
    return bodyPreview.slice(0, 140);
  }

  const items = normalizeBlockItems(block.items);

  if (items.length > 0) {
    return items.join(' - ').slice(0, 140);
  }

  return 'Sem conteudo complementar.';
}

function sortBlocks(blocks: ArticleBlock[]) {
  return [...blocks].sort((left, right) => {
    const leftSortOrder = typeof left.sortOrder === 'number' ? left.sortOrder : 0;
    const rightSortOrder =
      typeof right.sortOrder === 'number' ? right.sortOrder : 0;

    if (leftSortOrder !== rightSortOrder) {
      return leftSortOrder - rightSortOrder;
    }

    return left.id.localeCompare(right.id);
  });
}

export function ArticleBlockManager({
  articleId,
  blocks,
  onCreateBlock,
  onUpdateBlock,
  onDeleteBlock,
}: ArticleBlockManagerProps) {
  const { user } = useAuth();
  const [editorState, setEditorState] = useState<EditorState>(null);
  const [formValues, setFormValues] = useState<BlockFormValues>(
    buildInitialFormValues(blocks),
  );
  const [formErrors, setFormErrors] = useState<BlockFormErrors>({});
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [actionState, setActionState] = useState<ActionState>(null);

  const isAdmin = user?.role === 'ADMIN';
  const sortedBlocks = useMemo(() => sortBlocks(blocks), [blocks]);
  const editingBlock = useMemo(
    () =>
      editorState?.mode === 'edit'
        ? sortedBlocks.find(block => block.id === editorState.blockId) ?? null
        : null,
    [editorState, sortedBlocks],
  );

  if (!isAdmin) {
    return null;
  }

  function resetEditor(nextEditorState: EditorState = null) {
    setEditorState(nextEditorState);
    setFormValues(
      buildInitialFormValues(
        blocks,
        nextEditorState?.mode === 'edit'
          ? sortedBlocks.find(block => block.id === nextEditorState.blockId)
          : undefined,
      ),
    );
    setFormErrors({});
  }

  function clearFeedback() {
    setFeedbackMessage('');
    setErrorMessage('');
  }

  function updateField<K extends keyof BlockFormValues>(
    field: K,
    value: BlockFormValues[K],
  ) {
    setFormValues(current => ({
      ...current,
      [field]: value,
    }));

    setFormErrors(current => ({
      ...current,
      [field]: undefined,
    }));
  }

  function updateItem(index: number, value: string) {
    updateField(
      'items',
      formValues.items.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    );
  }

  function addItem() {
    updateField('items', [...formValues.items, '']);
  }

  function removeItem(index: number) {
    updateField(
      'items',
      formValues.items.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function startCreateBlock() {
    clearFeedback();
    setEditorState({ mode: 'create' });
    setFormValues(buildInitialFormValues(blocks));
    setFormErrors({});
  }

  function startEditBlock(block: ArticleBlock) {
    clearFeedback();
    setEditorState({ mode: 'edit', blockId: block.id });
    setFormValues(buildInitialFormValues(blocks, block));
    setFormErrors({});
  }

  function validateForm() {
    const nextErrors: BlockFormErrors = {};
    const parsedSortOrder = Number(formValues.sortOrder);

    if (!Number.isInteger(parsedSortOrder) || parsedSortOrder < 0) {
      nextErrors.sortOrder = 'Informe uma ordem valida a partir de 0.';
    }

    setFormErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSaveBlock() {
    if (!editorState) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    clearFeedback();
    const targetBlockId =
      editorState.mode === 'edit' ? editorState.blockId : `draft-${articleId}`;
    setActionState({
      blockId: targetBlockId,
      type: 'save',
    });

    try {
      const payload = {
        kind: formValues.kind,
        title: formValues.title.trim(),
        body: formValues.body.trim(),
        items: formValues.items.map(item => item.trim()).filter(Boolean),
        sortOrder: Number(formValues.sortOrder),
      };

      if (editorState.mode === 'create') {
        const createdBlock = await articlesService.createArticleBlock(
          articleId,
          payload,
        );
        onCreateBlock(createdBlock);
        setFeedbackMessage('Bloco criado.');
        resetEditor();
        return;
      }

      const updatedBlock = await articlesService.updateArticleBlock(
        articleId,
        editorState.blockId,
        payload,
      );
      onUpdateBlock(updatedBlock);
      setFeedbackMessage('Bloco atualizado.');
      resetEditor();
    } catch (error) {
      setErrorMessage(getSafeAdminSaveErrorMessage(error));
    } finally {
      setActionState(null);
    }
  }

  async function handleDeleteBlock(blockId: string) {
    if (actionState) {
      return;
    }

    clearFeedback();
    setActionState({
      blockId,
      type: 'delete',
    });

    try {
      await articlesService.deleteArticleBlock(articleId, blockId);
      onDeleteBlock(blockId);

      if (editorState?.mode === 'edit' && editorState.blockId === blockId) {
        resetEditor();
      }

      setFeedbackMessage('Bloco removido.');
    } catch {
      setErrorMessage(ADMIN_REMOVE_ERROR_MESSAGE);
    } finally {
      setActionState(null);
    }
  }

  async function handleMoveBlock(blockId: string, direction: 'up' | 'down') {
    if (actionState) {
      return;
    }

    const currentIndex = sortedBlocks.findIndex(block => block.id === blockId);

    if (currentIndex < 0) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sortedBlocks.length) {
      return;
    }

    const currentBlock = sortedBlocks[currentIndex];
    const targetBlock = sortedBlocks[targetIndex];
    const currentSortOrder =
      typeof currentBlock.sortOrder === 'number' ? currentBlock.sortOrder : currentIndex;
    const targetSortOrder =
      typeof targetBlock.sortOrder === 'number' ? targetBlock.sortOrder : targetIndex;

    clearFeedback();
    setActionState({
      blockId,
      type: direction === 'up' ? 'move-up' : 'move-down',
    });

    try {
      const updatedCurrent = await articlesService.updateArticleBlock(
        articleId,
        currentBlock.id,
        {
          sortOrder: targetSortOrder,
        },
      );
      const updatedTarget = await articlesService.updateArticleBlock(
        articleId,
        targetBlock.id,
        {
          sortOrder: currentSortOrder,
        },
      );

      onUpdateBlock(updatedCurrent);
      onUpdateBlock(updatedTarget);
      setFeedbackMessage('Ordem dos blocos atualizada.');
    } catch (error) {
      setErrorMessage(getSafeAdminSaveErrorMessage(error));
    } finally {
      setActionState(null);
    }
  }

  return (
    <S.Container>
      <S.HeaderRow>
        <PrimaryButton
          fullWidth={false}
          onPress={startCreateBlock}
          disabled={Boolean(editorState) || Boolean(actionState)}
        >
          Adicionar bloco
        </PrimaryButton>
      </S.HeaderRow>

      {editorState?.mode === 'create' ? (
        <S.EditorShell>
          <S.EditorCard>
            <S.EditorHeader>
              <S.EditorTitle>Novo bloco</S.EditorTitle>
              <S.EditorDescription>
                Escolha o tipo de bloco e preencha o conteudo principal.
              </S.EditorDescription>
            </S.EditorHeader>

            <S.FieldGroup>
              <S.FieldLabel>Tipo de bloco</S.FieldLabel>
              <S.ChipRow>
                {BLOCK_KIND_OPTIONS.map(option => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    active={formValues.kind === option.value}
                    onPress={() => updateField('kind', option.value)}
                  />
                ))}
              </S.ChipRow>
            </S.FieldGroup>

            <InputField
              label="Titulo do bloco"
              value={formValues.title}
              onChangeText={value => updateField('title', value)}
            />
            <InputField
              label="Texto do bloco"
              value={formValues.body}
              onChangeText={value => updateField('body', value)}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <S.FieldGroup>
              <S.FieldLabel>Itens</S.FieldLabel>
              <S.ItemList>
                {formValues.items.map((item, index) => (
                  <S.ItemEditorRow key={`${index + 1}`}>
                    <S.ItemInputShell>
                      <InputField
                        label={`Item ${index + 1}`}
                        value={item}
                        onChangeText={value => updateItem(index, value)}
                      />
                    </S.ItemInputShell>
                    <TextButton
                      fullWidth={false}
                      onPress={() => removeItem(index)}
                    >
                      Remover item
                    </TextButton>
                  </S.ItemEditorRow>
                ))}
              </S.ItemList>
              <SecondaryButton fullWidth={false} onPress={addItem}>
                Adicionar item
              </SecondaryButton>
              {formValues.items.length === 0 ? (
                <S.HelperText>
                  Adicione itens quando o bloco for checklist, passos, dica ou alerta.
                </S.HelperText>
              ) : null}
            </S.FieldGroup>

            <InputField
              label="Ordem"
              value={formValues.sortOrder}
              onChangeText={value => updateField('sortOrder', value)}
              keyboardType="number-pad"
              helperText={formErrors.sortOrder}
              helperTone={formErrors.sortOrder ? 'danger' : 'default'}
            />

            <S.EditorActions>
              <PrimaryButton
                onPress={handleSaveBlock}
                loading={
                  actionState?.type === 'save' &&
                  actionState.blockId === `draft-${articleId}`
                }
              >
                Criar bloco
              </PrimaryButton>
              <SecondaryButton
                onPress={() => resetEditor()}
                disabled={Boolean(actionState)}
              >
                Cancelar
              </SecondaryButton>
            </S.EditorActions>
          </S.EditorCard>

          <S.SupportBox>
            <S.SupportTitle>Salve o bloco para adicionar imagem.</S.SupportTitle>
            <S.HelperText>
              Depois de criar o bloco, voce podera enviar a imagem, ajustar o texto
              alternativo e a legenda.
            </S.HelperText>
          </S.SupportBox>
        </S.EditorShell>
      ) : null}

      {feedbackMessage ? <S.SuccessText>{feedbackMessage}</S.SuccessText> : null}
      {errorMessage ? <S.ErrorText>{errorMessage}</S.ErrorText> : null}

      {sortedBlocks.length === 0 ? (
        <EmptyStateCard
          title="Nenhum bloco cadastrado."
          description="Crie o primeiro bloco para estruturar o artigo antes de enviar imagens."
        />
      ) : (
        <S.Stack>
          {sortedBlocks.map((block, index) => {
            const isEditingBlock =
              editorState?.mode === 'edit' && editorState.blockId === block.id;
            const isFirst = index === 0;
            const isLast = index === sortedBlocks.length - 1;

            return (
              <S.ItemCard key={block.id}>
                <S.ItemHeader>
                  <S.ItemCopy>
                    <S.ItemTitle>{buildBlockTitle(block)}</S.ItemTitle>
                    <S.MetaRow>
                      <S.Badge>
                        <S.BadgeText>{block.kind}</S.BadgeText>
                      </S.Badge>
                      <S.Badge>
                        <S.BadgeText>Ordem {block.sortOrder ?? 0}</S.BadgeText>
                      </S.Badge>
                    </S.MetaRow>
                    <S.ItemSubtitle>{buildBlockPreview(block)}</S.ItemSubtitle>
                  </S.ItemCopy>
                </S.ItemHeader>

                <S.ItemActions>
                  <SecondaryButton
                    fullWidth={false}
                    onPress={() => startEditBlock(block)}
                    disabled={Boolean(actionState)}
                  >
                    Editar
                  </SecondaryButton>
                  <TextButton
                    fullWidth={false}
                    onPress={() => handleMoveBlock(block.id, 'up')}
                    loading={
                      actionState?.type === 'move-up' &&
                      actionState.blockId === block.id
                    }
                    disabled={isFirst || Boolean(actionState)}
                  >
                    Subir
                  </TextButton>
                  <TextButton
                    fullWidth={false}
                    onPress={() => handleMoveBlock(block.id, 'down')}
                    loading={
                      actionState?.type === 'move-down' &&
                      actionState.blockId === block.id
                    }
                    disabled={isLast || Boolean(actionState)}
                  >
                    Descer
                  </TextButton>
                  <TextButton
                    fullWidth={false}
                    onPress={() => handleDeleteBlock(block.id)}
                    loading={
                      actionState?.type === 'delete' &&
                      actionState.blockId === block.id
                    }
                    disabled={
                      Boolean(actionState) && actionState?.blockId !== block.id
                    }
                  >
                    Remover bloco
                  </TextButton>
                </S.ItemActions>

                {isEditingBlock ? (
                  <S.EditorShell>
                    <S.EditorCard>
                      <S.EditorHeader>
                        <S.EditorTitle>Editar bloco</S.EditorTitle>
                        <S.EditorDescription>
                          Atualize o conteudo e a ordem deste bloco.
                        </S.EditorDescription>
                      </S.EditorHeader>

                      <S.FieldGroup>
                        <S.FieldLabel>Tipo de bloco</S.FieldLabel>
                        <S.ChipRow>
                          {BLOCK_KIND_OPTIONS.map(option => (
                            <FilterChip
                              key={option.value}
                              label={option.label}
                              active={formValues.kind === option.value}
                              onPress={() => updateField('kind', option.value)}
                            />
                          ))}
                        </S.ChipRow>
                      </S.FieldGroup>

                      <InputField
                        label="Titulo do bloco"
                        value={formValues.title}
                        onChangeText={value => updateField('title', value)}
                      />
                      <InputField
                        label="Texto do bloco"
                        value={formValues.body}
                        onChangeText={value => updateField('body', value)}
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                      />

                      <S.FieldGroup>
                        <S.FieldLabel>Itens</S.FieldLabel>
                        <S.ItemList>
                          {formValues.items.map((item, itemIndex) => (
                            <S.ItemEditorRow key={`${block.id}-${itemIndex + 1}`}>
                              <S.ItemInputShell>
                                <InputField
                                  label={`Item ${itemIndex + 1}`}
                                  value={item}
                                  onChangeText={value =>
                                    updateItem(itemIndex, value)
                                  }
                                />
                              </S.ItemInputShell>
                              <TextButton
                                fullWidth={false}
                                onPress={() => removeItem(itemIndex)}
                              >
                                Remover item
                              </TextButton>
                            </S.ItemEditorRow>
                          ))}
                        </S.ItemList>
                        <SecondaryButton fullWidth={false} onPress={addItem}>
                          Adicionar item
                        </SecondaryButton>
                        {formValues.items.length === 0 ? (
                          <S.HelperText>
                            Adicione itens quando o bloco for checklist, passos,
                            dica ou alerta.
                          </S.HelperText>
                        ) : null}
                      </S.FieldGroup>

                      <InputField
                        label="Ordem"
                        value={formValues.sortOrder}
                        onChangeText={value => updateField('sortOrder', value)}
                        keyboardType="number-pad"
                        helperText={formErrors.sortOrder}
                        helperTone={formErrors.sortOrder ? 'danger' : 'default'}
                      />

                      <S.EditorActions>
                        <PrimaryButton
                          onPress={handleSaveBlock}
                          loading={
                            actionState?.type === 'save' &&
                            actionState.blockId === block.id
                          }
                        >
                          Salvar bloco
                        </PrimaryButton>
                        <SecondaryButton
                          onPress={() => resetEditor()}
                          disabled={Boolean(actionState)}
                        >
                          Cancelar
                        </SecondaryButton>
                      </S.EditorActions>
                    </S.EditorCard>

                    {editingBlock ? (
                      <ArticleBlockImageManager
                        articleId={articleId}
                        block={editingBlock}
                        onUpdatedBlock={onUpdateBlock}
                      />
                    ) : null}
                  </S.EditorShell>
                ) : null}
              </S.ItemCard>
            );
          })}
        </S.Stack>
      )}
    </S.Container>
  );
}
