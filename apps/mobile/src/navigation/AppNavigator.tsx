import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

interface AppNavigatorProps {
  hasOnboarded: boolean;
}

export function AppNavigator({ hasOnboarded }: AppNavigatorProps) {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!session) {
    return <AuthNavigator hasOnboarded={hasOnboarded} />;
  }

  return <MainNavigator />;
}
