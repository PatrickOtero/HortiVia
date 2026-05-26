import React from 'react';
import { ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BackButton,
  EmptyStateCard,
  PrimaryButton,
  ProductGuideSection,
  ProductHeroGallery,
  ProductQuickFactsCard,
  SafeScreen,
  ScreenContainer,
  SectionTitle,
  SurfaceCard,
} from '../../components';
import { getProductCategoryLabel } from '../../features/products/mappers/product.mapper';
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

  const chooseSection =
    product?.guideSections.find(section => section.kind === 'choose') ?? null;
  const observeSection =
    product?.guideSections.find(section => section.kind === 'observe') ?? null;
  const storeSection =
    product?.guideSections.find(section => section.kind === 'store') ?? null;
  const useSection =
    product?.guideSections.find(section => section.kind === 'use') ?? null;

  if (isLoading) {
    return (
      <SafeScreen edges={['top', 'left', 'right', 'bottom']}>
        <ScreenContainer scrollable>
          <S.Content>
            <S.HeroStage>
              <ProductHeroGallery
                product={{
                  id: 'loading',
                  name: 'Produto',
                  slug: 'produto',
                  category: 'FRUIT',
                  shortDescription: 'Preparando as orientações.',
                  imageUrl: null,
                  description: null,
                  benefits: [],
                  howToChoose: [],
                  howToStore: [],
                  usageTips: [],
                  nutrients: [],
                  mainImages: [],
                  guideSections: [],
                }}
              />
              <S.FloatingBackButton>
                <BackButton onPress={handleGoBack} />
              </S.FloatingBackButton>
            </S.HeroStage>

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
            <EmptyStateCard
              title={isNotFound ? 'Esse produto não está disponível.' : 'Não foi possível carregar este produto.'}
              description={isNotFound ? 'Volte e escolha outro item.' : 'Tente novamente em instantes.'}
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
          <S.HeroStage>
            <ProductHeroGallery product={product} />
            <S.FloatingBackButton>
              <BackButton onPress={handleGoBack} />
            </S.FloatingBackButton>
          </S.HeroStage>

          <S.SummaryCard>
            <S.SummaryContent>
              <S.CategoryTag $category={product.category}>
                <S.CategoryText>
                  {getProductCategoryLabel(product.category)}
                </S.CategoryText>
              </S.CategoryTag>
              <S.ProductName>{product.name}</S.ProductName>
              <S.ProductSummary>{product.shortDescription}</S.ProductSummary>
              {product.description ? (
                <S.ProductDescription>{product.description}</S.ProductDescription>
              ) : null}
            </S.SummaryContent>
          </S.SummaryCard>

          {chooseSection ? <ProductGuideSection section={chooseSection} /> : null}

          {observeSection ? <ProductGuideSection section={observeSection} /> : null}

          {storeSection ? <ProductGuideSection section={storeSection} /> : null}

          {useSection ? <ProductGuideSection section={useSection} /> : null}

          <ProductQuickFactsCard
            nutrients={product.nutrients}
            highlights={product.benefits}
          />
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
