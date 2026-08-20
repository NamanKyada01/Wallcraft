import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { UserPreferencesScreen, PREFERENCES_KEY } from '../screens/onboarding/UserPreferencesScreen';

export type RootStackParamList = {
  Auth: undefined;
  Preferences: undefined;
  Main: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  hasOnboarded: boolean;
}

export function AppNavigator({ hasOnboarded }: AppNavigatorProps) {
  const { session } = useAuth();
  const [hasPreferences, setHasPreferences] = useState<boolean | null>(null);

  useEffect(() => {
    if (session) {
      AsyncStorage.getItem(PREFERENCES_KEY)
        .then((val) => {
          setHasPreferences(val !== null);
        })
        .catch(() => {
          setHasPreferences(false);
        });
    } else {
      setHasPreferences(null);
    }
  }, [session]);

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {session ? (
        hasPreferences === false ? (
          <RootStack.Screen name="Preferences">
            {() => (
              <UserPreferencesScreen
                onComplete={() => setHasPreferences(true)}
              />
            )}
          </RootStack.Screen>
        ) : (
          <RootStack.Screen name="Main" component={MainNavigator} />
        )
      ) : (
        <RootStack.Screen name="Auth">
          {(props) => <AuthNavigator {...props} hasOnboarded={hasOnboarded} />}
        </RootStack.Screen>
      )}
    </RootStack.Navigator>
  );
}
