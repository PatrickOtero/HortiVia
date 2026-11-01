import React, { useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  EmptyStateCard,
  PageHeader,
  PrimaryButton,
  SafeScreen,
  ScreenContainer,
  SectionTitle,
  SettingsRow,
  SettingsSection,
  SettingsToggleRow,
  SurfaceCard,
} from '../../components';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import { useTheme } from '../../hooks/useTheme';
import { AppStackParamList, AppTabParamList } from '../../types/navigation';
import { SettingsRowItem } from '../../types/settings';
import * as S from './styles';

type SettingsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Settings'>,
  NativeStackScreenProps<AppStackParamList>
>;

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { theme } = useTheme();
  const { signOut, user } = useAuth();
  const signOutInFlightRef = useRef(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const {
    sections,
    isLoading,
    isError,
    errorMessage,
    updatingPreferenceKey,
    toggleAppearance,
    togglePreference,
    reloadSettings,
  } = useSettings();

  async function handleSignOut() {
    if (signOutInFlightRef.current) {
      return;
    }

    signOutInFlightRef.current = true;
    setIsSigningOut(true);
    setSignOutError(null);

    try {
      await signOut();
    } catch {
      setSignOutError(
        'Não foi possível encerrar a sessão neste aparelho. Você continua conectado; tente novamente.',
      );
    } finally {
      signOutInFlightRef.current = false;
      setIsSigningOut(false);
    }
  }

  function handleRowPress(row: SettingsRowItem) {
    if (row.actionKey === 'editProfile') {
      navigation.navigate('EditProfile');
      return;
    }

    if (row.actionKey === 'adminContent') {
      navigation.navigate('AdminHome');
      return;
    }

    if (row.actionKey === 'library') {
      navigation.navigate('Library');
      return;
    }

    if (row.actionKey === 'appearance') {
      toggleAppearance();
      return;
    }

    if (row.actionKey === 'signOut') {
      handleSignOut().catch(() => undefined);
    }
  }

  function handleRetryLoadSettings() {
    reloadSettings();
  }

  function renderRow(row: SettingsRowItem) {
    if (row.type === 'toggle' && row.preferenceKey) {
      const preferenceKey = row.preferenceKey;

      function handleTogglePreference() {
        togglePreference(preferenceKey);
      }

      return (
        <SettingsToggleRow
          key={row.id}
          label={row.label}
          description={row.description}
          value={Boolean(row.enabled)}
          disabled={updatingPreferenceKey === preferenceKey}
          onValueChange={handleTogglePreference}
        />
      );
    }

    const isPressable =
      row.type === 'navigation' || row.type === 'theme' || row.type === 'action';

    return (
      <SettingsRow
        key={row.id}
        label={row.label}
        description={
          row.actionKey === 'signOut' && isSigningOut
            ? 'Encerrando sessão...'
            : row.description
        }
        valueLabel={row.valueLabel}
        onPress={
          isPressable && !(row.actionKey === 'signOut' && isSigningOut)
            ? () => handleRowPress(row)
            : undefined
        }
        accessory={
          row.actionKey === 'signOut' && isSigningOut ? (
            <ActivityIndicator size="small" color={theme.colors.danger} />
          ) : undefined
        }
        showChevron={row.type === 'navigation'}
        tone={row.tone}
      />
    );
  }

  return (
    <SafeScreen>
      <ScreenContainer scrollable withTabBarSpacing>
        <S.Content>
          <PageHeader
            eyebrow="Ajustes"
            title="Perfil e preferências"
            subtitle="Escolha como quer usar o HortiVia."
          />

          {user ? <SettingsRow label="Meu perfil" description="Identificação e aprendizado" showChevron
            onPress={() => navigation.navigate('UserProfile', { userId: user.id })} /> : null}

          {isLoading ? (
            <SurfaceCard>
              <S.StatusContent>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <SectionTitle
                  title="Carregando preferências"
                  subtitle="Aguarde um instante."
                />
              </S.StatusContent>
            </SurfaceCard>
          ) : null}

          {isError && !isLoading ? (
            <EmptyStateCard
              title="Não foi possível carregar seus ajustes."
              description="Tente novamente em instantes."
            >
              <PrimaryButton onPress={handleRetryLoadSettings}>
                Tentar novamente
              </PrimaryButton>
            </EmptyStateCard>
          ) : null}

          {errorMessage && !isError ? (
            <S.FeedbackText>{errorMessage}</S.FeedbackText>
          ) : null}

          {signOutError ? (
            <S.FeedbackText accessibilityRole="alert">
              {signOutError}
            </S.FeedbackText>
          ) : null}

          {!isLoading && !isError
            ? sections.map(section => (
                <SettingsSection key={section.id} title={section.title}>
                  {section.rows.map(renderRow)}
                </SettingsSection>
              ))
            : null}
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
