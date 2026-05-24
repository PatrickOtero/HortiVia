import React, { useRef } from 'react';
import { TextInput } from 'react-native';
import { InputField } from '../InputField';
import { PrimaryButton, SecondaryButton } from '../Button';
import { UserProfileFormErrors, UserProfileFormValues } from '../../types/userProfile';
import * as S from './styles';

type ProfileFormProps = {
  values: UserProfileFormValues;
  errors: UserProfileFormErrors;
  successMessage?: string;
  errorMessage?: string;
  isSubmitting?: boolean;
  onChangeField: (field: keyof UserProfileFormValues, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function ProfileForm({
  values,
  errors,
  successMessage,
  errorMessage,
  isSubmitting = false,
  onChangeField,
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  const emailInputRef = useRef<TextInput>(null);

  return (
    <S.Container>
      <InputField
        label="Nome"
        placeholder="Seu nome"
        value={values.name}
        onChangeText={value => onChangeField('name', value)}
        helperText={errors.name}
        editable={!isSubmitting}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => emailInputRef.current?.focus()}
      />

      <InputField
        ref={emailInputRef}
        label="E-mail"
        placeholder="seuemail@exemplo.com"
        value={values.email}
        onChangeText={value => onChangeField('email', value)}
        helperText={errors.email}
        editable={!isSubmitting}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />

      {errorMessage ? <S.ErrorMessage>{errorMessage}</S.ErrorMessage> : null}
      {successMessage ? <S.SuccessMessage>{successMessage}</S.SuccessMessage> : null}

      <S.Actions>
        <PrimaryButton onPress={onSubmit} loading={isSubmitting}>
          Salvar alterações
        </PrimaryButton>
        <SecondaryButton onPress={onCancel} disabled={isSubmitting}>
          Cancelar
        </SecondaryButton>
      </S.Actions>
    </S.Container>
  );
}
