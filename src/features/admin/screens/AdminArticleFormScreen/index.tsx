import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BackButton,
  FilterChip,
  InputField,
  PrimaryButton,
  SafeScreen,
  ScreenContainer,
  SecondaryButton,
  SectionTitle,
  SurfaceCard,
} from '../../../../components';
import { AppStackParamList } from '../../../../types/navigation';
import { articlesService } from '../../../articles/services/articles.service';
import type {
  ArticleCategory,
  CreateArticlePayload,
} from '../../../articles/types/article';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useTheme } from '../../../../hooks/useTheme';
import { AdminAccessDenied } from '../../components/AdminAccessDenied';
import { AdminFormSection } from '../../components/AdminFormSection';
import {
  ADMIN_ARTICLE_CATEGORY_OPTIONS,
  formatTags,
  parseTags,
} from '../../utils/adminContent';
import * as S from './styles';

type AdminArticleFormScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'AdminArticleForm'
>;

type ArticleFormValues = {
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

const INITIAL_FORM_VALUES: ArticleFormValues = {
  title: '',
  summary: '',
  content: '',
  category: null,
  imageUrl: '',
  tags: '',
  isPublished: true,
};

function validateForm(values: ArticleFormValues): ArticleFormErrors {
  const errors: ArticleFormErrors = {};

  if (!values.title.trim()) {
    errors.title = 'Informe o titulo do artigo.';
  }

  if (!values.summary.trim()) {
    errors.summary = 'Informe o resumo.';
  }

  if (!values.content.trim()) {
    errors.content = 'Informe o conteudo.';
  }

  if (!values.category) {
    errors.category = 'Selecione uma categoria.';
  }

  return errors;
}

export function AdminArticleFormScreen({
  navigation,
  route,
}: AdminArticleFormScreenProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const articleId = route.params?.articleId;
  const isEditing = Boolean(articleId);
  const [formValues, setFormValues] = useState<ArticleFormValues>(INITIAL_FORM_VALUES);
  const [formErrors, setFormErrors] = useState<ArticleFormErrors>({});
  const [screenError, setScreenError] = useState('');
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!articleId) {
      return;
    }

    const currentArticleId = articleId;
    let isMounted = true;

    async function loadArticle() {
      setIsLoading(true);
      setScreenError('');

      try {
        const article = await articlesService.getArticleById(currentArticleId);

        if (!isMounted) {
          return;
        }

        setFormValues({
          title: article.title,
          summary: article.summary,
          content: article.content,
          category: article.category,
          imageUrl: article.imageUrl ?? '',
          tags: formatTags(article.tags),
          isPublished: Boolean(article.publishedAt),
        });
      } catch {
        if (isMounted) {
          setScreenError('Nao foi possivel carregar os artigos.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadArticle();

    return () => {
      isMounted = false;
    };
  }, [articleId]);

  const submitLabel = useMemo(
    () => (isEditing ? 'Salvar alteracoes' : 'Salvar artigo'),
    [isEditing],
  );

  if (user?.role !== 'ADMIN') {
    return <AdminAccessDenied onGoBack={() => navigation.goBack()} />;
  }

  function updateField<K extends keyof ArticleFormValues>(
    field: K,
    value: ArticleFormValues[K],
  ) {
    setFormValues(current => ({
      ...current,
      [field]: value,
    }));

    setFormErrors(current => ({
      ...current,
      [field]: undefined,
    }));

    if (screenError) {
      setScreenError('');
    }
  }

  async function handleSubmit() {
    const errors = validateForm(formValues);

    if (Object.keys(errors).length > 0) {
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

    setIsSaving(true);
    setScreenError('');

    try {
      if (articleId) {
        await articlesService.updateArticle(articleId, payload);
      } else {
        await articlesService.createArticle(payload);
      }

      Alert.alert(
        isEditing ? 'Artigo atualizado.' : 'Artigo salvo.',
        undefined,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch {
      setScreenError('Nao foi possivel salvar o artigo.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeScreen edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={S.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScreenContainer scrollable keyboardShouldPersistTaps="handled">
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={() => navigation.goBack()} />
              <S.HeaderCopy>
                <S.HeaderTitle>{isEditing ? 'Editar artigo' : 'Novo artigo'}</S.HeaderTitle>
                <S.HeaderSubtitle>Prepare o conteudo que sera exibido no feed.</S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>

            {isLoading ? (
              <SurfaceCard>
                <S.StatusContent>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <SectionTitle
                    title="Carregando artigo"
                    subtitle="Aguarde um instante."
                  />
                </S.StatusContent>
              </SurfaceCard>
            ) : (
              <SurfaceCard>
                <S.FormStack>
                  <AdminFormSection
                    title="Dados principais"
                    description="Titulo, resumo e categoria do artigo."
                  >
                    <InputField
                      label="Titulo"
                      value={formValues.title}
                      onChangeText={value => updateField('title', value)}
                      helperText={formErrors.title}
                    />
                    <InputField
                      label="Resumo"
                      value={formValues.summary}
                      onChangeText={value => updateField('summary', value)}
                      helperText={formErrors.summary}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />

                    <S.CategoryGroup>
                      <S.CategoryLabel>Categoria</S.CategoryLabel>
                      <S.ChipRow>
                        {ADMIN_ARTICLE_CATEGORY_OPTIONS.map(option => (
                          <FilterChip
                            key={option.value}
                            label={option.label}
                            active={formValues.category === option.value}
                            onPress={() => updateField('category', option.value)}
                          />
                        ))}
                      </S.ChipRow>
                      {formErrors.category ? (
                        <S.ErrorText>{formErrors.category}</S.ErrorText>
                      ) : null}
                    </S.CategoryGroup>

                    <InputField
                      label="URL da imagem"
                      value={formValues.imageUrl}
                      onChangeText={value => updateField('imageUrl', value)}
                      autoCapitalize="none"
                    />

                    <InputField
                      label="Tags"
                      value={formValues.tags}
                      onChangeText={value => updateField('tags', value)}
                      helperText="Separe as tags por virgula."
                    />

                    <S.ToggleRow>
                      <S.ToggleCopy>
                        <S.ToggleTitle>Publicado</S.ToggleTitle>
                        <S.ToggleDescription>
                          Controle se o artigo deve aparecer para os usuarios.
                        </S.ToggleDescription>
                      </S.ToggleCopy>
                      <Switch
                        value={formValues.isPublished}
                        onValueChange={value => updateField('isPublished', value)}
                        trackColor={{
                          false: theme.colors.borderStrong,
                          true: theme.colors.primary,
                        }}
                        thumbColor={theme.colors.surface}
                      />
                    </S.ToggleRow>
                  </AdminFormSection>

                  <AdminFormSection
                    title="Conteudo"
                    description="Escreva o texto completo do artigo."
                  >
                    <InputField
                      label="Conteudo"
                      value={formValues.content}
                      onChangeText={value => updateField('content', value)}
                      helperText={formErrors.content}
                      multiline
                      numberOfLines={10}
                      textAlignVertical="top"
                    />
                  </AdminFormSection>

                  {screenError ? <S.ErrorText>{screenError}</S.ErrorText> : null}

                  <S.Actions>
                    <PrimaryButton onPress={handleSubmit} loading={isSaving}>
                      {submitLabel}
                    </PrimaryButton>
                    <SecondaryButton onPress={() => navigation.goBack()} disabled={isSaving}>
                      Cancelar
                    </SecondaryButton>
                  </S.Actions>
                </S.FormStack>
              </SurfaceCard>
            )}
          </S.Content>
        </ScreenContainer>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
