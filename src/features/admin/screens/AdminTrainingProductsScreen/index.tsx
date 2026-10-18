import React, { useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BackButton,
  PageHeader,
  PrimaryButton,
  SafeScreen,
  ScreenContainer,
  SectionTitle,
} from '../../../../components';
import type { AppStackParamList } from '../../../../types/navigation';
import { useAuth } from '../../../auth/hooks/useAuth';
import { productsService } from '../../../products/services/products.service';
import { useTrainingResource } from '../../../training/hooks/useTrainingResource';
import { AdminAccessDenied } from '../../components/AdminAccessDenied';
import { AdminMenuCard } from '../../components/AdminMenuCard';
import * as S from './styles';

type Props = NativeStackScreenProps<AppStackParamList, 'AdminTrainingProducts'>;

export function AdminTrainingProductsScreen(props: Props) {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN')
    return <AdminAccessDenied onGoBack={() => props.navigation.goBack()} />;
  return <ProductPicker {...props} />;
}

function ProductPicker({ navigation }: Props) {
  const load = useCallback(async () => {
    const first = await productsService.getProducts({ page: 1, limit: 50 });
    const products = [...first.data];
    for (let page = 2; page <= first.meta.totalPages; page += 1) {
      products.push(
        ...(await productsService.getProducts({ page, limit: 50 })).data,
      );
    }
    return products;
  }, []);
  const { data, error, isLoading, refresh } = useTrainingResource(load);
  return (
    <SafeScreen>
      <ScreenContainer scrollable>
        <S.Content>
          <BackButton onPress={() => navigation.goBack()} />
          <PageHeader
            title="Treinamentos"
            subtitle="Escolha o produto para administrar suas perguntas."
          />
          {isLoading ? (
            <ActivityIndicator accessibilityLabel="Carregando produtos" />
          ) : null}
          {error ? (
            <>
              <SectionTitle title="Não foi possível carregar os produtos." />
              <PrimaryButton onPress={refresh}>Tentar novamente</PrimaryButton>
            </>
          ) : null}
          {!isLoading && data?.length === 0 ? (
            <SectionTitle title="Nenhum produto disponível." />
          ) : null}
          {data?.map(product => (
            <AdminMenuCard
              key={product.id}
              title={product.name}
              description="Ver e editar perguntas"
              onPress={() =>
                navigation.navigate('AdminTrainingQuestions', {
                  productId: product.id,
                })
              }
            />
          ))}
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
