import styled from 'styled-components/native';

export const Content = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;
export const Option = styled.TouchableOpacity<{ $selected: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm}px;
  border-radius: 10px;
  border-width: 1px;
  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primarySoft : theme.colors.surface};
`;
export const Label = styled.Text`
  color: ${({ theme }) => theme.colors.text};
`;
export const Error = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
`;
