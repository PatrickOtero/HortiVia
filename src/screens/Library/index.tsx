import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  CompactArticleCard,
  PageHeader,
  RecentProductCard,
  SafeScreen,
  ScreenContainer,
  SectionTitle,
  SurfaceCard,
  TextButton,
} from '../../components';
import { useSavedArticles } from '../../features/articles/hooks/useSavedArticles';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useFavoriteProducts } from '../../features/products/hooks/useFavoriteProducts';
import { useRecentProducts } from '../../features/products/hooks/useRecentProducts';
import { productsService } from '../../features/products/services/products.service';
import { useTheme } from '../../hooks/useTheme';
import { AppStackParamList, AppTabParamList } from '../../types/navigation';
import * as S from './styles';

type LibraryScreenProps = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Library'>,
  NativeStackScreenProps<AppStackParamList>
>;

export function LibraryScreen({ navigation }: LibraryScreenProps) {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const hasFocusedOnceRef = React.useRef(false);
  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState<string[]>([]);
  const {
    products: favoriteProducts,
    isLoading: isLoadingFavorites,
    isError: isFavoriteProductsError,
    errorMessage: favoriteProductsErrorMessage,
    refresh: refreshFavorites,
    removeProduct: removeFavoriteProduct,
    upsertProduct: upsertFavoriteProduct,
  } = useFavoriteProducts();
  const {
    recentProducts,
    isLoading: isLoadingRecentProducts,
    errorMessage: recentProductsErrorMessage,
    refreshRecentProducts,
    clearRecentProducts,
  } = useRecentProducts();
  const {
    articles: savedArticles,
    isLoading: isLoadingSavedArticles,
    isError: isSavedArticlesError,
    errorMessage: savedArticlesErrorMessage,
    refreshSavedArticles,
    isArticleSaved,
    isArticleSaveLoading,
    toggleSavedArticle,
  } = useSavedArticles();

  useFocusEffect(
    React.useCallback(() => {
      if (!hasFocusedOnceRef.current) {
        hasFocusedOnceRef.current = true;
        return undefined;
      }

      refreshFavorites();
      refreshRecentProducts();
      refreshSavedArticles();
      return undefined;
    }, [refreshFavorites, refreshRecentProducts, refreshSavedArticles]),
  );

  const favoriteProductIds = useMemo(
    () => new Set(favoriteProducts.map(product => product.id)),
    [favoriteProducts],
  );
  const favoriteLoadingIdSet = useMemo(
    () => new Set(favoriteLoadingIds),
    [favoriteLoadingIds],
  );

  const resolveIsFavorite = useCallback(
    (product: { id: string; isFavorite?: boolean }) =>
      favoriteProductIds.has(product.id) || product.isFavorite === true,
    [favoriteProductIds],
  );

  const setFavoriteProductLoading = useCallback(
    (productId: string, nextIsLoading: boolean) => {
      setFavoriteLoadingIds(currentIds => {
        const nextIds = new Set(currentIds);

        if (nextIsLoading) {
          nextIds.add(productId);
        } else {
          nextIds.delete(productId);
        }

        return Array.from(nextIds);
      });
    },
    [],
  );

  const handleToggleFavorite = useCallback(
    async (product: (typeof favoriteProducts)[number] | (typeof recentProducts)[number]) => {
      if (favoriteLoadingIdSet.has(product.id)) {
        return;
      }

      if (!isAuthenticated) {
        Alert.alert('Favoritos', 'Entre para salvar produtos nos favoritos.');
        return;
      }

      const nextIsFavorite = !resolveIsFavorite(product);

      setFavoriteProductLoading(product.id, true);

      if (nextIsFavorite) {
        upsertFavoriteProduct({
          ...product,
          isFavorite: true,
        });
      } else {
        removeFavoriteProduct(product.id);
      }

      try {
        if (nextIsFavorite) {
          await productsService.favoriteProduct(product.id);
        } else {
          await productsService.unfavoriteProduct(product.id);
        }
      } catch {
        if (nextIsFavorite) {
          removeFavoriteProduct(product.id);
        } else {
          upsertFavoriteProduct({
            ...product,
            isFavorite: true,
          });
        }

        Alert.alert('Favoritos', 'Não foi possível atualizar os favoritos.');
      } finally {
        setFavoriteProductLoading(product.id, false);
      }
    },
    [
      favoriteLoadingIdSet,
      isAuthenticated,
      removeFavoriteProduct,
      resolveIsFavorite,
      setFavoriteProductLoading,
      upsertFavoriteProduct,
    ],
  );

  function handleOpenProduct(productId: string) {
    navigation.navigate('ProductDetail', { productId });
  }

  function handleOpenArticle(articleId: string) {
    navigation.navigate('ArticleDetail', { articleId });
  }

  function handleExploreProducts() {
    navigation.navigate('Home');
  }

  function handleExploreArticles() {
    navigation.navigate('Feed');
  }

  async function handleClearRecentProducts() {
    try {
      await clearRecentProducts();
    } catch {
      // Safe message is already handled by the hook state.
    }
  }

  function renderCompactEmptyState(
    title: string,
    description: string,
    actionLabel: string,
    onPress: () => void,
  ) {
    return (
      <SurfaceCard>
        <S.EmptyContent>
          <S.EmptyTitle>{title}</S.EmptyTitle>
          <S.EmptyDescription>{description}</S.EmptyDescription>
          <S.EmptyActionRow>
            <TextButton onPress={onPress}>{actionLabel}</TextButton>
          </S.EmptyActionRow>
        </S.EmptyContent>
      </SurfaceCard>
    );
  }

  function renderFavoriteProductsSection() {
    return (
      <S.SectionBlock>
        <S.SectionHeaderRow>
          <SectionTitle
            title="Produtos favoritos"
            subtitle="Salve produtos para encontrá-los mais rápido depois."
          />
        </S.SectionHeaderRow>

        {isLoadingFavorites && favoriteProducts.length === 0 ? (
          <SurfaceCard>
            <S.StatusContent>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <SectionTitle
                title="Carregando favoritos"
                subtitle="Aguarde um instante."
              />
            </S.StatusContent>
          </SurfaceCard>
        ) : null}

        {isFavoriteProductsError && favoriteProducts.length === 0 ? (
          <SurfaceCard>
            <S.MessageText>
              {favoriteProductsErrorMessage ?? 'Não foi possível carregar seus favoritos.'}
            </S.MessageText>
          </SurfaceCard>
        ) : null}

        {!isLoadingFavorites &&
        !isFavoriteProductsError &&
        favoriteProducts.length === 0
          ? renderCompactEmptyState(
              'Nenhum produto favorito ainda.',
              'Salve produtos para encontrá-los mais rápido depois.',
              'Explorar produtos',
              handleExploreProducts,
            )
          : null}

        {favoriteProducts.length > 0 ? (
          <S.HorizontalScroll
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingRight: theme.spacing.sm,
            }}
          >
            {favoriteProducts.map(product => (
              <S.HorizontalCardShell key={product.id}>
                <RecentProductCard
                  product={{
                    ...product,
                    viewedAt: new Date().toISOString(),
                  }}
                  isFavorite
                  isFavoriteLoading={favoriteLoadingIdSet.has(product.id)}
                  onToggleFavorite={() => handleToggleFavorite(product)}
                  onPress={() => handleOpenProduct(product.id)}
                />
              </S.HorizontalCardShell>
            ))}
          </S.HorizontalScroll>
        ) : null}
      </S.SectionBlock>
    );
  }

  function renderRecentProductsSection() {
    return (
      <S.SectionBlock>
        <S.SectionHeaderRow>
          <SectionTitle
            title="Vistos recentemente"
            subtitle="Os produtos que você abrir aparecerão aqui."
          />
          {recentProducts.length > 0 ? (
            <S.SectionActionRow>
              <TextButton onPress={handleClearRecentProducts}>
                Limpar histórico
              </TextButton>
            </S.SectionActionRow>
          ) : null}
        </S.SectionHeaderRow>

        {isLoadingRecentProducts && recentProducts.length === 0 ? (
          <SurfaceCard>
            <S.StatusContent>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <SectionTitle
                title="Carregando produtos recentes"
                subtitle="Aguarde um instante."
              />
            </S.StatusContent>
          </SurfaceCard>
        ) : null}

        {recentProductsErrorMessage && recentProducts.length === 0 ? (
          <SurfaceCard>
            <S.MessageText>{recentProductsErrorMessage}</S.MessageText>
          </SurfaceCard>
        ) : null}

        {!isLoadingRecentProducts &&
        !recentProductsErrorMessage &&
        recentProducts.length === 0
          ? renderCompactEmptyState(
              'Nenhum produto visto recentemente.',
              'Os produtos que você abrir aparecerão aqui.',
              'Explorar produtos',
              handleExploreProducts,
            )
          : null}

        {recentProducts.length > 0 ? (
          <S.HorizontalScroll
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingRight: theme.spacing.sm,
            }}
          >
            {recentProducts.map(product => (
              <S.HorizontalCardShell key={product.id}>
                <RecentProductCard
                  product={product}
                  isFavorite={resolveIsFavorite(product)}
                  isFavoriteLoading={favoriteLoadingIdSet.has(product.id)}
                  onToggleFavorite={() => handleToggleFavorite(product)}
                  onPress={() => handleOpenProduct(product.id)}
                />
              </S.HorizontalCardShell>
            ))}
          </S.HorizontalScroll>
        ) : null}
      </S.SectionBlock>
    );
  }

  function renderSavedArticlesSection() {
    return (
      <S.SectionBlock>
        <S.SectionHeaderRow>
          <SectionTitle
            title="Leituras salvas"
            subtitle="Salve artigos para encontrar conteúdos úteis mais tarde."
          />
        </S.SectionHeaderRow>

        {isLoadingSavedArticles && savedArticles.length === 0 ? (
          <SurfaceCard>
            <S.StatusContent>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <SectionTitle
                title="Carregando leituras salvas"
                subtitle="Aguarde um instante."
              />
            </S.StatusContent>
          </SurfaceCard>
        ) : null}

        {isSavedArticlesError && savedArticles.length === 0 ? (
          <SurfaceCard>
            <S.MessageText>
              {savedArticlesErrorMessage ?? 'Não foi possível carregar suas leituras salvas.'}
            </S.MessageText>
          </SurfaceCard>
        ) : null}

        {!isLoadingSavedArticles &&
        !isSavedArticlesError &&
        savedArticles.length === 0
          ? renderCompactEmptyState(
              'Nenhuma leitura salva ainda.',
              'Salve artigos para encontrar conteúdos úteis mais tarde.',
              'Explorar artigos',
              handleExploreArticles,
            )
          : null}

        {savedArticles.length > 0 ? (
          <S.HorizontalScroll
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingRight: theme.spacing.sm,
            }}
          >
            {savedArticles.map(article => (
              <S.HorizontalCardShell key={article.id}>
                <CompactArticleCard
                  article={article}
                  isSaved={isArticleSaved(article)}
                  isSavedLoading={isArticleSaveLoading(article.id)}
                  onToggleSaved={event => {
                    event.stopPropagation?.();
                    toggleSavedArticle(article).catch(() => {
                      Alert.alert('Leituras salvas', 'Não foi possível atualizar esta leitura.');
                    });
                  }}
                  onPress={() => handleOpenArticle(article.id)}
                />
              </S.HorizontalCardShell>
            ))}
          </S.HorizontalScroll>
        ) : null}
      </S.SectionBlock>
    );
  }

  return (
    <SafeScreen>
      <ScreenContainer scrollable withTabBarSpacing>
        <S.Content>
          <PageHeader
            title="Biblioteca"
            subtitle="Acesse rapidamente produtos e conteúdos que você salvou ou consultou."
          />

          {renderFavoriteProductsSection()}
          {renderRecentProductsSection()}
          {renderSavedArticlesSection()}
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
