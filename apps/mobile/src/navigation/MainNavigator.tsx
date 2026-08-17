import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DrawerNavigator } from './DrawerNavigator';
import { TabBar } from '../components/TabBar';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { FavoritesScreen } from '../screens/favorites/FavoritesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { CategoryDetailScreen } from '../screens/category/CategoryDetailScreen';
import { WallpaperDetailScreen } from '../screens/wallpaper/WallpaperDetailScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { AboutScreen } from '../screens/about/AboutScreen';
import { ContactScreen } from '../screens/contact/ContactScreen';
import { HelpScreen } from '../screens/help/HelpScreen';
import { CreateTicketScreen } from '../screens/help/CreateTicketScreen';
import { TicketListScreen } from '../screens/help/TicketListScreen';
import { TicketDetailScreen } from '../screens/help/TicketDetailScreen';
import type { Category, Wallpaper } from '../types';

export type MainStackParamList = {
  MainTabs: undefined;
  CategoryDetail: { category: Category };
  WallpaperDetail: { wallpaper: Wallpaper };
  Settings: undefined;
  About: undefined;
  Contact: undefined;
  Help: undefined;
  CreateTicket: undefined;
  TicketList: undefined;
  TicketDetail: { ticketId: number };
};

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Favorites: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={SearchScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={DrawerNavigator} />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
      <Stack.Screen
        name="WallpaperDetail"
        component={WallpaperDetailScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="CreateTicket" component={CreateTicketScreen} />
      <Stack.Screen name="TicketList" component={TicketListScreen} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
    </Stack.Navigator>
  );
}
