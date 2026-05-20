import React from 'react';
import * as S from './styles';

type FilterChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <S.Button
      onPress={onPress}
      $active={active}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <S.Label $active={active}>{label}</S.Label>
    </S.Button>
  );
}
