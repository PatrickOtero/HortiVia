import styled from 'styled-components/native';

export const Button = styled.TouchableOpacity<{ $active: boolean }>`
  flex: 1;
  min-height: ${({ theme }) => theme.layout.bottomTabHeight - 12}px;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primarySoft : 'transparent'};
`;

export const Indicator = styled.View<{ $active: boolean }>`
  width: 5px;
  height: 5px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : 'transparent'};
`;

export const Label = styled.Text<{ $active: boolean }>`
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryStrong : theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme, $active }) =>
    $active ? theme.typography.label.fontWeight : theme.typography.caption.fontWeight};
`;
