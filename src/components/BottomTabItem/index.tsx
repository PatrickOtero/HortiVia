import React from 'react';
import * as S from './styles';

type BottomTabItemProps = {
  active: boolean;
  label: string;
  onPress: () => void;
};

export function BottomTabItem({ active, label, onPress }: BottomTabItemProps) {
  return (
    <S.Button
      onPress={onPress}
      $active={active}
      activeOpacity={0.9}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <S.Indicator $active={active} />
      <S.Label $active={active}>{label}</S.Label>
    </S.Button>
  );
}
