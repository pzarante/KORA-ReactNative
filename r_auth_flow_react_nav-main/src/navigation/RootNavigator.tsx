import React from "react";

import { useAuth } from "@/src/features/auth/presentation/context/authContext";

import AuthenticatedNavigator from "./AuthenticatedNavigator";
import { authScreens } from "./authScreens";
import { Stack, stackOptions } from "./stack";

/** Top-level switch between the logged-out and logged-in stacks. */
export default function RootNavigator() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator screenOptions={stackOptions}>
      {isLoggedIn ? (
        <Stack.Screen name="Authenticated" component={AuthenticatedNavigator} />
      ) : (
        authScreens
      )}
    </Stack.Navigator>
  );
}
