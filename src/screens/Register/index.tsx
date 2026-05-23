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
import {
  getPasswordRules,
  normalizeEmail,
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
} from '../../features/auth/validation/auth.validation';
import { getAuthErrorMessage } from '../../services/api/apiError';
import { AuthStackParamList } from '../../types/navigation';
import * as S from './styles';

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
type FieldName = 'name' | 'email' | 'password' | 'confirmPassword';

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { registerAccount } = useAuth();
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<FieldName, boolean>>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const passwordRules = getPasswordRules(password);
  const shouldShowPasswordRules = isPasswordFocused || password.length > 0;

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

    if (fieldName === 'name') {
      return validateName(name) ?? undefined;
    }

    if (fieldName === 'email') {
      return validateEmail(email) ?? undefined;
    }

    if (fieldName === 'password') {
      return validatePassword(password) ?? undefined;
    }

    if (fieldName === 'confirmPassword') {
      return validateConfirmPassword(password, confirmPassword) ?? undefined;
    }

    return undefined;
  }

  async function handleCreateAccount() {
    setHasSubmitted(true);

    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);

    if (nameError || emailError || passwordError || confirmPasswordError || isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await registerAccount({
        name: name.trim(),
        email: normalizeEmail(email),
        password,
      });

      setPassword('');
      setConfirmPassword('');

      navigation.replace('VerifyEmail', {
        email: response.user.email,
        infoMessage: response.message,
      });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, 'signUp'));
    } finally {
      setIsSubmitting(false);
    }
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
                  {'Cadastre-se para salvar suas prefer\u00eancias e acessar o '}
                  {APP_NAME}
                  {'.'}
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
                helperTone="danger"
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
                helperTone="danger"
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
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => {
                  setIsPasswordFocused(false);
                  markFieldAsTouched('password');
                }}
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
                onSubmitEditing={handleCreateAccount}
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
                helperText={getFieldError('confirmPassword')}
                helperTone="danger"
              />

              <S.ActionGroup>
                {errorMessage ? <S.FormErrorText>{errorMessage}</S.FormErrorText> : null}
                <PrimaryButton
                  onPress={handleCreateAccount}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  Criar conta
                </PrimaryButton>
                <S.SecondaryActionButton
                  onPress={() => navigation.navigate('Login')}
                  hitSlop={8}
                  disabled={isSubmitting}
                >
                  <S.SecondaryActionText>
                    {'J\u00e1 tenho uma conta'}
                  </S.SecondaryActionText>
                </S.SecondaryActionButton>
              </S.ActionGroup>
            </S.FormCard>
          </S.Content>
        </S.ScrollContent>
      </S.KeyboardFrame>
    </SafeScreen>
  );
}
