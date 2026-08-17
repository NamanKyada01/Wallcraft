import React from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import {
  createDrawerNavigator,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import colors from '../theme/colors';

const Drawer = createDrawerNavigator();

function CustomDrawerContent({ navigation }: DrawerContentComponentProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const menuItems = [
    { icon: 'settings-outline', label: t('drawer.settings'), screen: 'Settings' },
    { icon: 'help-circle-outline', label: t('drawer.helpSupport'), screen: 'Help' },
    { icon: 'information-circle-outline', label: t('drawer.about'), screen: 'About' },
    { icon: 'mail-outline', label: t('about.contact'), screen: 'Contact' },
  ];

  const handleLogout = async () => {
    await authService.signOut();
  };

  const navigateTo = (screen: string) => {
    navigation.navigate(screen as never);
  };

  return (
    <View className="flex-1 bg-bg-secondary" style={{ paddingTop: insets.top }}>
      {/* User header with glassmorphism */}
      <View className="m-4 p-4 rounded-2xl bg-bg-glass border border-border-light">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-accent-primary items-center justify-center overflow-hidden">
            {user?.user_metadata?.avatar_url ? (
              <Image
                source={{ uri: user.user_metadata.avatar_url }}
                className="w-full h-full"
              />
            ) : (
              <Text className="text-white text-lg font-bold">
                {(user?.email?.[0] ?? '?').toUpperCase()}
              </Text>
            )}
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-text-primary font-semibold" numberOfLines={1}>
              {user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User'}
            </Text>
            <Text className="text-text-tertiary text-xs" numberOfLines={1}>
              {user?.email ?? ''}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-2">
        {menuItems.map((item) => (
          <Pressable
            key={item.screen}
            className="flex-row items-center px-4 py-3.5 rounded-xl active:bg-bg-card"
            onPress={() => navigateTo(item.screen)}
          >
            <Ionicons name={item.icon as any} size={22} color={colors.text.secondary} />
            <Text className="text-text-primary text-base ml-3">{item.label}</Text>
          </Pressable>
        ))}

        <View className="h-px bg-border-light my-3 mx-2" />

        <Pressable
          className="flex-row items-center px-4 py-3.5 rounded-xl active:bg-bg-card"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.status.error} />
          <Text className="text-status-error text-base ml-3">
            {t('drawer.logout')}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

export function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: { width: '80%', backgroundColor: colors.bg.secondary },
        overlayColor: 'rgba(0,0,0,0.6)',
      }}
    >
      <Drawer.Screen name="ProfileDrawer" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}
