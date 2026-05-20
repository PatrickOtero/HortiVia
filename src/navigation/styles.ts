import styled from 'styled-components/native';

export const TabBarOuter = styled.View<{ $bottomInset: number }>`
  position: absolute;
  right: ${({ theme }) => theme.layout.screenPadding}px;
  bottom: ${({ $bottomInset }) => $bottomInset}px;
  left: ${({ theme }) => theme.layout.screenPadding}px;
`;

export const TabBarContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: ${({ theme }) => theme.layout.bottomTabHeight}px;
  padding: ${({ theme }) => theme.spacing.xs}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px 10px;
  shadow-opacity: 1;
  shadow-radius: 24px;
  elevation: ${({ theme }) => theme.elevation.floating};
`;
