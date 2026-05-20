import React from 'react';
import { brandMarkImage } from '../../assets/images';
import { APP_NAME, APP_SUBTITLE } from '../../config/brand';
import * as S from './styles';

type BrandLockupProps = {
  subtitle?: string;
  align?: 'left' | 'center';
};

export function BrandLockup({
  subtitle = APP_SUBTITLE,
  align = 'left',
}: BrandLockupProps) {
  return (
    <S.Container $align={align}>
      <S.Row $align={align}>
        <S.MarkShell>
          <S.MarkImage source={brandMarkImage} resizeMode="contain" />
        </S.MarkShell>
        <S.Copy $align={align}>
          <S.Title>{APP_NAME}</S.Title>
        </S.Copy>
      </S.Row>
      {subtitle ? <S.Subtitle $align={align}>{subtitle}</S.Subtitle> : null}
    </S.Container>
  );
}
