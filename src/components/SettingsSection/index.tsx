import React from 'react';
import { SurfaceCard } from '../SurfaceCard';
import * as S from './styles';

type SettingsSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const rows = React.Children.toArray(children);

  return (
    <S.Container>
      <S.Title>{title}</S.Title>
      <SurfaceCard>
        <S.CardBody>
          {rows.map((row, index) => (
            <React.Fragment key={index}>
              {row}
              {index < rows.length - 1 ? <S.Divider /> : null}
            </React.Fragment>
          ))}
        </S.CardBody>
      </SurfaceCard>
    </S.Container>
  );
}
