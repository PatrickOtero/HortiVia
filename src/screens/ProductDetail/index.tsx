import React from 'react';
import { ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BackButton,
  EmptyStateCard,
  NutritionGrid,
  PrimaryButton,
  ProductDetailHero,
  ProductInfoSection,
  SafeScreen,
  ScreenContainer,
  SectionTitle,
  SurfaceCard,
} from '../../components';
import { useProductById } from '../../features/products/hooks/useProductById';
import { useTheme } from '../../hooks/useTheme';
import { AppStackParamList } from '../../types/navigation';
import * as S from './styles';

type ProductDetailScreenProps = NativeStackScreenProps<AppStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({
  navigation,
  route,
}: ProductDetailScreenProps) {
  const { theme } = useTheme();
  const productId = route.params.productId;
  const { product, isLoading, isNotFound, retry } = useProductById({
    productId,
  });

  function handleGoBack() {
    navigation.goBack();
  }

  function handleRetry() {
    retry();
  }

  if (isLoading) {
    return (
      <SafeScreen edges={['top', 'left', 'right', 'bottom']}>
        <ScreenContainer scrollable>
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={handleGoBack} />
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

  if (!product) {
    return (
      <SafeScreen edges={['top', 'left', 'right', 'bottom']}>
        <ScreenContainer scrollable>
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={handleGoBack} />
            </S.HeaderRow>

            <EmptyStateCard
              title={isNotFound ? 'Produto não encontrado.' : 'Não foi possível carregar este produto.'}
              description={isNotFound ? 'Volte e escolha outro item.' : 'Tente novamente.'}
            >
              {isNotFound ? (
                <PrimaryButton onPress={handleGoBack}>Voltar</PrimaryButton>
              ) : (
                <PrimaryButton onPress={handleRetry}>Tentar novamente</PrimaryButton>
              )}
            </EmptyStateCard>
          </S.Content>
        </ScreenContainer>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen edges={['top', 'left', 'right', 'bottom']}>
      <ScreenContainer scrollable>
        <S.Content>
          <S.HeaderRow>
            <BackButton onPress={handleGoBack} />
          </S.HeaderRow>

          <ProductDetailHero product={product} />

          {product.description ? (
            <SurfaceCard>
              <SectionTitle title="Sobre este item" subtitle={product.description} />
            </SurfaceCard>
          ) : null}

          {product.benefits?.length ? (
            <SurfaceCard>
              <SectionTitle
                title="Por que incluir"
                subtitle="Pontos simples para considerar no dia a dia."
              />
              <S.BenefitsRow>
                {product.benefits.map(benefit => (
                  <S.BenefitChip key={benefit}>
                    <S.BenefitText>{benefit}</S.BenefitText>
                  </S.BenefitChip>
                ))}
              </S.BenefitsRow>
            </SurfaceCard>
          ) : null}

          {product.nutrients?.length ? (
            <SurfaceCard>
              <SectionTitle
                title="Informações rápidas"
                subtitle="Dados gerais para orientar sua escolha."
              />
              <NutritionGrid nutrients={product.nutrients} />
            </SurfaceCard>
          ) : null}

          {product.howToChoose?.length ? (
            <ProductInfoSection
              title="Como escolher"
              subtitle="Observe alguns sinais simples na hora da compra."
              items={product.howToChoose}
            />
          ) : null}

          {product.howToStore?.length ? (
            <ProductInfoSection
              title="Como conservar"
                subtitle="Cuidados rápidos para manter a qualidade."
              items={product.howToStore}
            />
          ) : null}

          {product.usageTips?.length ? (
            <ProductInfoSection
              title="Como usar"
                subtitle="Ideias práticas para incluir no cardápio."
              items={product.usageTips}
            />
          ) : null}
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
