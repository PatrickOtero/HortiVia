import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BackButton,
  EmptyStateCard,
  PageHeader,
  PrimaryButton,
  SafeScreen,
  SectionTitle,
  SurfaceCard,
} from '../../../../components';
import { toApiError } from '../../../../services/api/apiError';
import { AppStackParamList } from '../../../../types/navigation';
import { useTheme } from '../../../../hooks/useTheme';
import { productsService } from '../../../products/services/products.service';
import type { ProductListItem } from '../../../products/types/product';
import { getProductCategoryLabel } from '../../../products/mappers/product.mapper';
import { useAuth } from '../../../auth/hooks/useAuth';
import { AdminAccessDenied } from '../../components/AdminAccessDenied';
import { AdminListItem } from '../../components/AdminListItem';
import {
  ADMIN_REMOVE_ERROR_MESSAGE,
  ADMIN_RETRY_MESSAGE,
  isAdminAccessDeniedError,
} from '../../utils/adminFeedback';
import { goBackFromAdmin } from '../../utils/adminNavigation';
import * as S from './styles';

type AdminProductsScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'AdminProducts'
>;

function ListItemSeparator() {
  return <S.ListSpacer />;
}

export function AdminProductsScreen({ navigation }: AdminProductsScreenProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hasAccessDeniedError, setHasAccessDeniedError] = useState(false);

  const loadProducts = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await productsService.getProducts({
        page: 1,
        limit: 20,
      });

      setProducts(response.data);
      setErrorMessage('');
      setHasAccessDeniedError(false);
    } catch (error) {
      if (isAdminAccessDeniedError(error)) {
        setHasAccessDeniedError(true);
        setErrorMessage('');
        return;
      }

      toApiError(error);
      setErrorMessage('Não foi possível carregar os produtos.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts]),
  );

  if (user?.role !== 'ADMIN' || hasAccessDeniedError) {
    return <AdminAccessDenied onGoBack={() => goBackFromAdmin(navigation)} />;
  }

  function handleCreateProduct() {
    navigation.navigate('AdminProductForm', {});
  }

  function handleEditProduct(productId: string) {
    navigation.navigate('AdminProductForm', { productId });
  }

  function handleOpenVisualContent(productId: string) {
    navigation.navigate('AdminProductVisualContent', { productId });
  }

  function handleDeleteProduct(productId: string) {
    Alert.alert(
      'Remover produto?',
      'Ele deixará de aparecer no app.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(productId);

            try {
              await productsService.deleteProduct(productId);
              setFeedbackMessage('Produto removido.');
              setErrorMessage('');
              await loadProducts(true);
            } catch (error) {
              if (isAdminAccessDeniedError(error)) {
                setHasAccessDeniedError(true);
                return;
              }

              setErrorMessage(ADMIN_REMOVE_ERROR_MESSAGE);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  }

  function handleRetry() {
    loadProducts();
  }

  function renderEmptyState() {
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

    if (errorMessage) {
      return (
        <EmptyStateCard
          title="Não foi possível carregar os produtos."
          description={ADMIN_RETRY_MESSAGE}
        >
          <PrimaryButton onPress={handleRetry}>Tentar novamente</PrimaryButton>
        </EmptyStateCard>
      );
    }

    return (
      <EmptyStateCard
        title="Nenhum produto cadastrado."
        description="Crie o primeiro produto para começar."
      >
        <PrimaryButton onPress={handleCreateProduct}>Novo produto</PrimaryButton>
      </EmptyStateCard>
    );
  }

  return (
    <SafeScreen>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        refreshing={isRefreshing}
        onRefresh={() => loadProducts(true)}
        ItemSeparatorComponent={ListItemSeparator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.layout.screenPadding,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.xl,
        }}
        ListHeaderComponent={
          <S.HeaderContent>
            <S.HeaderRow>
              <BackButton onPress={() => goBackFromAdmin(navigation)} />
              <S.HeaderCopy>
                <S.HeaderTitle>Produtos</S.HeaderTitle>
                <S.HeaderSubtitle>Atualize os produtos exibidos no app.</S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>

            <SurfaceCard>
              <S.PanelContent>
                <PageHeader
                  eyebrow="Área interna"
                  title="Produtos do app"
                  subtitle="Crie, edite ou remova itens do catálogo."
                />
                <PrimaryButton onPress={handleCreateProduct}>Novo produto</PrimaryButton>
                {feedbackMessage ? <S.SuccessText>{feedbackMessage}</S.SuccessText> : null}
                {errorMessage && products.length > 0 ? (
                  <S.ErrorText>{errorMessage}</S.ErrorText>
                ) : null}
              </S.PanelContent>
            </SurfaceCard>
          </S.HeaderContent>
        }
        renderItem={({ item }) => (
          <AdminListItem
            title={item.name}
            meta={getProductCategoryLabel(item.category)}
            subtitle={item.shortDescription}
            imageUrl={item.imageUrl}
            imageFallbackLabel="Produto"
            extraActionLabel="Conteúdo visual"
            onExtraAction={() => handleOpenVisualContent(item.id)}
            onEdit={() => handleEditProduct(item.id)}
            onDelete={() => handleDeleteProduct(item.id)}
            isDeleting={deletingId === item.id}
          />
        )}
        ListEmptyComponent={renderEmptyState()}
      />
    </SafeScreen>
  );
}
