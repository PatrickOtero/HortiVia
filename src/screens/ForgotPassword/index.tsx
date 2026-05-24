import React, { useState } from 'react';
import { Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BrandLockup,
  InputField,
  PrimaryButton,
  SafeScreen,
  TextButton,
} from '../../components';
import { useAuth } from '../../features/auth/hooks/useAuth';
import {
  normalizeEmail,
  validateEmail,
} from '../../features/auth/validation/auth.validation';
import { getAuthErrorMessage } from '../../services/api/apiError';
import { AuthStackParamList } from '../../types/navigation';
import * as S from './styles';

type ForgotPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'ForgotPassword'
>;

type FeedbackTone = 'info' | 'danger';

export function ForgotPasswordScreen({
  navigation,
  route,
}: ForgotPasswordScreenProps) {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRequestCode() {
    const nextEmailError = validateEmail(email);

    setEmailError(nextEmailError);

    if (nextEmailError || isSubmitting) {
      return;
    }

    setFeedbackMessage(null);
    setIsSubmitting(true);

    try {
      const normalizedEmail = normalizeEmail(email);
      const response = await requestPasswordReset({
        email: normalizedEmail,
      });

      navigation.navigate('ResetPassword', {
        email: normalizedEmail,
        infoMessage: response.message,
      });
    } catch (error) {
      setFeedbackMessage(getAuthErrorMessage(error, 'requestPasswordReset'));
      setFeedbackTone('danger');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackToLogin() {
    navigation.navigate('Login', {
      email: email.trim().length > 0 ? normalizeEmail(email) : undefined,
    });
  }

  return (
    <SafeScreen edges={['top', 'right', 'bottom', 'left']}>
      <S.KeyboardFrame behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <S.ScrollContent keyboardShouldPersistTaps="handled">
          <S.Content>
            <S.BrandPanel>
              <BrandLockup />
            </S.BrandPanel>

            <S.FormCard>
              <S.FormHeader>
                <S.FormTitle>Recuperar senha</S.FormTitle>
                <S.FormSubtitle>
                  {'Informe seu e-mail para receber um c\u00f3digo de redefini\u00e7\u00e3o.'}
                </S.FormSubtitle>
              </S.FormHeader>

              <InputField
                label="E-mail"
                value={email}
                onChangeText={value => {
                  setEmail(value);
                  setEmailError(null);
                  if (feedbackTone === 'danger') {
                    setFeedbackMessage(null);
                  }
                }}
                editable={!isSubmitting}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                placeholder="seuemail@exemplo.com"
                returnKeyType="done"
                onSubmitEditing={handleRequestCode}
                helperText={emailError ?? undefined}
                helperTone="danger"
              />

              <S.ActionGroup>
                {feedbackMessage ? (
                  <S.FeedbackText $tone={feedbackTone}>
                    {feedbackMessage}
                  </S.FeedbackText>
                ) : null}
                <PrimaryButton
                  onPress={handleRequestCode}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  {'Enviar c\u00f3digo'}
                </PrimaryButton>
                <TextButton onPress={handleBackToLogin} disabled={isSubmitting}>
                  Voltar para entrar
                </TextButton>
              </S.ActionGroup>
            </S.FormCard>
          </S.Content>
        </S.ScrollContent>
      </S.KeyboardFrame>
    </SafeScreen>
  );
}
