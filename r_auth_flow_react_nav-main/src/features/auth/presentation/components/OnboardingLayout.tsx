import React from "react";
import { StyleSheet, View } from "react-native";

import AuthBrand from "./AuthBrand";
import AuthSurface from "./AuthSurface";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSurface>
      <View style={styles.container}>
        <AuthBrand />
        {children}
      </View>
    </AuthSurface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70 },
});
