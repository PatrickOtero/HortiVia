import styled from 'styled-components/native';

export const keyboardContainer = {
  flex: 1,
};

export const Content = styled.View`
  padding: ${({ theme }) => theme.layout.screenPadding}px;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
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
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
`;

export const StatusContent = styled.View`
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.lg}px;
`;

export const FormStack = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const ImageCard = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

export const ImagePreviewFrame = styled.View`
  height: 188px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const ImagePreview = styled.Image`
  width: 100%;
  height: 100%;
`;

export const ImageFallback = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.primarySoft};
`;

export const ImageFallbackBadge = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.xxs}px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const ImageFallbackBadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  line-height: ${({ theme }) => theme.typography.label.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const ImageFallbackTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.headingSm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.headingSm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const ImageFallbackDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  text-align: center;
`;

export const ImageMeta = styled.View`
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

export const ImageMetaTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const ImageMetaDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const ImageActions = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const CategoryGroup = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const CategoryLabel = styled.Text`
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

export const ToggleRow = styled.View`
  min-height: 72px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const ToggleCopy = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

export const ToggleTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyMd.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const ToggleDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const SuccessText = styled.Text`
  color: ${({ theme }) => theme.colors.success};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const Actions = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;
