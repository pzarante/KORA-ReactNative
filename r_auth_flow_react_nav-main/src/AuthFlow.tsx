import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, View } from "react-native";

import { useAuth } from "./features/auth/presentation/context/authContext";
import ForgotPasswordScreen from "./features/auth/presentation/screens/ForgotPasswordScreen";
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

function ContentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={ProductListScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="house" size={24} color={color} iconStyle="solid" />
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={NoScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("CreateProject");
          },
        })}
        options={{
          tabBarLabel: () => null,
          tabBarAccessibilityLabel: "Crear proyecto",
          tabBarButtonTestID: "create-project-tab",
          tabBarIcon: () => (
            <View style={styles.createTab}>
              <FontAwesome6 name="plus" size={22} color="#FFFFFF" iconStyle="solid" />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SettingScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="user" size={24} color={color} iconStyle="solid" />
          ),
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
  createTab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#4500B5",
    alignItems: "center",
    justifyContent: "center",
  },
});
