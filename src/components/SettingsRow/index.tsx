import React from 'react';
import { SettingsRowTone } from '../../types/settings';
import * as S from './styles';

type SettingsRowProps = {
  label: string;
  description?: string;
  valueLabel?: string;
  onPress?: () => void;
  accessory?: React.ReactNode;
  showChevron?: boolean;
  tone?: SettingsRowTone;
};

export function SettingsRow({
  label,
  description,
  valueLabel,
  onPress,
  accessory,
  showChevron = false,
  tone = 'default',
}: SettingsRowProps) {
  const trailing = accessory ?? (
    <S.Trailing>
      {valueLabel ? <S.ValueLabel>{valueLabel}</S.ValueLabel> : null}
      {showChevron ? <S.Chevron>{'>'}</S.Chevron> : null}
    </S.Trailing>
  );

  const content = (
    <>
      <S.CopyBlock>
        <S.Label $tone={tone}>{label}</S.Label>
        {description ? <S.Description>{description}</S.Description> : null}
      </S.CopyBlock>
      {trailing}
    </>
  );

  if (onPress) {
    return (
      <S.PressableRow
        onPress={onPress}
        activeOpacity={0.82}
        accessibilityRole="button"
      >
        {content}
      </S.PressableRow>
    );
  }

  return <S.StaticRow>{content}</S.StaticRow>;
}
