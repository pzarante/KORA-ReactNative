import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";
import ButtonGradient from "@/src/shared/ui/ButtonGradient";

type Props = {
  icon?: "account-plus" | "pencil";
  title: string;
  text: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
};

export default function AccountPrompt({ icon = "account-plus", title, text, primaryLabel, onPrimary, secondaryLabel, onSecondary }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.illustration}>
        <MaterialCommunityIcons name="card-account-details-outline" size={110} color={colors.primary} />
        <View style={styles.badge}>
          <MaterialCommunityIcons name={icon} size={30} color="#FFFFFF" />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onPrimary} style={ui.primaryButton} testID="account-prompt-primary">
          <ButtonGradient />
          <Text style={ui.primaryButtonText}>{primaryLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSecondary} style={ui.outlineButton} testID="account-prompt-secondary">
          <Text style={ui.outlineButtonText}>{secondaryLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  illustration: { width: 210, height: 190, borderRadius: 105, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center", marginBottom: 32 },
  badge: { position: "absolute", right: 22, bottom: 18, width: 62, height: 62, borderRadius: 31, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  title: { color: colors.text, fontSize: 30, fontWeight: "800", textAlign: "center" },
  text: { color: colors.muted, fontSize: 16, textAlign: "center", marginTop: 14, lineHeight: 24 },
  actions: { alignSelf: "stretch", gap: 14, marginTop: 40 },
});
