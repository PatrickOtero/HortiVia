import React from 'react';
import {
  FilterChip,
  InputField,
  PrimaryButton,
  SecondaryButton,
  TextButton,
} from '../../../../components';
import type { ArticleBlockKind } from '../../../articles/types/article';
import * as S from './styles';

export type BlockFormValues = {
  kind: ArticleBlockKind;
  title: string;
  body: string;
  items: string[];
  sortOrder: string;
};

type BlockFormErrors = Partial<Record<'sortOrder', string>>;

export const ARTICLE_BLOCK_KIND_OPTIONS: Array<{
  value: ArticleBlockKind;
  label: string;
  description: string;
}> = [
  { value: 'SECTION', label: 'Seção', description: 'Agrupa um subtítulo, texto, itens e uma imagem de apoio.' },
  { value: 'PARAGRAPH', label: 'Parágrafo', description: 'Apresenta texto corrido, com opção de imagem complementar.' },
  { value: 'HEADING', label: 'Título de seção', description: 'Marca uma mudança de assunto com um subtítulo destacado.' },
  { value: 'IMAGE', label: 'Imagem', description: 'Exibe uma imagem independente com texto alternativo e legenda.' },
  { value: 'TIP', label: 'Dica', description: 'Destaca uma orientação prática ligada ao tema do artigo.' },
  { value: 'WARNING', label: 'Atenção', description: 'Chama atenção para um cuidado ou limite relevante.' },
  { value: 'CHECKLIST', label: 'Checklist', description: 'Organiza pontos que o leitor pode conferir um a um.' },
  { value: 'STEPS', label: 'Passos', description: 'Apresenta instruções em uma sequência numerada.' },
  { value: 'QUOTE', label: 'Citação', description: 'Destaca uma frase; o título do bloco pode indicar a fonte.' },
  { value: 'PRODUCT_REFERENCE', label: 'Referência de produto', description: 'Relaciona uma informação específica ao produto tratado.' },
  { value: 'OTHER', label: 'Outro', description: 'Apresenta conteúdo complementar com título, texto ou itens.' },
];

type ArticleBlockEditorProps = {
  mode: 'create' | 'edit';
  values: BlockFormValues;
  errors: BlockFormErrors;
  isSaving: boolean;
  isBusy: boolean;
  onChange: <K extends keyof BlockFormValues>(
    field: K,
    value: BlockFormValues[K],
  ) => void;
  onUpdateItem: (index: number, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onSave: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
};

export function ArticleBlockEditor({
  mode,
  values,
  errors,
  isSaving,
  isBusy,
  onChange,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onSave,
  onCancel,
  children,
}: ArticleBlockEditorProps) {
  const isCreating = mode === 'create';

  return (
    <S.EditorShell>
      <S.EditorCard>
        <S.EditorHeader>
          <S.EditorTitle>{isCreating ? 'Novo bloco' : 'Editar bloco'}</S.EditorTitle>
          <S.EditorDescription>
            {isCreating
              ? 'Escolha o tipo de bloco e preencha o conteudo principal.'
              : 'Atualize o conteudo e a ordem deste bloco.'}
          </S.EditorDescription>
        </S.EditorHeader>

        <S.FieldGroup>
          <S.FieldLabel>Tipo de bloco</S.FieldLabel>
          <S.ChipRow>
            {ARTICLE_BLOCK_KIND_OPTIONS.map(option => (
              <FilterChip
                key={option.value}
                label={option.label}
                active={values.kind === option.value}
                onPress={() => onChange('kind', option.value)}
              />
            ))}
          </S.ChipRow>
          <S.HelperText>
            {ARTICLE_BLOCK_KIND_OPTIONS.find(option => option.value === values.kind)?.description}
          </S.HelperText>
        </S.FieldGroup>

        <InputField
          label="Titulo do bloco"
          value={values.title}
          onChangeText={value => onChange('title', value)}
        />
        <InputField
          label="Texto do bloco"
          value={values.body}
          onChangeText={value => onChange('body', value)}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <S.FieldGroup>
          <S.FieldLabel>Itens</S.FieldLabel>
          <S.ItemList>
            {values.items.map((item, index) => (
              <S.ItemEditorRow key={`${index + 1}`}>
                <S.ItemInputShell>
                  <InputField
                    label={`Item ${index + 1}`}
                    value={item}
                    onChangeText={value => onUpdateItem(index, value)}
                  />
                </S.ItemInputShell>
                <TextButton
                  fullWidth={false}
                  onPress={() => onRemoveItem(index)}
                >
                  Remover item
                </TextButton>
              </S.ItemEditorRow>
            ))}
          </S.ItemList>
          <SecondaryButton fullWidth={false} onPress={onAddItem}>
            Adicionar item
          </SecondaryButton>
          {values.items.length === 0 ? (
            <S.HelperText>
              Adicione itens quando o bloco for checklist, passos, dica ou alerta.
            </S.HelperText>
          ) : null}
        </S.FieldGroup>

        <InputField
          label="Ordem"
          value={values.sortOrder}
          onChangeText={value => onChange('sortOrder', value)}
          keyboardType="number-pad"
          helperText={errors.sortOrder}
          helperTone={errors.sortOrder ? 'danger' : 'default'}
        />

        <S.EditorActions>
          <PrimaryButton onPress={onSave} loading={isSaving}>
            {isCreating ? 'Criar bloco' : 'Salvar bloco'}
          </PrimaryButton>
          <SecondaryButton onPress={onCancel} disabled={isBusy}>
            Cancelar
          </SecondaryButton>
        </S.EditorActions>
      </S.EditorCard>

      {isCreating ? (
        <S.SupportBox>
          <S.SupportTitle>Salve o bloco para adicionar imagem.</S.SupportTitle>
          <S.HelperText>
            Depois de criar o bloco, voce podera enviar a imagem, ajustar o texto
            alternativo e a legenda.
          </S.HelperText>
        </S.SupportBox>
      ) : (
        children
      )}
    </S.EditorShell>
  );
}
