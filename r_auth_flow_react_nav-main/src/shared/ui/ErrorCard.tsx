import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "./tokens";

/** Pink alert card with a title and an explanation (Figma p. 16–18). */
export default function ErrorCard({ title, message, testID }: { title: string; message: string; testID?: string }) {
  return (
    <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.card} testID={testID}>
      <MaterialCommunityIcons name="alert-outline" size={26} color={colors.error} />
      <View style={styles.divider} />
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.errorSoft,
    borderWidth: 1, borderColor: colors.errorBorder, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 18,
  },
  divider: { width: 1, alignSelf: "stretch", backgroundColor: colors.errorBorder },
  text: { flex: 1 },
  title: { color: colors.error, fontSize: 15, fontWeight: "800" },
  message: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 3 },
});
