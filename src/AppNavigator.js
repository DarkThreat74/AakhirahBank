import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts as useInter, Inter_400Regular } from '@expo-google-fonts/inter';
import { useFonts as useCinzel, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import { Feather } from '@expo/vector-icons';

import { getUser } from './storage';
import { COLORS, TYPOGRAPHY } from './theme';

import OnboardingScreen from './screens/OnboardingScreen';
import DashboardScreen from './screens/DashboardScreen';
import DepositScreen from './screens/DepositScreen';
import HistoryScreen from './screens/HistoryScreen';
import DonateScreen from './screens/DonateScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.textPrimary,
    border: COLORS.border,
    primary: COLORS.primaryGold,
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: 'shift',
        tabBarStyle: {
          backgroundColor: '#0A0A08',
          borderTopColor: 'rgba(201, 168, 76, 0.15)',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: COLORS.primaryGold,
        tabBarInactiveTintColor: '#8A8070',
        tabBarLabelStyle: {
          fontFamily: TYPOGRAPHY.body,
          fontSize: 10,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = 'home';
          } else if (route.name === 'Deposit') {
            iconName = 'plus-circle';
          } else if (route.name === 'History') {
            iconName = 'list';
          } else if (route.name === 'Donate') {
            iconName = 'heart';
          }
          return <Feather name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Deposit" component={DepositScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Donate" component={DonateScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const [interLoaded] = useInter({ Inter: Inter_400Regular });
  const [cinzelLoaded] = useCinzel({ Cinzel: Cinzel_400Regular });
  const fontsLoaded = interLoaded && cinzelLoaded;

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getUser();
        if (user && user.onboardingComplete) {
          setComplete(true);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primaryGold} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: COLORS.background } }}>
        {complete ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
