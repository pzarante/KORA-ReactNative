import React from "react";

import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import CompleteProfileScreen from "@/src/features/auth/presentation/screens/CompleteProfileScreen";
import EditProfileScreen from "@/src/features/auth/presentation/screens/EditProfileScreen";
import { ProductProvider } from "@/src/features/products/presentation/context/productContext";
import AddProductScreen from "@/src/features/products/presentation/screens/AddProductScreen";
import UpdateProductScreen from "@/src/features/products/presentation/screens/UpdateProductScreen";
import EditProjectScreen from "@/src/features/projects/presentation/screens/EditProjectScreen";
import ApplicantProfileScreen from "@/src/features/projects/presentation/screens/ApplicantProfileScreen";
import JoinRequestScreen from "@/src/features/projects/presentation/screens/JoinRequestScreen";
import MemberJoinedScreen from "@/src/features/projects/presentation/screens/MemberJoinedScreen";
import RequestSentScreen from "@/src/features/projects/presentation/screens/RequestSentScreen";
import RequestsScreen from "@/src/features/projects/presentation/screens/RequestsScreen";

import AppTabsNavigator from "./AppTabsNavigator";
import CreateProjectNavigator from "./CreateProjectNavigator";
import { onboardingScreens, publicFeedScreens } from "./sharedScreens";
import { sheetOptions, Stack, stackOptions, successOptions } from "./stack";

/** Stack for a logged-in user: tabs, onboarding, project flows and profile/product modals. */
export default function AuthenticatedNavigator() {
  const { needsOnboarding } = useAuth();

  return (
    <ProductProvider>
      <Stack.Navigator
        initialRouteName={needsOnboarding ? "OnboardingName" : "App"}
        screenOptions={stackOptions}
      >
        <Stack.Screen name="App" component={AppTabsNavigator} />
        {onboardingScreens}
        <Stack.Screen name="CreateProject" component={CreateProjectNavigator} options={sheetOptions} />
        {publicFeedScreens}
        <Stack.Screen name="JoinRequest" component={JoinRequestScreen} />
        <Stack.Screen name="RequestSent" component={RequestSentScreen} options={successOptions} />
        <Stack.Screen name="Requests" component={RequestsScreen} />
        <Stack.Screen name="EditProject" component={EditProjectScreen} />
        <Stack.Screen name="ApplicantProfile" component={ApplicantProfileScreen} />
        <Stack.Screen name="MemberJoined" component={MemberJoinedScreen} options={successOptions} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
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
