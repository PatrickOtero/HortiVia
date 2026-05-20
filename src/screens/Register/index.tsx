import React, { useRef, useState } from 'react';
import { Platform, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BrandLockup,
  InputField,
  PrimaryButton,
  SafeScreen,
} from '../../components';
import { APP_NAME } from '../../config/brand';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getAuthErrorMessage } from '../../services/api/apiError';
import { AuthStackParamList } from '../../types/navigation';
import * as S from './styles';

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

type FieldName = 'name' | 'email' | 'password' | 'confirmPassword';

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { signUp } = useAuth();
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<FieldName, boolean>>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const isEmailValid = /\S+@\S+\.\S+/.test(email.trim());
  const isFormFilled =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0;

  function markFieldAsTouched(fieldName: FieldName) {
    setTouchedFields(currentValue => ({
      ...currentValue,
      [fieldName]: true,
    }));
  }

  function clearErrorMessage() {
    if (errorMessage) {
      setErrorMessage(null);
    }
  }

  function getFieldError(fieldName: FieldName) {
    if (!hasSubmitted && !touchedFields[fieldName]) {
      return undefined;
    }

    if (fieldName === 'name' && name.trim().length === 0) {
      return 'Informe seu nome.';
    }

    if (fieldName === 'email') {
      if (email.trim().length === 0) {
        return 'Informe seu e-mail.';
      }

      if (!isEmailValid) {
        return 'Informe um e-mail valido.';
      }
    }

    if (fieldName === 'password' && password.trim().length === 0) {
      return 'Digite uma senha.';
    }

    if (fieldName === 'confirmPassword') {
      if (confirmPassword.trim().length === 0) {
        return 'Repita sua senha.';
      }

      if (password !== confirmPassword) {
        return 'As senhas precisam ser iguais.';
      }
    }

    return undefined;
  }

  async function handleCreateAccount() {
    setHasSubmitted(true);

    if (
      !isFormFilled ||
      !isEmailValid ||
      password !== confirmPassword ||
      isSubmitting
    ) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
      });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, 'signUp'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleConfirmPasswordSubmit() {
    handleCreateAccount();
  }

  function handlePrimaryActionPress() {
    handleCreateAccount();
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
                <S.FormTitle>Criar conta</S.FormTitle>
                <S.FormSubtitle>
                  Cadastre-se para salvar suas preferencias e acessar o {APP_NAME}.
                </S.FormSubtitle>
              </S.FormHeader>

              <InputField
                label="Nome"
                value={name}
                onChangeText={value => {
                  setName(value);
                  clearErrorMessage();
                }}
                editable={!isSubmitting}
                placeholder="Seu nome"
                returnKeyType="next"
                blurOnSubmit={false}
                onBlur={() => markFieldAsTouched('name')}
                onSubmitEditing={() => emailInputRef.current?.focus()}
                helperText={getFieldError('name')}
              />

              <InputField
                ref={emailInputRef}
                label="E-mail"
                value={email}
                onChangeText={value => {
                  setEmail(value);
                  clearErrorMessage();
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
              />

              <InputField
                ref={passwordInputRef}
                label="Senha"
                value={password}
                onChangeText={value => {
                  setPassword(value);
                  clearErrorMessage();
                }}
                editable={!isSubmitting}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                secureTextEntry={!isPasswordVisible}
                placeholder="Digite sua senha"
                returnKeyType="next"
                blurOnSubmit={false}
                onBlur={() => markFieldAsTouched('password')}
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
                helperText={getFieldError('password')}
              />

              <InputField
                ref={confirmPasswordInputRef}
                label="Confirmar senha"
                value={confirmPassword}
                onChangeText={value => {
                  setConfirmPassword(value);
                  clearErrorMessage();
                }}
                editable={!isSubmitting}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!isConfirmPasswordVisible}
                placeholder="Repita sua senha"
                returnKeyType="done"
                onBlur={() => markFieldAsTouched('confirmPassword')}
                onSubmitEditing={handleConfirmPasswordSubmit}
                rightAccessory={
                  <S.PasswordToggle
                    onPress={() => setIsConfirmPasswordVisible(currentValue => !currentValue)}
                    hitSlop={8}
                  >
                    <S.PasswordToggleText>
                      {isConfirmPasswordVisible ? 'Ocultar' : 'Mostrar'}
                    </S.PasswordToggleText>
                  </S.PasswordToggle>
                }
                helperText={getFieldError('confirmPassword')}
              />

              <S.ActionGroup>
                {errorMessage ? <S.FormErrorText>{errorMessage}</S.FormErrorText> : null}
                <PrimaryButton
                  onPress={handlePrimaryActionPress}
                  disabled={!isFormFilled}
                  loading={isSubmitting}
                >
                  Criar conta
                </PrimaryButton>
                <S.SecondaryActionButton
                  onPress={() => navigation.navigate('Login')}
                  hitSlop={8}
                  disabled={isSubmitting}
                >
                  <S.SecondaryActionText>Ja tenho uma conta</S.SecondaryActionText>
                </S.SecondaryActionButton>
              </S.ActionGroup>
            </S.FormCard>
          </S.Content>
        </S.ScrollContent>
      </S.KeyboardFrame>
    </SafeScreen>
  );
}
