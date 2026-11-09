import React from "react";
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

/** Selectable pill used for the role and skill choices. */
export default function OptionPill({ label, selected, onPress, radio, style }: {
  label: string;
  selected: boolean;
  onPress: () => void;
  radio?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      accessibilityRole={radio ? "radio" : "checkbox"}
      accessibilityState={radio ? { selected } : { checked: selected }}
      onPress={onPress}
      style={[styles.pill, style, selected && styles.selected]}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: { minHeight: 54, paddingHorizontal: 10, borderRadius: 28, borderWidth: 1, borderColor: "#E6DDF2", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.88)" },
  selected: { borderColor: "#4500B5", backgroundColor: "#F5EEFF" },
  text: { color: "#40384E", fontSize: 15, textAlign: "center" },
  selectedText: { color: "#4500B5", fontWeight: "700" },
});
