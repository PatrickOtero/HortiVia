import React, { useRef, useState } from 'react';
import { Platform, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BrandLockup,
  InputField,
  PrimaryButton,
  SafeScreen,
} from '../../components';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getAuthErrorMessage } from '../../services/api/apiError';
import { AuthStackParamList } from '../../types/navigation';
import * as S from './styles';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: LoginScreenProps) {
  const { signIn } = useAuth();
  const passwordInputRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  async function handleSignIn() {
    if (!isFormValid || isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signIn({
        email: email.trim(),
        password,
      });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, 'signIn'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePasswordSubmit() {
    handleSignIn();
  }

  function handlePrimaryActionPress() {
    handleSignIn();
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
                  if (errorMessage) {
                    setErrorMessage(null);
                  }
                }}
                editable={!isSubmitting}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                placeholder="seuemail@exemplo.com"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
              <InputField
                label="Senha"
                ref={passwordInputRef}
                value={password}
                onChangeText={value => {
                  setPassword(value);
                  if (errorMessage) {
                    setErrorMessage(null);
                  }
                }}
                editable={!isSubmitting}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                secureTextEntry={!isPasswordVisible}
                placeholder="Digite sua senha"
                returnKeyType="done"
                onSubmitEditing={handlePasswordSubmit}
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
              />
              <S.ActionGroup>
                {errorMessage ? <S.FormErrorText>{errorMessage}</S.FormErrorText> : null}
                <PrimaryButton
                  onPress={handlePrimaryActionPress}
                  disabled={!isFormValid}
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
