import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import ExploreScreen from "@/src/features/projects/presentation/screens/ExploreScreen";
import HomeFeedScreen from "@/src/features/projects/presentation/screens/HomeFeedScreen";
import MyProfileScreen from "@/src/features/projects/presentation/screens/MyProfileScreen";
import { colors } from "@/src/shared/ui/tokens";
const Tab = createBottomTabNavigator();

function DummyCreateScreen() {
  return null;
}

export default function AppTabsNavigator() {
  const { isLoggedIn } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: colors.border,
        },
      }}
    >
      {/* 1. INICIO: Muestra directamente el feed de proyectos */}
      <Tab.Screen
        name="Home"
        component={HomeFeedScreen}
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="home-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 2. EXPLORAR: Incluye la búsqueda y el botón del scanner QR */}
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: "Explorar",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="compass-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 3. CREAR PROYECTO */}
      <Tab.Screen
        name="Create"
        component={DummyCreateScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate(
              isLoggedIn ? "CreateProject" : "AccountRequired",
            );
          },
        })}
        options={{
          tabBarLabel: "Crear",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 4. PERFIL: Selecciona SettingsScreen si está logueado o GuestProfileScreen si no */}
      <Tab.Screen
        name="Profile"
        component={MyProfileScreen}
        options={{
          tabBarLabel: "Mi Perfil",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
