import React from 'react';
import { Avatar } from '../Avatar';
import * as S from './styles';

type ProfileAvatarEditorProps = {
  label: string;
  imageUrl?: string | null;
  editLabel?: string;
  onEditPress?: () => void;
  isUploading?: boolean;
  successMessage?: string;
  errorMessage?: string;
};

export function ProfileAvatarEditor({
  label,
  imageUrl,
  editLabel,
  onEditPress,
  isUploading = false,
  successMessage,
  errorMessage,
}: ProfileAvatarEditorProps) {
  const resolvedLabel = editLabel ?? (onEditPress ? 'Alterar foto' : 'Foto do perfil');

  const action = onEditPress ? (
    <S.EditButton onPress={onEditPress} activeOpacity={0.82} disabled={isUploading}>
      {isUploading ? (
        <>
          <S.LoadingIndicator size="small" />
          <S.EditText>Enviando...</S.EditText>
        </>
      ) : (
        <S.EditText>{resolvedLabel}</S.EditText>
      )}
    </S.EditButton>
  ) : (
    <S.EditTag>
      <S.EditText>{resolvedLabel}</S.EditText>
    </S.EditTag>
  );

  return (
    <S.Container>
      <Avatar label={label} size={84} imageUrl={imageUrl} />
      {action}
      {errorMessage ? <S.ErrorText>{errorMessage}</S.ErrorText> : null}
      {successMessage ? <S.SuccessText>{successMessage}</S.SuccessText> : null}
    </S.Container>
  );
}
