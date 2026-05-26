import React from 'react';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabItem } from '../components/BottomTabItem';
import { HomeScreen } from '../screens/Home';
import { FeedScreen } from '../screens/Feed';
import { FavoritesScreen } from '../screens/Favorites';
import { SettingsScreen } from '../screens/Settings';
import { AppTabParamList } from '../types/navigation';
import * as S from './styles';

const Tab = createBottomTabNavigator<AppTabParamList>();
const MINIMUM_BOTTOM_TAB_INSET = 12;

function AppTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  return (
    <S.TabBarOuter
      pointerEvents="box-none"
      $bottomInset={Math.max(insets.bottom, MINIMUM_BOTTOM_TAB_INSET)}
    >
      <S.TabBarContainer>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <BottomTabItem
              key={route.key}
              label={label}
              active={isFocused}
              onPress={onPress}
            />
          );
        })}
      </S.TabBarContainer>
    </S.TabBarOuter>
  );
}

export function AppTabsNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={AppTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{ tabBarLabel: 'Leituras' }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ tabBarLabel: 'Favoritos' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Ajustes' }}
      />
    </Tab.Navigator>
  );
}
