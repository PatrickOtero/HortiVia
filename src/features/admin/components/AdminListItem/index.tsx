import React from 'react';
import { SecondaryButton, TextButton } from '../../../../components';
import * as S from './styles';

type AdminListItemProps = {
  title: string;
  subtitle: string;
  meta?: string | null;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
};

export function AdminListItem({
  title,
  subtitle,
  meta,
  onEdit,
  onDelete,
  isDeleting = false,
}: AdminListItemProps) {
  return (
    <S.Container>
      <S.CopyBlock>
        <S.Title>{title}</S.Title>
        {meta ? <S.Meta>{meta}</S.Meta> : null}
        <S.Subtitle>{subtitle}</S.Subtitle>
      </S.CopyBlock>
      <S.Actions>
        <SecondaryButton fullWidth={false} onPress={onEdit}>
          Editar
        </SecondaryButton>
        <TextButton
          fullWidth={false}
          onPress={onDelete}
          loading={isDeleting}
          disabled={isDeleting}
        >
          Remover
        </TextButton>
      </S.Actions>
    </S.Container>
  );
}
