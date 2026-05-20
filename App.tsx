/**
 * HortiVia Mobile App
 * React Native CLI + TypeScript + styled-components
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { App } from './src/app';

function RootApp(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}

export default RootApp;
