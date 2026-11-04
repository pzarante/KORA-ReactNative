import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

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
    backgroundColor: "#4500B5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4500B5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  label: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
