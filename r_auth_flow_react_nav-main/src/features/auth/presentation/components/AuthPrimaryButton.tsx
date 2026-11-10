import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "@/src/shared/ui/tokens";

export default function AuthPrimaryButton({
  label,
  onPress,
  testID,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  testID?: string;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={styles.button}
      testID={testID}
    >
      <Text style={styles.label}>{label}  →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 57,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  label: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
