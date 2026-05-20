import { KeyboardAvoidingView } from 'react-native';
import styled from 'styled-components/native';
import { SurfaceCard } from '../../components';

export const KeyboardFrame = styled(KeyboardAvoidingView)`
  flex: 1;
`;

export const ScrollContent = styled.ScrollView.attrs(({ theme }) => ({
  contentContainerStyle: {
    flexGrow: 1,
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  showsVerticalScrollIndicator: false,
}))``;

export const Content = styled.View`
  flex: 1;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xl}px;
`;

export const BrandPanel = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.xs}px;
`;

export const FormCard = styled(SurfaceCard)`
  gap: ${({ theme }) => theme.spacing.lg}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

export const FormHeader = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const FormTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.headingLg.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingLg.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingLg.fontWeight};
`;

export const FormSubtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
`;

export const PasswordToggle = styled.Pressable`
  min-height: 36px;
  align-items: center;
  justify-content: center;
`;

export const PasswordToggleText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const ActionGroup = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const FormErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  text-align: center;
`;

export const SecondaryActionButton = styled.Pressable`
  align-self: center;
`;

export const SecondaryActionText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;
