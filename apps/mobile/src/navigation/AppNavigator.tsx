import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  hasOnboarded: boolean;
}

export function AppNavigator({ hasOnboarded }: AppNavigatorProps) {
  const { session, loading } = useAuth();

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {session ? (
        <RootStack.Screen name="Main" component={MainNavigator} />
      ) : (
        <RootStack.Screen name="Auth">
          {(props) => <AuthNavigator {...props} hasOnboarded={hasOnboarded} />}
        </RootStack.Screen>
      )}
    </RootStack.Navigator>
  );
}
