import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import React from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DIProvider } from "./src/core/di/DIProvider";
import { AuthProvider } from "./src/features/auth/presentation/context/authContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { brandFonts, installBrandFont } from "./src/shared/ui/fonts";
import SplashScreen from "./src/shared/ui/SplashScreen";
import { installWebInputStyles } from "./src/shared/ui/webInputStyles";
import { brandTheme } from "./src/theme/theme";

installWebInputStyles();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: brandTheme.colors.background,
    card: brandTheme.colors.surface,
    text: brandTheme.colors.onSurface,
    border: brandTheme.colors.outline,
    primary: brandTheme.colors.primary,
    notification: brandTheme.colors.error,
  },
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts(brandFonts);

  // Wait for Plus Jakarta Sans so no screen flashes in the system font. If it fails to load,
  // the app still opens with the system font.
  if (!fontsLoaded && !fontError) {
    return (
      <SafeAreaProvider>
        <SplashScreen />
      </SafeAreaProvider>
    );
  }
  if (fontsLoaded) installBrandFont();

  return (
    <SafeAreaProvider>
      <DIProvider>
        <AuthProvider>
          <PaperProvider theme={brandTheme}>
            <NavigationContainer theme={navigationTheme}>
              <RootNavigator />
            </NavigationContainer>
          </PaperProvider>
        </AuthProvider>
      </DIProvider>
    </SafeAreaProvider>
  );
}
