import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

/** `scroll`: the content scrolls only when it doesn't fit (small phones, open keyboard); otherwise it fills the screen as before. */
export default function AuthSurface({ children, scroll }: { children: React.ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.surface}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <View pointerEvents="none" style={styles.purpleGlow} />
      <View pointerEvents="none" style={styles.middleGlow} />
      <View pointerEvents="none" style={styles.orangeGlow} />
      {scroll ? (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.content}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  surface: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { flex: 1, paddingHorizontal: 24 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  purpleGlow: {
    position: "absolute",
    top: -70,
    right: -72,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#E5CEFF",
    opacity: 0.72,
  },
  middleGlow: {
    position: "absolute",
    top: "34%",
    right: -54,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#E9D6FF",
    opacity: 0.4,
  },
  orangeGlow: {
    position: "absolute",
    bottom: 80,
    left: -90,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "#FFD4C8",
    opacity: 0.7,
  },
});
