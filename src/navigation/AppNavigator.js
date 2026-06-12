import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { navigationRef } from "./navigationRef";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ProfileEditorScreen from "../screens/ProfileEditorScreen";
import HomeScreen from "../screens/HomeScreen";
import ClassesScreen from "../screens/ClassesScreen";
import SettingsScreen from "../screens/SettingsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import CustomTabBar from "../components/navigation/CustomTabBar";

const RootStack = createNativeStackNavigator();
const AuthStackNav = createNativeStackNavigator();
const AppStackNav = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* ---------- AUTH STACK ---------- */
function AuthStack() {
  return (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="Register" component={RegisterScreen} />
    </AuthStackNav.Navigator>
  );
}

/* ---------- APP TABS ---------- */
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Classes" component={ClassesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

/* ---------- APP STACK (usuario autenticado) ----------
   Inicia en ProfileEditor si el perfil aún no está completo (onboarding),
   o directamente en las pestañas si ya lo está. */
function AppStack({ hasProfile }) {
  return (
    <AppStackNav.Navigator
      initialRouteName={hasProfile ? "Home" : "ProfileEditor"}
      screenOptions={{ headerShown: false }}
    >
      {/* Se llama "Home" para que ProfileEditor.reset({name:"Home"}) resuelva aquí. */}
      <AppStackNav.Screen name="Home" component={AppTabs} />
      <AppStackNav.Screen
        name="ProfileEditor"
        component={ProfileEditorScreen}
        options={{
          headerShown: true,
          title: "",
          headerBackTitleVisible: false,
        }}
      />
      <AppStackNav.Screen name="Notifications" component={NotificationsScreen} />
    </AppStackNav.Navigator>
  );
}

/* ---------- ROOT NAVIGATOR ----------
   La sesión de Supabase decide Auth vs App de forma reactiva. */
export default function AppNavigator({ session, hasProfile }) {
  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <RootStack.Screen name="Auth" component={AuthStack} />
        ) : (
          <RootStack.Screen name="App">
            {() => <AppStack hasProfile={hasProfile} />}
          </RootStack.Screen>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
