import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArticleCard,
  Avatar,
  EmptyStateCard,
  FilterChip,
  PageHeader,
  PrimaryButton,
  ProductCard,
  RecentProductCard,
  SafeScreen,
  SearchInput,
  SectionTitle,
  SurfaceCard,
  TextButton,
} from '../../components';
import { APP_NAME } from '../../config/brand';
import { useArticles } from '../../features/articles/hooks/useArticles';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useFavoriteProducts } from '../../features/products/hooks/useFavoriteProducts';
import { useRecentProducts } from '../../features/products/hooks/useRecentProducts';
import { useProducts } from '../../features/products/hooks/useProducts';
import { productsService } from '../../features/products/services/products.service';
import type { ProductCategoryFilter } from '../../features/products/types/product';
import { useTheme } from '../../hooks/useTheme';
import { AppStackParamList, AppTabParamList } from '../../types/navigation';
import * as S from './styles';

type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Home'>,
  NativeStackScreenProps<AppStackParamList>
>;

function ListItemSeparator() {
  return <S.ListSpacer />;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const hasFocusedOnceRef = React.useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategoryFilter>('ALL');
  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState<string[]>([]);
  const {
    categories,
    products,
    meta,
    isLoading,
    isRefreshing,
    isError,
    isEmpty,
    retry,
    refresh,
  } = useProducts({
    activeCategory,
    searchQuery,
  });
  const {
    products: favoriteProducts,
    isLoading: isLoadingFavorites,
    isError: isFavoriteProductsError,
    isEmpty: isFavoriteProductsEmpty,
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
    articles,
    isLoading: isLoadingArticles,
    isError: isArticlesError,
    isEmpty: isArticlesEmpty,
    retry: retryArticles,
  } = useArticles({
    activeCategory: 'ALL',
  });

  useFocusEffect(
    React.useCallback(() => {
      if (!hasFocusedOnceRef.current) {
        hasFocusedOnceRef.current = true;
        return undefined;
      }

      refreshFavorites();
      refreshRecentProducts();
      return undefined;
    }, [refreshFavorites, refreshRecentProducts]),
  );

  const previewArticles = useMemo(() => articles.slice(0, 2), [articles]);
  const favoriteProductIds = useMemo(
    () => new Set(favoriteProducts.map(product => product.id)),
    [favoriteProducts],
  );
  const favoriteLoadingIdSet = useMemo(
    () => new Set(favoriteLoadingIds),
    [favoriteLoadingIds],
  );
  const totalProducts = meta.total;
  const catalogSubtitle =
    isLoading && products.length === 0
      ? 'Preparando a lista para você.'
      : totalProducts === 1
        ? '1 item encontrado.'
        : `${totalProducts} itens encontrados.`;

  function handleOpenProduct(productId: string) {
    navigation.navigate('ProductDetail', { productId });
  }

  function handleOpenArticle(articleId: string) {
    navigation.navigate('ArticleDetail', { articleId });
  }

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
    async (product: (typeof products)[number]) => {
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

  function handleRetryProducts() {
    retry();
  }

  async function handleClearRecentProducts() {
    try {
      await clearRecentProducts();
    } catch {
      // The hook already maps storage failures to a safe message.
    }
  }

  function handleOpenFeed() {
    navigation.navigate('Feed');
  }

  function renderCatalogEmptyState() {
    if (isLoading) {
      return (
        <SurfaceCard>
          <S.StatusContent>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <SectionTitle
              title="Carregando produtos"
              subtitle="Aguarde um instante."
            />
          </S.StatusContent>
        </SurfaceCard>
      );
    }

    if (isError) {
      return (
        <EmptyStateCard
          title="Não foi possível carregar os produtos."
          description="Tente novamente em instantes."
        >
          <PrimaryButton onPress={handleRetryProducts}>Tentar novamente</PrimaryButton>
        </EmptyStateCard>
      );
    }

    if (isEmpty) {
      return (
        <EmptyStateCard
          title="Nenhum produto encontrado."
          description="Tente buscar por outro nome ou alterar os filtros."
        />
      );
    }

    return null;
  }

  function renderFavoritesSection() {
    if (isLoadingFavorites && favoriteProducts.length === 0) {
      return (
        <S.SectionBlock>
          <SectionTitle
            title="Favoritos"
            subtitle="Produtos salvos para consultar depois."
          />
          <SurfaceCard>
            <S.StatusContent>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <SectionTitle
                title="Carregando favoritos"
                subtitle="Aguarde um instante."
              />
            </S.StatusContent>
          </SurfaceCard>
        </S.SectionBlock>
      );
    }

    if (isFavoriteProductsError && favoriteProducts.length === 0) {
      return (
        <S.SectionBlock>
          <SectionTitle
            title="Favoritos"
            subtitle="Produtos salvos para consultar depois."
          />
          <SurfaceCard>
            <S.SectionMessage>{favoriteProductsErrorMessage}</S.SectionMessage>
          </SurfaceCard>
        </S.SectionBlock>
      );
    }

    if (isFavoriteProductsEmpty) {
      return null;
    }

    return (
      <S.SectionBlock>
        <SectionTitle
          title="Favoritos"
          subtitle="Produtos salvos para consultar depois."
        />
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
      </S.SectionBlock>
    );
  }

  function renderRecentProductsSection() {
    if (isLoadingRecentProducts && recentProducts.length === 0) {
      return (
        <S.SectionBlock>
          <SectionTitle
            title="Vistos recentemente"
            subtitle="Continue de onde parou."
          />
          <SurfaceCard>
            <S.StatusContent>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <SectionTitle
                title="Carregando produtos recentes"
                subtitle="Aguarde um instante."
              />
            </S.StatusContent>
          </SurfaceCard>
        </S.SectionBlock>
      );
    }

    if (recentProductsErrorMessage) {
      return (
        <S.SectionBlock>
          <SectionTitle
            title="Vistos recentemente"
            subtitle="Continue de onde parou."
          />
          <SurfaceCard>
            <S.SectionMessage>{recentProductsErrorMessage}</S.SectionMessage>
          </SurfaceCard>
        </S.SectionBlock>
      );
    }

    if (recentProducts.length === 0) {
      return null;
    }

    return (
      <S.SectionBlock>
        <S.SectionHeaderContent>
          <SectionTitle
            title="Vistos recentemente"
            subtitle="Continue de onde parou."
          />
          <S.SectionHeaderActionRow>
            <TextButton onPress={handleClearRecentProducts}>
              Limpar histórico
            </TextButton>
          </S.SectionHeaderActionRow>
        </S.SectionHeaderContent>
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
      </S.SectionBlock>
    );
  }

  function renderArticlesPreviewSection() {
    if (isLoadingArticles && previewArticles.length === 0) {
      return (
        <S.FooterBlock>
          <SectionTitle
            title="Conteúdos educativos"
            subtitle="Aguarde enquanto preparamos algumas leituras."
          />
          <SurfaceCard>
            <S.StatusContent>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <SectionTitle
                title="Carregando conteúdos"
                subtitle="Aguarde um instante."
              />
            </S.StatusContent>
          </SurfaceCard>
        </S.FooterBlock>
      );
    }

    if (isArticlesError && previewArticles.length === 0) {
      return (
        <S.FooterBlock>
          <SectionTitle
            title="Conteúdos educativos"
            subtitle="Sugestões rápidas para o seu dia a dia."
          />
          <SurfaceCard>
            <S.FooterContent>
              <S.SectionMessage>Não foi possível carregar os conteúdos.</S.SectionMessage>
              <TextButton onPress={retryArticles}>Tentar novamente</TextButton>
            </S.FooterContent>
          </SurfaceCard>
        </S.FooterBlock>
      );
    }

    if (isArticlesEmpty || previewArticles.length === 0) {
      return null;
    }

    return (
      <S.FooterBlock>
        <S.FooterHeaderRow>
          <SectionTitle
            title="Conteúdos educativos"
            subtitle="Sugestões rápidas para o seu dia a dia."
          />
          <TextButton onPress={handleOpenFeed}>Ver todos</TextButton>
        </S.FooterHeaderRow>
        <S.ArticlePreviewStack>
          {previewArticles.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              onPress={() => handleOpenArticle(article.id)}
            />
          ))}
        </S.ArticlePreviewStack>
      </S.FooterBlock>
    );
  }

  return (
    <SafeScreen edges={['top', 'left', 'right']}>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isFavorite={resolveIsFavorite(item)}
            isFavoriteLoading={favoriteLoadingIdSet.has(item.id)}
            onToggleFavorite={() => handleToggleFavorite(item)}
            onPress={() => handleOpenProduct(item.id)}
          />
        )}
        refreshing={isRefreshing}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.layout.screenPadding,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.layout.tabContentBottomPadding,
        }}
        ItemSeparatorComponent={ListItemSeparator}
        ListHeaderComponent={
          <S.HeaderContent>
            <S.HeaderRow>
              <PageHeader
                title={APP_NAME}
                subtitle="Escolha, conserve e aproveite melhor seus alimentos."
                rightSlot={<Avatar label={APP_NAME} />}
              />
            </S.HeaderRow>

            <S.SectionBlock>
              <SearchInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar por nome do alimento"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
            </S.SectionBlock>

            <S.SectionBlock>
              <SectionTitle
                title="Categorias"
                subtitle="Escolha uma categoria para filtrar."
              />
              <S.ChipRow>
                {categories.map(category => (
                  <FilterChip
                    key={category.value}
                    label={category.label}
                    onPress={() => setActiveCategory(category.value)}
                    active={activeCategory === category.value}
                  />
                ))}
              </S.ChipRow>
            </S.SectionBlock>

            {renderFavoritesSection()}
            {renderRecentProductsSection()}

            <S.SectionBlock>
              <SectionTitle title="Guia de produtos" subtitle={catalogSubtitle} />
            </S.SectionBlock>
          </S.HeaderContent>
        }
        ListFooterComponent={renderArticlesPreviewSection()}
        ListEmptyComponent={renderCatalogEmptyState()}
      />
    </SafeScreen>
  );
}
