import React from "react";

import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import CompleteProfileScreen from "@/src/features/auth/presentation/screens/CompleteProfileScreen";
import EditProfileScreen from "@/src/features/auth/presentation/screens/EditProfileScreen";
import { ProductProvider } from "@/src/features/products/presentation/context/productContext";
import AddProductScreen from "@/src/features/products/presentation/screens/AddProductScreen";
import UpdateProductScreen from "@/src/features/products/presentation/screens/UpdateProductScreen";
import ApplicantProfileScreen from "@/src/features/projects/presentation/screens/ApplicantProfileScreen";
import JoinRequestScreen from "@/src/features/projects/presentation/screens/JoinRequestScreen";
import MemberJoinedScreen from "@/src/features/projects/presentation/screens/MemberJoinedScreen";
import RequestSentScreen from "@/src/features/projects/presentation/screens/RequestSentScreen";
import RequestsScreen from "@/src/features/projects/presentation/screens/RequestsScreen";

import AppTabsNavigator from "./AppTabsNavigator";
import CreateProjectNavigator from "./CreateProjectNavigator";
import { onboardingScreens, publicFeedScreens } from "./sharedScreens";
import { Stack } from "./stack";

/** Stack for a logged-in user: tabs, onboarding, project flows and profile/product modals. */
export default function AuthenticatedNavigator() {
  const { needsOnboarding } = useAuth();

  return (
    <ProductProvider>
      <Stack.Navigator
        initialRouteName={needsOnboarding ? "OnboardingName" : "App"}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="App" component={AppTabsNavigator} />
        {onboardingScreens}
        <Stack.Screen name="CreateProject" component={CreateProjectNavigator} />
        {publicFeedScreens}
        <Stack.Screen name="JoinRequest" component={JoinRequestScreen} />
        <Stack.Screen name="RequestSent" component={RequestSentScreen} />
        <Stack.Screen name="Requests" component={RequestsScreen} />
        <Stack.Screen name="ApplicantProfile" component={ApplicantProfileScreen} />
        <Stack.Screen name="MemberJoined" component={MemberJoinedScreen} />
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
