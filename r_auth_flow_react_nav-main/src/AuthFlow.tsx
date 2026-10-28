import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

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
import OnboardingPhotoScreen from "./features/auth/presentation/screens/OnboardingPhotoScreen";
import OnboardingSuccessScreen from "./features/auth/presentation/screens/OnboardingSuccessScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function ContentTabs() {
  const { logout } = useAuth();

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
  return (
    <ProductProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="App" component={ContentTabs} />
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
          <Stack.Screen name="OnboardingPhoto" component={OnboardingPhotoScreen} />
          <Stack.Screen name="OnboardingSuccess" component={OnboardingSuccessScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
