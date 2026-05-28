import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArticleCard,
  Avatar,
  EmptyStateCard,
  FilterChip,
  PageHeader,
  PrimaryButton,
  ProductCard,
  SafeScreen,
  SearchInput,
  SectionTitle,
  SurfaceCard,
  TextButton,
} from '../../components';
import { APP_NAME } from '../../config/brand';
import { useArticles } from '../../features/articles/hooks/useArticles';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useProducts } from '../../features/products/hooks/useProducts';
import { productsService } from '../../features/products/services/products.service';
import type {
  ProductCategoryFilter,
  ProductListItem,
} from '../../features/products/types/product';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] =
    useState<ProductCategoryFilter>('ALL');
  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState<string[]>([]);
  const [favoriteOverrides, setFavoriteOverrides] = useState<
    Record<string, boolean>
  >({});
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
    articles,
    isLoading: isLoadingArticles,
    isError: isArticlesError,
    isEmpty: isArticlesEmpty,
    retry: retryArticles,
  } = useArticles({
    activeCategory: 'ALL',
  });

  const previewArticles = useMemo(() => articles.slice(0, 2), [articles]);
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
    (product: ProductListItem) =>
      favoriteOverrides[product.id] ?? (product.isFavorite === true),
    [favoriteOverrides],
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

  const setFavoriteOverride = useCallback(
    (productId: string, isFavorite: boolean) => {
      setFavoriteOverrides(currentOverrides => ({
        ...currentOverrides,
        [productId]: isFavorite,
      }));
    },
    [],
  );

  const handleToggleFavorite = useCallback(
    async (product: ProductListItem) => {
      if (favoriteLoadingIdSet.has(product.id)) {
        return;
      }

      if (!isAuthenticated) {
        Alert.alert('Favoritos', 'Entre para salvar produtos nos favoritos.');
        return;
      }

      const previousIsFavorite = resolveIsFavorite(product);
      const nextIsFavorite = !previousIsFavorite;

      setFavoriteProductLoading(product.id, true);
      setFavoriteOverride(product.id, nextIsFavorite);

      try {
        if (nextIsFavorite) {
          await productsService.favoriteProduct(product.id);
        } else {
          await productsService.unfavoriteProduct(product.id);
        }
      } catch {
        setFavoriteOverride(product.id, previousIsFavorite);
        Alert.alert('Favoritos', 'Não foi possível atualizar os favoritos.');
      } finally {
        setFavoriteProductLoading(product.id, false);
      }
    },
    [
      favoriteLoadingIdSet,
      isAuthenticated,
      resolveIsFavorite,
      setFavoriteOverride,
      setFavoriteProductLoading,
    ],
  );

  function handleRetryProducts() {
    retry();
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
              <S.SectionMessage>
                Não foi possível carregar os conteúdos.
              </S.SectionMessage>
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
