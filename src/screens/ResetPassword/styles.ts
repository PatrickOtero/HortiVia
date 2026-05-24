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
  text-align: center;
`;

export const FormSubtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
  text-align: center;
`;

export const EmailHighlight = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.primarySoft};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
`;

export const EmailValue = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  text-align: center;
`;

export const CodePreviewRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
  justify-content: center;
`;

export const CodePreviewCell = styled.View<{ $isFilled: boolean }>`
  width: 44px;
  height: 52px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  border-color: ${({ theme, $isFilled }) =>
    $isFilled ? theme.colors.primaryStrong : theme.colors.border};
  background-color: ${({ theme, $isFilled }) =>
    $isFilled ? theme.colors.primarySoft : theme.colors.surface};
  align-items: center;
  justify-content: center;
`;

export const CodePreviewDigit = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.headingMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingMd.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingMd.fontWeight};
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

export const PasswordRulesCard = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  padding: ${({ theme }) => theme.spacing.md}px;
`;

export const PasswordRuleRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const PasswordRuleIndicator = styled.View<{ $isValid: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${({ theme, $isValid }) =>
    $isValid ? theme.colors.success : theme.colors.borderStrong};
`;

export const PasswordRuleText = styled.Text<{ $isValid: boolean }>`
  flex: 1;
  color: ${({ theme, $isValid }) =>
    $isValid ? theme.colors.text : theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const ActionGroup = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const FeedbackText = styled.Text<{
  $tone: 'info' | 'success' | 'danger';
}>`
  color: ${({ theme, $tone }) => {
    if ($tone === 'success') {
      return theme.colors.success;
    }

    if ($tone === 'danger') {
      return theme.colors.danger;
    }

    return theme.colors.primaryStrong;
  }};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  text-align: center;
`;
