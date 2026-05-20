import styled from 'styled-components/native';

export const Placeholder = styled.View`
  width: ${({ theme }) => theme.layout.iconButtonSize}px;
  height: ${({ theme }) => theme.layout.iconButtonSize}px;
`;

export const Button = styled.TouchableOpacity`
  width: ${({ theme }) => theme.layout.iconButtonSize}px;
  height: ${({ theme }) => theme.layout.iconButtonSize}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.full}px;
`;

export const Icon = styled.Text`
  margin-top: -2px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 26px;
  line-height: 26px;
  font-weight: 500;
`;
