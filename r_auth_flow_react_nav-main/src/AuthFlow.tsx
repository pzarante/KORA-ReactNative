import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "./features/auth/presentation/context/authContext";
import AccountRequiredScreen from "./features/auth/presentation/screens/AccountRequiredScreen";
import ForgotPasswordScreen from "./features/auth/presentation/screens/ForgotPasswordScreen";
import GuestHomeScreen from "./features/auth/presentation/screens/GuestHomeScreen";
import GuestProfileScreen from "./features/auth/presentation/screens/GuestProfileScreen";
import LoginScreen from "./features/auth/presentation/screens/LoginScreen";
import SignupScreen from "./features/auth/presentation/screens/SignupScreen";
import { ProductProvider } from "./features/products/presentation/context/productContext";
import AddProductScreen from "./features/products/presentation/screens/AddProductScreen";
import ProductListScreen from "./features/products/presentation/screens/ProductListScreen";
import UpdateProductScreen from "./features/products/presentation/screens/UpdateProductScreen";
import SettingScreen from "./features/settings/SettingScreen";
import WelcomeScreen from "./features/auth/presentation/screens/WelcomeScreen";
import OnboardingNameScreen from "./features/auth/presentation/screens/OnboardingNameScreen";
import OnboardingRoleScreen from "./features/auth/presentation/screens/OnboardingRoleScreen";
import OnboardingSkillsScreen from "./features/auth/presentation/screens/OnboardingSkillsScreen";
import OnboardingBioScreen from "./features/auth/presentation/screens/OnboardingBioScreen";
import OnboardingSuccessScreen from "./features/auth/presentation/screens/OnboardingSuccessScreen";
import { colors } from "./features/projects/presentation/components/projectUi";
import { CreateProjectProvider } from "./features/projects/presentation/context/createProjectContext";
import CreateProjectIntroScreen from "./features/projects/presentation/screens/CreateProjectIntroScreen";
import ProjectBasicInfoScreen from "./features/projects/presentation/screens/ProjectBasicInfoScreen";
import ProjectCreatedScreen from "./features/projects/presentation/screens/ProjectCreatedScreen";
import ProjectDetailScreen from "./features/projects/presentation/screens/ProjectDetailScreen";
import ProjectGoalScreen from "./features/projects/presentation/screens/ProjectGoalScreen";
import ProjectProblemScreen from "./features/projects/presentation/screens/ProjectProblemScreen";
import ProjectReviewScreen from "./features/projects/presentation/screens/ProjectReviewScreen";
import ProjectStageScreen from "./features/projects/presentation/screens/ProjectStageScreen";
import ProjectTeamScreen from "./features/projects/presentation/screens/ProjectTeamScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// The "+" tab never shows a screen: pressing it opens the create-project flow over the tabs.
function NoScreen() {
  return null;
}

// shortcut: placeholder for Explorar / Mis Proyectos until their screens exist.
function ComingSoon() {
  return (
    <View style={styles.comingSoon}>
      <Text style={styles.comingSoonText}>Próximamente</Text>
    </View>
  );
}

function CreateProjectFlow() {
  return (
    <CreateProjectProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CreateProjectIntro" component={CreateProjectIntroScreen} />
        <Stack.Screen name="ProjectStage" component={ProjectStageScreen} />
        <Stack.Screen name="ProjectBasicInfo" component={ProjectBasicInfoScreen} />
        <Stack.Screen name="ProjectProblem" component={ProjectProblemScreen} />
        <Stack.Screen name="ProjectGoal" component={ProjectGoalScreen} />
        <Stack.Screen name="ProjectTeam" component={ProjectTeamScreen} />
        <Stack.Screen name="ProjectReview" component={ProjectReviewScreen} />
        <Stack.Screen name="ProjectCreated" component={ProjectCreatedScreen} />
      </Stack.Navigator>
    </CreateProjectProvider>
  );
}

// Without a session the same tabs work as guest mode: account-only actions open AccountRequired.
function ContentTabs() {
  const { isLoggedIn } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.tabLabel,
        // KORA screens are always light; without this the bar follows the phone's dark mode.
        tabBarStyle: { backgroundColor: "#FFFFFF", borderTopColor: colors.border },
      }}
    >
      <Tab.Screen
        name="Home"
        component={isLoggedIn ? ProductListScreen : GuestHomeScreen}
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ComingSoon}
        options={{
          tabBarLabel: "Explorar",
          tabBarIcon: ({ color }) => <Feather name="compass" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Create"
        component={NoScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate(isLoggedIn ? "CreateProject" : "AccountRequired");
          },
        })}
        options={{
          tabBarLabel: "Crear",
          tabBarAccessibilityLabel: "Crear proyecto",
          tabBarButtonTestID: "create-project-tab",
          tabBarIcon: ({ color }) => <Feather name="plus-circle" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="MyProjects"
        component={ComingSoon}
        options={{
          tabBarLabel: "Mis Proyectos",
          tabBarIcon: ({ color }) => <Feather name="bookmark" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={isLoggedIn ? SettingScreen : GuestProfileScreen}
        options={{
          tabBarLabel: "Mi Perfil",
          tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthenticatedStack() {
  const { needsOnboarding } = useAuth();

  return (
    <ProductProvider>
      <Stack.Navigator
        initialRouteName={needsOnboarding ? "OnboardingName" : "App"}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="App" component={ContentTabs} />
        <Stack.Screen name="OnboardingName" component={OnboardingNameScreen} />
        <Stack.Screen name="OnboardingRole" component={OnboardingRoleScreen} />
        <Stack.Screen name="OnboardingSkills" component={OnboardingSkillsScreen} />
        <Stack.Screen name="OnboardingBio" component={OnboardingBioScreen} />
        <Stack.Screen name="OnboardingSuccess" component={OnboardingSuccessScreen} />
        <Stack.Screen name="CreateProject" component={CreateProjectFlow} />
        <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
        <Stack.Screen
          name="AddProductScreen"
          component={AddProductScreen}
          options={{
            title: "Add Product",
            headerShown: true,
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="UpdateProductScreen"
          component={UpdateProductScreen}
          options={{
            title: "Update Product",
            headerShown: true,
            presentation: "modal",
          }}
        />
      </Stack.Navigator>
    </ProductProvider>
  );
}

export default function AuthFlow() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Authenticated" component={AuthenticatedStack} />
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} /> 
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="GuestApp" component={ContentTabs} />
          <Stack.Screen name="AccountRequired" component={AccountRequiredScreen} />
          <Stack.Screen name="OnboardingName" component={OnboardingNameScreen} />
          <Stack.Screen name="OnboardingRole" component={OnboardingRoleScreen} />
          <Stack.Screen name="OnboardingSkills" component={OnboardingSkillsScreen} />
          <Stack.Screen name="OnboardingBio" component={OnboardingBioScreen} />
          <Stack.Screen name="OnboardingSuccess" component={OnboardingSuccessScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabLabel: { fontSize: 12, fontWeight: "700" },
  comingSoon: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  comingSoonText: { color: colors.muted, fontSize: 16, fontWeight: "600" },
});
