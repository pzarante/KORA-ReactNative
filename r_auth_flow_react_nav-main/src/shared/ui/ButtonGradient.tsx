import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet } from "react-native";

import { primaryGradient } from "./tokens";

/**
 * Figma's purple gradient for primary buttons. Render it as the first child of a button
 * styled with `ui.primaryButton`: it fills the button behind the label. Hidden while
 * `disabled`, so `ui.primaryButtonDisabled` shows through.
 */
export default function ButtonGradient({ disabled = false, radius = 30 }: { disabled?: boolean; radius?: number }) {
  if (disabled) return null;
  return (
    <LinearGradient
      colors={[...primaryGradient]}
      end={{ x: 1, y: 0 }}
      pointerEvents="none"
      start={{ x: 0, y: 0 }}
      style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
    />
  );
}
