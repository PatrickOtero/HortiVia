import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { SessionLoadingScreen } from '../screens/SessionLoading';

type RootNavigatorProps = {
  isAuthenticated: boolean;
  isLoading: boolean;
};

export function RootNavigator({ isAuthenticated, isLoading }: RootNavigatorProps) {
  if (isLoading) {
    return <SessionLoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
