import React, { useEffect, useRef, useState } from 'react';
import { Platform, TextInput } from 'react-native';
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
  getPasswordRules,
  normalizeConfirmationCode,
  normalizeEmail,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validatePasswordResetCode,
} from '../../features/auth/validation/auth.validation';
import { getAuthErrorMessage } from '../../services/api/apiError';
import { AuthStackParamList } from '../../types/navigation';
import * as S from './styles';

type ResetPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'ResetPassword'
>;

type FeedbackTone = 'info' | 'success' | 'danger';

export function ResetPasswordScreen({
  navigation,
  route,
}: ResetPasswordScreenProps) {
  const { resendPasswordResetCode, resetPassword } = useAuth();
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const initialEmail = route.params?.email ?? '';
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(
    null,
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(
    route.params?.infoMessage ?? null,
  );
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>(
    route.params?.infoMessage ? 'info' : 'success',
  );
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
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
  const passwordRules = getPasswordRules(password);
  const shouldShowPasswordRules = isPasswordFocused || password.length > 0;
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

  function validateForm() {
    const nextEmailError = validateEmail(email);
    const nextCodeError = validatePasswordResetCode(code);
    const nextPasswordError = !password
      ? 'Informe uma nova senha.'
      : validatePassword(password);
    const nextConfirmPasswordError = validateConfirmPassword(
      password,
      confirmPassword,
    );

    setEmailError(nextEmailError);
    setCodeError(nextCodeError);
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);

    return {
      nextEmailError,
      nextCodeError,
      nextPasswordError,
      nextConfirmPasswordError,
    };
  }

  async function handleResetPassword() {
    const {
      nextEmailError,
      nextCodeError,
      nextPasswordError,
      nextConfirmPasswordError,
    } = validateForm();

    if (
      nextEmailError ||
      nextCodeError ||
      nextPasswordError ||
      nextConfirmPasswordError ||
      isBusy
    ) {
      return;
    }

    setFeedbackMessage(null);
    setIsSubmitting(true);

    try {
      await resetPassword({
        email: normalizedEmail,
        code: normalizedCode,
        password,
      });

      setPassword('');
      setConfirmPassword('');

      navigation.replace('Login', {
        email: normalizedEmail,
        infoMessage: 'Senha redefinida com sucesso.',
      });
    } catch (error) {
      setFeedbackMessage(getAuthErrorMessage(error, 'resetPassword'));
      setFeedbackTone('danger');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    const nextEmailError = validateEmail(email);

    setEmailError(nextEmailError);

    if (nextEmailError || isBusy) {
      return;
    }

    setFeedbackMessage(null);
    setIsResending(true);

    try {
      const response = await resendPasswordResetCode({
        email: normalizedEmail,
      });

      setCode('');
      setCodeError(null);
      setFeedbackMessage(response.message);
      setFeedbackTone('success');
    } catch (error) {
      setFeedbackMessage(getAuthErrorMessage(error, 'resendPasswordResetCode'));
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
                <S.FormTitle>Redefinir senha</S.FormTitle>
                <S.FormSubtitle>
                  {'Digite o c\u00f3digo enviado para:'}
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
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  helperText={emailError ?? undefined}
                  helperTone="danger"
                />
              )}

              <S.CodePreviewRow>
                {Array.from({ length: 6 }, (_, index) => {
                  const digit = normalizedCode[index] ?? '';
                  const isFilled = digit.length > 0;

                  return (
                    <S.CodePreviewCell
                      key={`reset-code-digit-${index}`}
                      $isFilled={isFilled}
                    >
                      <S.CodePreviewDigit>{digit}</S.CodePreviewDigit>
                    </S.CodePreviewCell>
                  );
                })}
              </S.CodePreviewRow>

              <InputField
                label={'C\u00f3digo de 6 d\u00edgitos'}
                value={normalizedCode}
                onChangeText={handleCodeChange}
                editable={!isBusy}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={6}
                placeholder="123456"
                textContentType="oneTimeCode"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                helperText={codeError ?? undefined}
                helperTone="danger"
              />

              <InputField
                ref={passwordInputRef}
                label="Nova senha"
                value={password}
                onChangeText={value => {
                  setPassword(value);
                  setPasswordError(null);
                  setConfirmPasswordError(null);
                  clearDangerFeedback();
                }}
                editable={!isBusy}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password-new"
                secureTextEntry={!isPasswordVisible}
                placeholder="Digite sua nova senha"
                returnKeyType="next"
                blurOnSubmit={false}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                rightAccessory={
                  <S.PasswordToggle
                    onPress={() => setIsPasswordVisible(currentValue => !currentValue)}
                    hitSlop={8}
                  >
                    <S.PasswordToggleText>
                      {isPasswordVisible ? 'Ocultar' : 'Mostrar'}
                    </S.PasswordToggleText>
                  </S.PasswordToggle>
                }
                helperText={passwordError ?? undefined}
                helperTone="danger"
              />

              {shouldShowPasswordRules ? (
                <S.PasswordRulesCard>
                  <S.PasswordRuleRow>
                    <S.PasswordRuleIndicator $isValid={passwordRules.hasValidLength} />
                    <S.PasswordRuleText $isValid={passwordRules.hasValidLength}>
                      10 a 72 caracteres
                    </S.PasswordRuleText>
                  </S.PasswordRuleRow>
                  <S.PasswordRuleRow>
                    <S.PasswordRuleIndicator $isValid={passwordRules.hasUppercase} />
                    <S.PasswordRuleText $isValid={passwordRules.hasUppercase}>
                      {'Letra mai\u00fascula'}
                    </S.PasswordRuleText>
                  </S.PasswordRuleRow>
                  <S.PasswordRuleRow>
                    <S.PasswordRuleIndicator $isValid={passwordRules.hasLowercase} />
                    <S.PasswordRuleText $isValid={passwordRules.hasLowercase}>
                      {'Letra min\u00fascula'}
                    </S.PasswordRuleText>
                  </S.PasswordRuleRow>
                  <S.PasswordRuleRow>
                    <S.PasswordRuleIndicator $isValid={passwordRules.hasNumber} />
                    <S.PasswordRuleText $isValid={passwordRules.hasNumber}>
                      {'N\u00famero'}
                    </S.PasswordRuleText>
                  </S.PasswordRuleRow>
                  <S.PasswordRuleRow>
                    <S.PasswordRuleIndicator
                      $isValid={passwordRules.hasSpecialCharacter}
                    />
                    <S.PasswordRuleText $isValid={passwordRules.hasSpecialCharacter}>
                      Caractere especial
                    </S.PasswordRuleText>
                  </S.PasswordRuleRow>
                </S.PasswordRulesCard>
              ) : null}

              <InputField
                ref={confirmPasswordInputRef}
                label="Confirmar nova senha"
                value={confirmPassword}
                onChangeText={value => {
                  setConfirmPassword(value);
                  setConfirmPasswordError(null);
                  clearDangerFeedback();
                }}
                editable={!isBusy}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!isConfirmPasswordVisible}
                placeholder="Repita sua nova senha"
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
                rightAccessory={
                  <S.PasswordToggle
                    onPress={() =>
                      setIsConfirmPasswordVisible(currentValue => !currentValue)
                    }
                    hitSlop={8}
                  >
                    <S.PasswordToggleText>
                      {isConfirmPasswordVisible ? 'Ocultar' : 'Mostrar'}
                    </S.PasswordToggleText>
                  </S.PasswordToggle>
                }
                helperText={confirmPasswordError ?? undefined}
                helperTone="danger"
              />

              <S.ActionGroup>
                {feedbackMessage ? (
                  <S.FeedbackText $tone={feedbackTone}>
                    {feedbackMessage}
                  </S.FeedbackText>
                ) : null}
                <PrimaryButton
                  onPress={handleResetPassword}
                  disabled={isBusy}
                  loading={isSubmitting}
                >
                  Redefinir senha
                </PrimaryButton>
                <SecondaryButton
                  onPress={handleResendCode}
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
