import React from 'react';
import { SectionTitle } from '../SectionTitle';
import { SurfaceCard } from '../SurfaceCard';
import * as S from './styles';

type EmptyStateCardProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function EmptyStateCard({
  title,
  description,
  children,
}: EmptyStateCardProps) {
  return (
    <SurfaceCard>
      <S.Content>
        <SectionTitle title={title} subtitle={description} />
        {children}
      </S.Content>
    </SurfaceCard>
  );
}
