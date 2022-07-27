import React from 'react';
import {
  BottomTabNavigationOptions,
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { RequestScreen } from '../screens/Request/RequestScreen';
import { ScanScreen } from '../screens/Scan/ScanScreen';
import { RootStackParamList } from './index';
import { TimerBasedRequestScreen } from '../screens/Request/TimerBasedRequestScreen';

export const mainRoutes: TabScreen[] = [
  {
    name: 'Home',
    component: HomeScreen,
    icon: 'home',
  },
  {
    name: 'Scan',
    component: ScanScreen,
    icon: 'qr-code-scanner',
    options: {
      headerShown: false,
    },
  },
  {
    name: 'Request',
    component: RequestScreen,
    icon: 'file-download',
  },
  {
    name: 'TimerBasedRequest',
    component: TimerBasedRequestScreen,
    icon: 'timer',
  },
  {
    name: 'Profile',
    component: ProfileScreen,
    icon: 'person',
  },
];

export type MainBottomTabParamList = {
  Home: {
    activeTab: number;
  };
  Scan: undefined;
  Request: undefined;
  TimerBasedRequest: undefined;
  Profile: undefined;
};

export interface TabScreen {
  name: string;
  icon: string;
  component: React.FC<MainRouteProps>;
  options?: BottomTabNavigationOptions;
}

export type MainRouteProps = BottomTabScreenProps<
  MainBottomTabParamList & RootStackParamList
>;

export type HomeRouteProps = BottomTabScreenProps<
  MainBottomTabParamList & RootStackParamList,
  'Home'
>;
