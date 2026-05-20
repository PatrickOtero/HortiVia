import styled from 'styled-components/native';
import { ActivityIndicator } from 'react-native';

const baseAction = `
  min-height: 36px;
  padding-horizontal: 14px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
`;

export const Container = styled.View`
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const EditButton = styled.TouchableOpacity`
  ${baseAction}
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.xs}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const EditTag = styled.View`
  ${baseAction}
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const EditText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const LoadingIndicator = styled(ActivityIndicator).attrs(({ theme }) => ({
  color: theme.colors.primaryStrong,
}))``;

export const ErrorText = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const SuccessText = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.success};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;
