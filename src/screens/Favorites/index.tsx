import React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  EmptyStateCard,
  PageHeader,
  PrimaryButton,
  ProductCard,
  SafeScreen,
  SectionTitle,
  SurfaceCard,
} from '../../components';
import { useFavoriteProducts } from '../../features/products/hooks/useFavoriteProducts';
import { useTheme } from '../../hooks/useTheme';
import { AppStackParamList, AppTabParamList } from '../../types/navigation';
import * as S from './styles';

type FavoritesScreenProps = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Favorites'>,
  NativeStackScreenProps<AppStackParamList>
>;

function ListItemSeparator() {
  return <S.ListSpacer />;
}

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const { theme } = useTheme();
  const {
    products,
    meta,
    isLoading,
    isRefreshing,
    isError,
    isEmpty,
    retry,
    refresh,
    removeProduct,
  } = useFavoriteProducts();

  function handleOpenProduct(productId: string) {
    navigation.navigate('ProductDetail', { productId });
  }

  function handleRetry() {
    retry();
  }

  function handleExploreProducts() {
    navigation.navigate('Home');
  }

  function handleFavoriteChange(productId: string, isFavorite: boolean) {
    if (!isFavorite) {
      removeProduct(productId);
    }
  }

  function renderListEmptyState() {
    if (isLoading) {
      return (
        <SurfaceCard>
          <S.StatusContent>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <SectionTitle
              title="Carregando favoritos"
              subtitle="Aguarde um instante."
            />
          </S.StatusContent>
        </SurfaceCard>
      );
    }

    if (isError) {
      return (
        <EmptyStateCard
          title="Não foi possível carregar seus favoritos."
          description="Tente novamente em instantes."
        >
          <PrimaryButton onPress={handleRetry}>Tentar novamente</PrimaryButton>
        </EmptyStateCard>
      );
    }

    if (isEmpty) {
      return (
        <EmptyStateCard
          title="Nenhum produto favorito ainda."
          description="Salve produtos para encontrá-los mais rápido depois."
        >
          <PrimaryButton onPress={handleExploreProducts}>
            Explorar produtos
          </PrimaryButton>
        </EmptyStateCard>
      );
    }

    return null;
  }

  const totalFavorites = meta.total;
  const favoritesSubtitle =
    isLoading && products.length === 0
      ? 'Preparando seus produtos salvos.'
      : totalFavorites === 1
        ? '1 produto salvo.'
        : `${totalFavorites} produtos salvos.`;

  return (
    <SafeScreen>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleOpenProduct(item.id)}
            onFavoriteChange={handleFavoriteChange}
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
            <PageHeader
              eyebrow="Favoritos"
              title="Produtos salvos"
              subtitle="Guarde alimentos que você quer consultar de novo sem precisar buscar outra vez."
            />
            <S.SectionBlock>
              <SectionTitle title="Sua lista" subtitle={favoritesSubtitle} />
            </S.SectionBlock>
          </S.HeaderContent>
        }
        ListEmptyComponent={renderListEmptyState()}
      />
    </SafeScreen>
  );
}
