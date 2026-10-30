import styled from 'styled-components/native';
import type { UserBadgeType } from '../../types/userBadge';

export const Container = styled.View`
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  gap: 4px;
  padding: 3px 7px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
export const Icon = styled.Text<{ $badge: UserBadgeType }>`
  color: ${({ theme, $badge }) =>
    $badge === 'FOUNDER'
      ? theme.colors.accent
      : $badge === 'CO_FOUNDER'
      ? '#7961AD'
      : theme.colors.primary};
  font-size: 17px;
  font-weight: 700;
`;
export const Label = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
  font-weight: 600;
`;
