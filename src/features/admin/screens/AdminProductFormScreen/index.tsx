import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BackButton,
  EmptyStateCard,
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
import { productsService } from '../../../products/services/products.service';
import type {
  CreateProductPayload,
  ProductCategory,
} from '../../../products/types/product';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useTheme } from '../../../../hooks/useTheme';
import { AdminAccessDenied } from '../../components/AdminAccessDenied';
import { AdminFormSection } from '../../components/AdminFormSection';
import {
  ADMIN_PRODUCT_CATEGORY_OPTIONS,
  formatMultilineList,
  formatNutrients,
  parseMultilineList,
  parseNutrients,
} from '../../utils/adminContent';
import * as S from './styles';

type AdminProductFormScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'AdminProductForm'
>;

type ProductFormValues = {
  name: string;
  category: ProductCategory | null;
  shortDescription: string;
  description: string;
  imageUrl: string;
  benefits: string;
  howToChoose: string;
  howToStore: string;
  usageTips: string;
  nutrients: string;
};

type ProductFormErrors = Partial<
  Record<'name' | 'category' | 'shortDescription', string>
>;

const INITIAL_FORM_VALUES: ProductFormValues = {
  name: '',
  category: null,
  shortDescription: '',
  description: '',
  imageUrl: '',
  benefits: '',
  howToChoose: '',
  howToStore: '',
  usageTips: '',
  nutrients: '',
};

function validateForm(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Informe o nome do produto.';
  }

  if (!values.category) {
    errors.category = 'Selecione uma categoria.';
  }

  if (!values.shortDescription.trim()) {
    errors.shortDescription = 'Informe a descricao curta.';
  }

  return errors;
}

export function AdminProductFormScreen({
  navigation,
  route,
}: AdminProductFormScreenProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const productId = route.params?.productId;
  const isEditing = Boolean(productId);
  const [formValues, setFormValues] = useState<ProductFormValues>(INITIAL_FORM_VALUES);
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
  const [screenError, setScreenError] = useState('');
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!productId) {
      return;
    }

    const currentProductId = productId;
    let isMounted = true;

    async function loadProduct() {
      setIsLoading(true);
      setScreenError('');

      try {
        const product = await productsService.getProductById(currentProductId);

        if (!isMounted) {
          return;
        }

        setFormValues({
          name: product.name,
          category: product.category,
          shortDescription: product.shortDescription,
          description: product.description ?? '',
          imageUrl: product.imageUrl ?? '',
          benefits: formatMultilineList(product.benefits),
          howToChoose: formatMultilineList(product.howToChoose),
          howToStore: formatMultilineList(product.howToStore),
          usageTips: formatMultilineList(product.usageTips),
          nutrients: formatNutrients(product.nutrients),
        });
      } catch {
        if (isMounted) {
          setScreenError('Nao foi possivel carregar os produtos.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const submitLabel = useMemo(
    () => (isEditing ? 'Salvar alteracoes' : 'Salvar produto'),
    [isEditing],
  );

  if (user?.role !== 'ADMIN') {
    return <AdminAccessDenied onGoBack={() => navigation.goBack()} />;
  }

  function updateField<K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
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

    const payload: CreateProductPayload = {
      name: formValues.name,
      category: formValues.category!,
      shortDescription: formValues.shortDescription,
      description: formValues.description,
      imageUrl: formValues.imageUrl,
      benefits: parseMultilineList(formValues.benefits),
      howToChoose: parseMultilineList(formValues.howToChoose),
      howToStore: parseMultilineList(formValues.howToStore),
      usageTips: parseMultilineList(formValues.usageTips),
      nutrients: parseNutrients(formValues.nutrients),
    };

    setIsSaving(true);
    setScreenError('');

    try {
      if (productId) {
        await productsService.updateProduct(productId, payload);
      } else {
        await productsService.createProduct(payload);
      }

      Alert.alert(
        isEditing ? 'Produto atualizado.' : 'Produto salvo.',
        undefined,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch {
      setScreenError('Nao foi possivel salvar o produto.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <SafeScreen>
        <ScreenContainer scrollable>
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={() => navigation.goBack()} />
              <S.HeaderCopy>
                <S.HeaderTitle>{isEditing ? 'Editar produto' : 'Novo produto'}</S.HeaderTitle>
                <S.HeaderSubtitle>Prepare as informacoes exibidas no app.</S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>
            <SurfaceCard>
              <S.StatusContent>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <SectionTitle
                  title="Carregando produto"
                  subtitle="Aguarde um instante."
                />
              </S.StatusContent>
            </SurfaceCard>
          </S.Content>
        </ScreenContainer>
      </SafeScreen>
    );
  }

  if (screenError && isEditing && formValues.name.length === 0) {
    return (
      <SafeScreen>
        <ScreenContainer scrollable>
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={() => navigation.goBack()} />
              <S.HeaderCopy>
                <S.HeaderTitle>Editar produto</S.HeaderTitle>
                <S.HeaderSubtitle>Prepare as informacoes exibidas no app.</S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>
            <EmptyStateCard
              title="Nao foi possivel carregar os produtos."
              description="Tente novamente."
            >
              <S.Actions>
                <PrimaryButton onPress={() => navigation.replace('AdminProductForm', { productId })}>
                  Tentar novamente
                </PrimaryButton>
                <SecondaryButton onPress={() => navigation.goBack()}>
                  Voltar
                </SecondaryButton>
              </S.Actions>
            </EmptyStateCard>
          </S.Content>
        </ScreenContainer>
      </SafeScreen>
    );
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
                <S.HeaderTitle>{isEditing ? 'Editar produto' : 'Novo produto'}</S.HeaderTitle>
                <S.HeaderSubtitle>Preencha os dados que aparecem para os usuarios.</S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>

            <SurfaceCard>
              <S.FormStack>
                <AdminFormSection
                  title="Dados principais"
                  description="Nome, categoria e resumo do produto."
                >
                  <InputField
                    label="Nome"
                    value={formValues.name}
                    onChangeText={value => updateField('name', value)}
                    helperText={formErrors.name}
                  />

                  <S.CategoryGroup>
                    <S.CategoryLabel>Categoria</S.CategoryLabel>
                    <S.ChipRow>
                      {ADMIN_PRODUCT_CATEGORY_OPTIONS.map(option => (
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
                    label="Descricao curta"
                    value={formValues.shortDescription}
                    onChangeText={value => updateField('shortDescription', value)}
                    helperText={formErrors.shortDescription}
                  />

                  <InputField
                    label="Descricao"
                    value={formValues.description}
                    onChangeText={value => updateField('description', value)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />

                  <InputField
                    label="URL da imagem"
                    value={formValues.imageUrl}
                    onChangeText={value => updateField('imageUrl', value)}
                    autoCapitalize="none"
                  />
                </AdminFormSection>

                <AdminFormSection
                  title="Informacoes complementares"
                  description="Use uma linha por item e o formato label: valor para nutrientes."
                >
                  <InputField
                    label="Beneficios"
                    value={formValues.benefits}
                    onChangeText={value => updateField('benefits', value)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <InputField
                    label="Como escolher"
                    value={formValues.howToChoose}
                    onChangeText={value => updateField('howToChoose', value)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <InputField
                    label="Como conservar"
                    value={formValues.howToStore}
                    onChangeText={value => updateField('howToStore', value)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <InputField
                    label="Dicas de uso"
                    value={formValues.usageTips}
                    onChangeText={value => updateField('usageTips', value)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <InputField
                    label="Nutrientes"
                    value={formValues.nutrients}
                    onChangeText={value => updateField('nutrients', value)}
                    multiline
                    numberOfLines={4}
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
          </S.Content>
        </ScreenContainer>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
