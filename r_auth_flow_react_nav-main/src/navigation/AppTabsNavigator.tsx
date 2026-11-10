import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet } from "react-native";

import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import GuestProfileScreen from "@/src/features/auth/presentation/screens/GuestProfileScreen";
import MyProfileScreen from "@/src/features/auth/presentation/screens/MyProfileScreen";
import ExploreScreen from "@/src/features/projects/presentation/screens/ExploreScreen";
import HomeFeedScreen from "@/src/features/projects/presentation/screens/HomeFeedScreen";
import MyProjectsScreen from "@/src/features/projects/presentation/screens/MyProjectsScreen";
import { colors } from "@/src/shared/ui/tokens";

import { APP_TABS, openCreate } from "./tabs";

const Tab = createBottomTabNavigator();

// The "+" tab never shows a screen: pressing it opens the create-project flow over the tabs.
function NoScreen() {
  return null;
}

// Without a session the same tabs work as guest mode: account-only actions open AccountRequired.
export default function AppTabsNavigator() {
  const { isLoggedIn } = useAuth();
  const TAB_SCREENS = {
    Home: HomeFeedScreen,
    Explore: ExploreScreen,
    Create: NoScreen,
    MyProjects: MyProjectsScreen,
    Profile: isLoggedIn ? MyProfileScreen : GuestProfileScreen,
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.tabLabel,
        // KORA screens are always light; without this the bar follows the phone's dark mode.
        tabBarStyle: { backgroundColor: "#FFFFFF", borderTopColor: colors.border },
      }}
    >
      {APP_TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={TAB_SCREENS[tab.name]}
          listeners={tab.name === "Create" ? ({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              openCreate(navigation, isLoggedIn);
            },
          }) : undefined}
          options={{
            tabBarLabel: tab.label,
            tabBarAccessibilityLabel: tab.name === "Create" ? "Crear proyecto" : undefined,
            tabBarButtonTestID: tab.name === "Create" ? "create-project-tab" : undefined,
            tabBarIcon: ({ color }) => <Feather name={tab.icon} size={24} color={color} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabLabel: { fontSize: 12, fontWeight: "700" },
});
