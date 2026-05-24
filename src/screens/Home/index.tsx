import React, { useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
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
} from '../../components';
import { APP_NAME } from '../../config/brand';
import { useProducts } from '../../features/products/hooks/useProducts';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategoryFilter>('ALL');
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

  function handleOpenProduct(productId: string) {
    navigation.navigate('ProductDetail', { productId });
  }

  function handleRetry() {
    retry();
  }

  function renderListEmptyState() {
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
          <PrimaryButton onPress={handleRetry}>Tentar novamente</PrimaryButton>
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

  const totalProducts = meta.total;
  const productsSubtitle = isLoading && products.length === 0
    ? 'Preparando a lista para você.'
    : totalProducts === 1
      ? '1 item encontrado.'
      : `${totalProducts} itens encontrados.`;

  return (
    <SafeScreen edges={['top', 'left', 'right']}>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => handleOpenProduct(item.id)} />
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
                title="Explore frutas, verduras e legumes"
                subtitle="Encontre orientações rápidas para escolher, conservar e aproveitar melhor."
                rightSlot={<Avatar label={APP_NAME} />}
              />
            </S.HeaderRow>

            <SearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por nome do alimento"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />

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
              <SectionTitle title="Produtos" subtitle={productsSubtitle} />
            </S.SectionBlock>
          </S.HeaderContent>
        }
        ListEmptyComponent={renderListEmptyState()}
      />
    </SafeScreen>
  );
}
