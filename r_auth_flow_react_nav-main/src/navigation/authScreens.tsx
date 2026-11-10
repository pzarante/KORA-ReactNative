import React from "react";

import AccountRequiredScreen from "@/src/features/auth/presentation/screens/AccountRequiredScreen";
import ForgotPasswordScreen from "@/src/features/auth/presentation/screens/ForgotPasswordScreen";
import LoginScreen from "@/src/features/auth/presentation/screens/LoginScreen";
import SignupScreen from "@/src/features/auth/presentation/screens/SignupScreen";
import VerifyEmailScreen from "@/src/features/auth/presentation/screens/VerifyEmailScreen";
import WelcomeScreen from "@/src/features/auth/presentation/screens/WelcomeScreen";

import AppTabsNavigator from "./AppTabsNavigator";
import { onboardingScreens, publicFeedScreens } from "./sharedScreens";
import { Stack } from "./stack";

/**
 * Screens available without a session. Kept as an array of Stack.Screen
 * elements (not a component) so they live in the parent navigator.
 */
export const authScreens = [
  <Stack.Screen key="Welcome" name="Welcome" component={WelcomeScreen} />,
  <Stack.Screen key="Login" name="Login" component={LoginScreen} />,
  <Stack.Screen key="Signup" name="Signup" component={SignupScreen} />,
  <Stack.Screen key="VerifyEmail" name="VerifyEmail" component={VerifyEmailScreen} />,
  <Stack.Screen key="ForgotPassword" name="ForgotPassword" component={ForgotPasswordScreen} />,
  // Same name as the logged-in tabs so "go home" (popTo("App")) works in both modes.
  <Stack.Screen key="App" name="App" component={AppTabsNavigator} />,
  ...publicFeedScreens,
  <Stack.Screen key="AccountRequired" name="AccountRequired" component={AccountRequiredScreen} />,
  ...onboardingScreens,
];
