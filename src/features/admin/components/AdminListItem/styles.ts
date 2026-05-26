import styled from 'styled-components/native';

export const Container = styled.View`
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.surface};
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const ContentRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const CopyBlock = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const ImageFrame = styled.View`
  width: 88px;
  height: 88px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

export const ImagePreview = styled.Image`
  width: 100%;
  height: 100%;
`;

export const ImageFallback = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xxs}px;
  padding: ${({ theme }) => theme.spacing.sm}px;
  background-color: ${({ theme }) => theme.colors.primarySoft};
`;

export const ImageFallbackBadge = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.xs}px;
  padding-vertical: 2px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const ImageFallbackBadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const ImageFallbackLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  text-align: center;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.bodyLg.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodyLg.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.headingSm.fontWeight};
`;

export const Meta = styled.Text`
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
  line-height: ${({ theme }) => theme.typography.bodySm.lineHeight}px;
`;

export const Actions = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;
