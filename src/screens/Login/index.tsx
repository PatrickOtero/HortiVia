import React, { useEffect, useRef, useState } from 'react';
import { Platform, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BrandLockup,
  InputField,
  PrimaryButton,
  SafeScreen,
} from '../../components';
import { useAuth } from '../../features/auth/hooks/useAuth';
import {
  normalizeEmail,
  validateEmail,
} from '../../features/auth/validation/auth.validation';
import {
  getAuthErrorMessage,
  isUnverifiedEmailError,
} from '../../services/api/apiError';
import { AuthStackParamList } from '../../types/navigation';
import * as S from './styles';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
type FieldName = 'email' | 'password';

export function LoginScreen({ navigation, route }: LoginScreenProps) {
  const { signIn } = useAuth();
  const passwordInputRef = useRef<TextInput>(null);
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [password, setPassword] = useState('');
  const [infoMessage, setInfoMessage] = useState(route.params?.infoMessage ?? null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResendConfirmationAction, setShowResendConfirmationAction] =
    useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<FieldName, boolean>>({
    email: false,
    password: false,
  });

  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }

    if (route.params?.infoMessage) {
      setInfoMessage(route.params.infoMessage);
    }
  }, [route.params?.email, route.params?.infoMessage]);

  function markFieldAsTouched(fieldName: FieldName) {
    setTouchedFields(currentValue => ({
      ...currentValue,
      [fieldName]: true,
    }));
  }

  function clearFeedback() {
    if (errorMessage) {
      setErrorMessage(null);
    }

    if (infoMessage) {
      setInfoMessage(null);
    }

    if (showResendConfirmationAction) {
      setShowResendConfirmationAction(false);
    }
  }

  function getFieldError(fieldName: FieldName) {
    if (!hasSubmitted && !touchedFields[fieldName]) {
      return undefined;
    }

    if (fieldName === 'email') {
      return validateEmail(email) ?? undefined;
    }

    if (!password) {
      return 'Digite sua senha.';
    }

    return undefined;
  }

  async function handleSignIn() {
    setHasSubmitted(true);

    const emailError = validateEmail(email);
    const passwordError = !password ? 'Digite sua senha.' : null;

    if (emailError || passwordError || isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setInfoMessage(null);
    setShowResendConfirmationAction(false);
    setIsSubmitting(true);

    try {
      await signIn({
        email: normalizeEmail(email),
        password,
      });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, 'signIn'));
      setShowResendConfirmationAction(isUnverifiedEmailError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleResendConfirmationPress() {
    navigation.navigate('VerifyEmail', {
      email: normalizeEmail(email),
      infoMessage: 'Digite o código enviado para o seu e-mail.',
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
                <S.FormTitle>Entrar</S.FormTitle>
                <S.FormSubtitle>Acesse sua conta para continuar.</S.FormSubtitle>
              </S.FormHeader>
              <InputField
                label="E-mail"
                value={email}
                onChangeText={value => {
                  setEmail(value);
                  clearFeedback();
                }}
                editable={!isSubmitting}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                placeholder="seuemail@exemplo.com"
                returnKeyType="next"
                blurOnSubmit={false}
                onBlur={() => markFieldAsTouched('email')}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                helperText={getFieldError('email')}
                helperTone="danger"
              />
              <InputField
                label="Senha"
                ref={passwordInputRef}
                value={password}
                onChangeText={value => {
                  setPassword(value);
                  clearFeedback();
                }}
                editable={!isSubmitting}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                secureTextEntry={!isPasswordVisible}
                placeholder="Digite sua senha"
                returnKeyType="done"
                onBlur={() => markFieldAsTouched('password')}
                onSubmitEditing={handleSignIn}
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
                helperText={getFieldError('password')}
                helperTone="danger"
              />
              <S.ActionGroup>
                {infoMessage ? <S.InfoText>{infoMessage}</S.InfoText> : null}
                {errorMessage ? <S.FormErrorText>{errorMessage}</S.FormErrorText> : null}
                {showResendConfirmationAction ? (
                  <S.InlineActionButton
                    onPress={handleResendConfirmationPress}
                    disabled={isSubmitting}
                    hitSlop={8}
                  >
                    <S.InlineActionText>Confirmar e-mail</S.InlineActionText>
                  </S.InlineActionButton>
                ) : null}
                <PrimaryButton
                  onPress={handleSignIn}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  Entrar
                </PrimaryButton>
                <S.SecondaryActionRow>
                  <S.SecondaryActionLabel>Novo por aqui?</S.SecondaryActionLabel>
                  <S.SecondaryActionButton
                    onPress={() => navigation.navigate('Register')}
                    hitSlop={8}
                    disabled={isSubmitting}
                  >
                    <S.SecondaryActionText>Criar conta</S.SecondaryActionText>
                  </S.SecondaryActionButton>
                </S.SecondaryActionRow>
              </S.ActionGroup>
            </S.FormCard>
          </S.Content>
        </S.ScrollContent>
      </S.KeyboardFrame>
    </SafeScreen>
  );
}
