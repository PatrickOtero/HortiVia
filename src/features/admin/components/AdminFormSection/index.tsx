import React from 'react';
import * as S from './styles';

type AdminFormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AdminFormSection({
  title,
  description,
  children,
}: AdminFormSectionProps) {
  return (
    <S.Container>
      <S.Header>
        <S.Title>{title}</S.Title>
        {description ? <S.Description>{description}</S.Description> : null}
      </S.Header>
      <S.Content>{children}</S.Content>
    </S.Container>
  );
}
