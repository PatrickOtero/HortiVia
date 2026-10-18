import styled from 'styled-components/native';

export const Content = styled.View`
  padding: ${({ theme }) => theme.layout.screenPadding}px;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;
export const Stack = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;
export const Copy = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
`;
export const ErrorText = styled(Copy)`
  color: ${({ theme }) => theme.colors.danger};
`;
export const Option = styled.TouchableOpacity<{ $selected: boolean }>`
  min-height: 56px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border-width: 2px;
  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primarySoft : theme.colors.surface};
  justify-content: center;
`;
