import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BackButton,
  EmptyStateCard,
  PrimaryButton,
  ProfileAvatarEditor,
  ProfileForm,
  SecondaryButton,
  SafeScreen,
  ScreenContainer,
  SectionTitle,
  SurfaceCard,
} from '../../components';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useTheme } from '../../hooks/useTheme';
import { AppStackParamList } from '../../types/navigation';
import * as S from './styles';

type EditProfileScreenProps = NativeStackScreenProps<AppStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: EditProfileScreenProps) {
  const { theme } = useTheme();
  const {
    profile,
    formValues,
    formErrors,
    reloadProfile,
    saveProfile,
    uploadAvatar,
    successMessage,
    errorMessage,
    avatarSuccessMessage,
    avatarErrorMessage,
    isLoading,
    isSaving,
    isUploadingAvatar,
    updateField,
  } = useUserProfile();

  function handleCancel() {
    navigation.goBack();
  }

  function handleRetryLoadProfile() {
    reloadProfile();
  }

  function handleSaveProfile() {
    saveProfile();
  }

  async function handleUploadAvatar() {
    try {
      await uploadAvatar();
    } catch {
      // The hook already maps avatar failures to safe UI feedback.
    }
  }

  return (
    <SafeScreen edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={S.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScreenContainer scrollable keyboardShouldPersistTaps="handled">
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={() => navigation.goBack()} />
              <S.HeaderCopy>
                <S.HeaderTitle>Editar perfil</S.HeaderTitle>
                <S.HeaderSubtitle>Atualize seus dados principais.</S.HeaderSubtitle>
              </S.HeaderCopy>
            </S.HeaderRow>

            {isLoading ? (
              <SurfaceCard>
                <S.StatusContent>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <SectionTitle
                    title="Carregando perfil"
                    subtitle="Aguarde um instante."
                  />
                </S.StatusContent>
              </SurfaceCard>
            ) : !profile ? (
              <EmptyStateCard
                title="Nao foi possivel carregar seu perfil."
                description="Tente novamente."
              >
                <S.UnavailableActions>
                  <PrimaryButton onPress={handleRetryLoadProfile}>Tentar novamente</PrimaryButton>
                  <SecondaryButton onPress={handleCancel}>Voltar</SecondaryButton>
                </S.UnavailableActions>
              </EmptyStateCard>
            ) : (
              <>
                <SurfaceCard>
                  <ProfileAvatarEditor
                    label={formValues.name || profile.name}
                    imageUrl={profile.avatarUrl}
                    onEditPress={handleUploadAvatar}
                    isUploading={isUploadingAvatar}
                    successMessage={avatarSuccessMessage}
                    errorMessage={avatarErrorMessage}
                  />
                </SurfaceCard>

                <SurfaceCard>
                  <ProfileForm
                    values={formValues}
                    errors={formErrors}
                    successMessage={successMessage}
                    errorMessage={errorMessage}
                    isSubmitting={isSaving}
                    onChangeField={updateField}
                    onSubmit={handleSaveProfile}
                    onCancel={handleCancel}
                  />
                </SurfaceCard>
              </>
            )}
          </S.Content>
        </ScreenContainer>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
