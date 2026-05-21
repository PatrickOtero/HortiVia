import styled from 'styled-components/native';

export const Content = styled.View`
  min-height: 100%;
  justify-content: center;
  padding: ${({ theme }) => theme.layout.screenPadding}px;
`;
