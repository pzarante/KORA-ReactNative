import React from "react";
import { StyleSheet, View } from "react-native";

export default function AuthBrand() {
  return (
    <View accessibilityLabel="Kora" style={styles.logo}>
      <View style={styles.stem} />
      <View style={styles.topArm} />
      <View style={styles.bottomArm} />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { width: 48, height: 48, position: "relative" },
  stem: {
    position: "absolute",
    left: 3,
    top: 0,
    width: 12,
    height: 46,
    borderRadius: 8,
    backgroundColor: "#5700C9",
  },
  topArm: {
    position: "absolute",
    left: 13,
    top: 5,
    width: 35,
    height: 12,
    borderRadius: 8,
    backgroundColor: "#7217F1",
    transform: [{ rotate: "-36deg" }],
  },
  bottomArm: {
    position: "absolute",
    left: 15,
    top: 31,
    width: 30,
    height: 12,
    borderRadius: 8,
    backgroundColor: "#FF5A00",
    transform: [{ rotate: "42deg" }],
  },
});
