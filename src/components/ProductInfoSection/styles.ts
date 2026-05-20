import styled from 'styled-components/native';

export const List = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const ListItem = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const Bullet = styled.View`
  width: 8px;
  height: 8px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const ListText = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;
