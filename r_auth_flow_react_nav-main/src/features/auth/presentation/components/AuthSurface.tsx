import React from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthSurface({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.surface}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <View pointerEvents="none" style={styles.purpleGlow} />
      <View pointerEvents="none" style={styles.middleGlow} />
      <View pointerEvents="none" style={styles.orangeGlow} />
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  surface: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { flex: 1, paddingHorizontal: 24 },
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
