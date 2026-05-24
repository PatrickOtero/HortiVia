import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BrandLockup,
  InputField,
  PrimaryButton,
  SafeScreen,
  SecondaryButton,
  TextButton,
} from '../../components';
import { useAuth } from '../../features/auth/hooks/useAuth';
import {
  normalizeConfirmationCode,
  normalizeEmail,
  validateConfirmationCode,
  validateEmail,
} from '../../features/auth/validation/auth.validation';
import { getAuthErrorMessage } from '../../services/api/apiError';
import { AuthStackParamList } from '../../types/navigation';
import * as S from './styles';

type VerifyEmailScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'VerifyEmail'
>;

type FeedbackTone = 'info' | 'success' | 'danger';

export function VerifyEmailScreen({
  navigation,
  route,
}: VerifyEmailScreenProps) {
  const { confirmEmail, resendConfirmation } = useAuth();
  const initialEmail = route.params?.email ?? '';
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(
    route.params?.infoMessage ?? null,
  );
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>(
    route.params?.infoMessage ? 'info' : 'success',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }

    if (route.params?.infoMessage) {
      setFeedbackMessage(route.params.infoMessage);
      setFeedbackTone('info');
    }
  }, [route.params?.email, route.params?.infoMessage]);

  const hasEmail = email.trim().length > 0;
  const normalizedEmail = normalizeEmail(email);
  const normalizedCode = normalizeConfirmationCode(code);
  const isBusy = isSubmitting || isResending;

  function clearDangerFeedback() {
    if (feedbackTone === 'danger' && feedbackMessage) {
      setFeedbackMessage(null);
    }
  }

  function handleCodeChange(value: string) {
    setCode(normalizeConfirmationCode(value));
    setCodeError(null);
    clearDangerFeedback();
  }

  async function handleConfirmEmail() {
    const nextEmailError = validateEmail(email);
    const nextCodeError = validateConfirmationCode(code);

    setEmailError(nextEmailError);
    setCodeError(nextCodeError);

    if (nextEmailError || nextCodeError || isBusy) {
      return;
    }

    setFeedbackMessage(null);
    setIsSubmitting(true);

    try {
      await confirmEmail({
        email: normalizedEmail,
        code: normalizedCode,
      });

      navigation.replace('Login', {
        email: normalizedEmail,
        infoMessage:
          'E-mail confirmado com sucesso. Agora entre com seu e-mail e senha.',
      });
    } catch (error) {
      setFeedbackMessage(getAuthErrorMessage(error, 'confirmEmail'));
      setFeedbackTone('danger');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendConfirmation() {
    const nextEmailError = validateEmail(email);

    setEmailError(nextEmailError);

    if (nextEmailError || isBusy) {
      return;
    }

    setCodeError(null);
    setFeedbackMessage(null);
    setIsResending(true);

    try {
      const response = await resendConfirmation({
        email: normalizedEmail,
      });

      setCode('');
      setFeedbackMessage(response.message);
      setFeedbackTone('success');
    } catch (error) {
      setFeedbackMessage(getAuthErrorMessage(error, 'resendConfirmation'));
      setFeedbackTone('danger');
    } finally {
      setIsResending(false);
    }
  }

  function handleBackToLogin() {
    navigation.navigate('Login', {
      email: hasEmail ? normalizedEmail : undefined,
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
                <S.FormTitle>Confirme seu e-mail</S.FormTitle>
                <S.FormSubtitle>
                  {'Enviamos um c\u00f3digo de confirma\u00e7\u00e3o para:'}
                </S.FormSubtitle>
              </S.FormHeader>

              {hasEmail ? (
                <S.EmailHighlight>
                  <S.EmailValue>{normalizedEmail}</S.EmailValue>
                </S.EmailHighlight>
              ) : (
                <InputField
                  label="E-mail"
                  value={email}
                  onChangeText={value => {
                    setEmail(value);
                    setEmailError(null);
                    clearDangerFeedback();
                  }}
                  editable={!isBusy}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="seuemail@exemplo.com"
                  helperText={emailError ?? undefined}
                  helperTone="danger"
                />
              )}

              <S.FormSubtitle>
                {'Digite o c\u00f3digo de 6 d\u00edgitos para ativar sua conta.'}
              </S.FormSubtitle>

              <S.CodePreviewRow>
                {Array.from({ length: 6 }, (_, index) => {
                  const digit = normalizedCode[index] ?? '';
                  const isFilled = digit.length > 0;

                  return (
                    <S.CodePreviewCell key={`code-digit-${index}`} $isFilled={isFilled}>
                      <S.CodePreviewDigit>{digit}</S.CodePreviewDigit>
                    </S.CodePreviewCell>
                  );
                })}
              </S.CodePreviewRow>

              <InputField
                label={'C\u00f3digo de confirma\u00e7\u00e3o'}
                value={normalizedCode}
                onChangeText={handleCodeChange}
                editable={!isBusy}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={6}
                placeholder="123456"
                textContentType="oneTimeCode"
                helperText={codeError ?? undefined}
                helperTone="danger"
              />

              <S.ActionGroup>
                {feedbackMessage ? (
                  <S.FeedbackText $tone={feedbackTone}>
                    {feedbackMessage}
                  </S.FeedbackText>
                ) : null}
                <PrimaryButton
                  onPress={handleConfirmEmail}
                  disabled={isBusy}
                  loading={isSubmitting}
                >
                  Confirmar e-mail
                </PrimaryButton>
                <SecondaryButton
                  onPress={handleResendConfirmation}
                  disabled={isBusy}
                  loading={isResending}
                >
                  {'Reenviar c\u00f3digo'}
                </SecondaryButton>
                <TextButton onPress={handleBackToLogin} disabled={isBusy}>
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
