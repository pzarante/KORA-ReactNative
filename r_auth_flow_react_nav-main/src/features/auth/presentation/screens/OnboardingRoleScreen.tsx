import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PROFILE_ROLES } from "../../domain/entities/UserProfile";
import AuthPrimaryButton from "../components/AuthPrimaryButton";
import OnboardingLayout from "../components/OnboardingLayout";
import OptionPill from "../components/OptionPill";
import { useAuth } from "../context/authContext";
import { colors } from "@/src/shared/ui/tokens";

export default function OnboardingRoleScreen({ navigation }: { navigation: any }) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { profile, updateProfile } = useAuth();

  React.useEffect(() => setSelectedRole(profile.rol || null), [profile.rol]);

  return (
    <OnboardingLayout step={2} pending={{ rol: selectedRole ?? "" }} navigation={navigation}>
      <View style={styles.heading}>
        <Text style={styles.title}>¿Cuál es tu rol?</Text>
        <Text style={styles.subtitle}>Selecciona la opción que mejor te describa</Text>
      </View>
      <View style={styles.options}>
        {PROFILE_ROLES.map((role) => (
          <OptionPill key={role} radio label={role} selected={selectedRole === role} onPress={() => setSelectedRole(role)} />
        ))}
      </View>
      <AuthPrimaryButton
        label="Continuar"
        onPress={() => {
          if (!selectedRole) return;
          updateProfile({ rol: selectedRole });
          navigation.navigate("OnboardingRoleDetails");
        }}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  heading: { alignItems: "center", marginTop: 32, marginBottom: 48 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center" },
  subtitle: { color: colors.muted, fontSize: 15, fontWeight: "600", marginTop: 7, textAlign: "center" },
  options: { gap: 18, marginBottom: 25 },
});
