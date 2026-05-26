import styled from 'styled-components/native';

export const keyboardContainer = {
  flex: 1,
} as const;

export const Content = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const HeaderRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const HeaderCopy = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

export const HeaderTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.headingLg.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingLg.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingLg.fontWeight};
`;

export const HeaderSubtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const PanelContent = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const FormStack = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const StatusContent = styled.View`
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.lg}px;
`;

export const Stack = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const ItemCard = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`;

export const ItemRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const PreviewFrame = styled.View`
  width: 96px;
  height: 96px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

export const PreviewImage = styled.Image`
  width: 100%;
  height: 100%;
`;

export const PreviewFallback = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: ${({ theme }) => theme.spacing.sm}px;
  background-color: ${({ theme }) => theme.colors.primarySoft};
`;

export const PreviewFallbackBadge = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.xs}px;
  padding-vertical: 2px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const PreviewFallbackBadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const PreviewFallbackText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  text-align: center;
`;

export const ItemCopy = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const ItemTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyLg.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyLg.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const ItemMeta = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const ItemSubtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const ItemActions = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const EditorCard = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const EditorHeader = styled.View`
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

export const EditorTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyLg.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyLg.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const FieldGroup = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const FieldLabel = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const ChipRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const Actions = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const SuccessText = styled.Text`
  color: ${({ theme }) => theme.colors.success};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;
