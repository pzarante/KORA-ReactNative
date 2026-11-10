import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, ui } from "@/src/features/projects/presentation/components/projectUi";
import AuthPrimaryButton from "../components/AuthPrimaryButton";
import OnboardingLayout from "../components/OnboardingLayout";
import { useAuth } from "../context/authContext";

/** Figma "construyamostuperfil": shown after the name; the rest of the profile can wait for "Editar perfil". */
export default function OnboardingIntroScreen({ navigation }: { navigation: any }) {
  const { completeProfile, error } = useAuth();
  const [saving, setSaving] = useState(false);

  const later = async () => {
    setSaving(true);
    const saved = await completeProfile();
    setSaving(false);
    if (saved) navigation.popTo("App");
  };

  return (
    <OnboardingLayout>
      <View style={styles.art}>
        <MaterialCommunityIcons name="card-account-details-outline" size={120} color={colors.primary} />
        <View style={styles.badge}>
          <MaterialCommunityIcons name="account-group" size={34} color="#FFFFFF" />
        </View>
      </View>
      <Text style={styles.title}>Construyamos tu perfil</Text>
      <Text style={styles.subtitle}>
        Ahora recopilaremos algunos datos para personalizar tu perfil en KORA y que otras personas puedan conocerte mejor.
      </Text>
      <View style={styles.actions}>
        <AuthPrimaryButton label="Continuar" onPress={() => navigation.navigate("OnboardingRole")} testID="onboarding-intro-continue" />
        <TouchableOpacity accessibilityRole="button" disabled={saving} onPress={later} style={ui.outlineButton} testID="onboarding-intro-later">
          <Text style={ui.outlineButtonText}>{saving ? "Guardando…" : "Hacerlo más tarde"}</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={ui.error}>{error}</Text> : null}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  art: { alignSelf: "center", width: 220, height: 220, borderRadius: 110, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center", marginTop: 40 },
  badge: { position: "absolute", right: 30, bottom: 34, width: 64, height: 64, borderRadius: 18, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center", marginTop: 32 },
  subtitle: { color: colors.muted, fontSize: 16, fontWeight: "600", textAlign: "center", lineHeight: 23, marginTop: 12 },
  actions: { gap: 14, marginTop: 40, paddingBottom: 12 },
});
