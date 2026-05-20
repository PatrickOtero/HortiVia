import 'styled-components/native';
import { Theme } from './themeTypes';

declare module 'styled-components/native' {
  export interface DefaultTheme extends Theme {}
}
