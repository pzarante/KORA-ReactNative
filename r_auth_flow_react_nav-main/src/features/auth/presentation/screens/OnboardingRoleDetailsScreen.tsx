import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/shared/ui/tokens";
import { detailsForRole, RoleDetails } from "../../domain/entities/UserProfile";
import AuthPrimaryButton from "../components/AuthPrimaryButton";
import OnboardingLayout from "../components/OnboardingLayout";
import RoleDetailsFields from "../components/RoleDetailsFields";
import { useAuth } from "../context/authContext";

const TITLES: Record<string, string> = {
  Estudiante: "Conozcamos tu formación",
  Docente: "Conozcamos tu perfil docente",
  Egresado: "Conozcamos tu trayectoria",
};

/** Step 3: the questions for the role picked in step 2 (Figma p. 28–30). All optional. */
export default function OnboardingRoleDetailsScreen({ navigation }: { navigation: any }) {
  const { profile, updateProfile } = useAuth();
  const [details, setDetails] = useState<RoleDetails>(() => detailsForRole(profile.rol, profile));

  return (
    <OnboardingLayout step={3} pending={details} navigation={navigation}>
      <View style={styles.heading}>
        <Text style={styles.title}>{TITLES[profile.rol] ?? "Conozcámonos"}</Text>
        <Text style={styles.subtitle}>Esta información nos permitirá personalizar tu experiencia</Text>
      </View>
      <View style={styles.fields}>
        <RoleDetailsFields rol={profile.rol} value={details} onChange={(patch) => setDetails((current) => ({ ...current, ...patch }))} />
      </View>
      <AuthPrimaryButton
        label="Continuar"
        onPress={() => {
          updateProfile(detailsForRole(profile.rol, details));
          navigation.navigate("OnboardingSkills");
        }}
        testID="role-details-continue"
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  heading: { alignItems: "center", marginTop: 24, marginBottom: 28 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center" },
  subtitle: { color: colors.muted, fontSize: 15, fontWeight: "600", marginTop: 7, textAlign: "center" },
  fields: { marginBottom: 32 },
});
