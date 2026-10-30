import React from 'react';
import type { UserBadgeType } from '../../types/userBadge';
import * as S from './styles';

export const USER_BADGE_OPTIONS: {
  value: UserBadgeType;
  label: string;
  icon: string;
}[] = [
  { value: 'FOUNDER', label: 'Fundador', icon: '👑' },
  { value: 'CO_FOUNDER', label: 'Cofundador', icon: '◆' },
  { value: 'SPECIALIST', label: 'Especialista', icon: '✓' },
];

export function UserBadge({ badge }: { badge?: UserBadgeType | null }) {
  const option = USER_BADGE_OPTIONS.find(item => item.value === badge);
  if (!option) return null;
  return (
    <S.Container accessible accessibilityLabel={option.label}>
      <S.Icon
        $badge={option.value}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        {option.icon}
      </S.Icon>
      <S.Label>{option.label}</S.Label>
    </S.Container>
  );
}
