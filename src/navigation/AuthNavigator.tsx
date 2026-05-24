import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ForgotPasswordScreen } from '../screens/ForgotPassword';
import { LoginScreen } from '../screens/Login';
import { RegisterScreen } from '../screens/Register';
import { ResetPasswordScreen } from '../screens/ResetPassword';
import { SessionLoadingScreen } from '../screens/SessionLoading';
import { VerifyEmailScreen } from '../screens/VerifyEmail';
import { AuthStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: 'transparent',
        },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="SessionLoading" component={SessionLoadingScreen} />
    </Stack.Navigator>
  );
}
