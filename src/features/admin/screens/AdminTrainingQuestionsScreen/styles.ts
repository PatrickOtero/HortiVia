import styled from 'styled-components/native';

export const keyboardContainer = { flex: 1 };

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
`;
export const ErrorText = styled(Copy)`
  color: ${({ theme }) => theme.colors.danger};
`;
export const SuccessText = styled(Copy)`
  color: ${({ theme }) => theme.colors.success};
`;
