import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BackButton,
  PageHeader,
  SafeScreen,
  ScreenContainer,
  SurfaceCard,
} from '../../../../components';
import { useAuth } from '../../../auth/hooks/useAuth';
import { AdminAccessDenied } from '../../components/AdminAccessDenied';
import { AdminMenuCard } from '../../components/AdminMenuCard';
import { AppStackParamList } from '../../../../types/navigation';
import { goBackFromAdmin } from '../../utils/adminNavigation';
import * as S from './styles';

type AdminHomeScreenProps = NativeStackScreenProps<AppStackParamList, 'AdminHome'>;

export function AdminHomeScreen({ navigation }: AdminHomeScreenProps) {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <AdminAccessDenied onGoBack={() => goBackFromAdmin(navigation)} />;
  }

  return (
    <SafeScreen>
      <ScreenContainer scrollable>
        <S.Content>
          <S.HeaderRow>
            <BackButton onPress={() => goBackFromAdmin(navigation)} />
            <S.HeaderCopy>
              <S.HeaderTitle>Conteúdo</S.HeaderTitle>
              <S.HeaderSubtitle>Produtos e artigos exibidos no app.</S.HeaderSubtitle>
            </S.HeaderCopy>
          </S.HeaderRow>

          <SurfaceCard>
            <S.CardStack>
              <PageHeader
                eyebrow="Área interna"
                title="Escolha o que editar"
                subtitle="Atualize os conteúdos mostrados para os usuários."
              />
              <AdminMenuCard
                title="Produtos"
                description="Atualize os produtos mostrados no app."
                onPress={() => navigation.navigate('AdminProducts')}
              />
              <AdminMenuCard
                title="Artigos"
                description="Atualize as leituras mostradas no feed."
                onPress={() => navigation.navigate('AdminArticles')}
              />
            </S.CardStack>
          </SurfaceCard>
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
