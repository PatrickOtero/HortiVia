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
              <S.HeaderTitle>Gerenciar conteúdo</S.HeaderTitle>
              <S.HeaderSubtitle>Produtos e artigos do HortiVia.</S.HeaderSubtitle>
            </S.HeaderCopy>
          </S.HeaderRow>

          <SurfaceCard>
            <S.CardStack>
              <PageHeader
                eyebrow="Administração"
                title="Escolha o que deseja editar"
                subtitle="Acesse os cadastros principais do app."
              />
              <AdminMenuCard
                title="Produtos"
                description="Crie, atualize e remova produtos exibidos para os usuários."
                onPress={() => navigation.navigate('AdminProducts')}
              />
              <AdminMenuCard
                title="Artigos"
                description="Gerencie os conteúdos exibidos no feed do HortiVia."
                onPress={() => navigation.navigate('AdminArticles')}
              />
            </S.CardStack>
          </SurfaceCard>
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
