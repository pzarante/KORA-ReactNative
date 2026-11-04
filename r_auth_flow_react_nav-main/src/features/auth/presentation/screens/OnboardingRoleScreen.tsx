import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AuthPrimaryButton from "../components/AuthPrimaryButton";
import OnboardingLayout from "../components/OnboardingLayout";

const roles = ["Estudiante", "Docente", "Egresado"];

export default function OnboardingRoleScreen({ navigation }: { navigation: any }) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <OnboardingLayout>
      <View style={styles.heading}>
        <Text style={styles.title}>¿Cuál es tu rol?</Text>
        <Text style={styles.subtitle}>Selecciona la opción que mejor te describa</Text>
      </View>
      <View style={styles.options}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedRole === role }}
            onPress={() => setSelectedRole(role)}
            style={[styles.option, selectedRole === role && styles.selected]}
          >
            <Text style={styles.optionText}>{role}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <AuthPrimaryButton
        label="Continuar"
        onPress={() => navigation.navigate("OnboardingSkills")}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  heading: { alignItems: "center", marginTop: 45, marginBottom: 81 },
  title: { color: "#211832", fontSize: 32, fontWeight: "800", textAlign: "center" },
  subtitle: { color: "#756A8E", fontSize: 15, fontWeight: "600", marginTop: 7, textAlign: "center" },
  options: { gap: 18, marginBottom: 25 },
  option: { height: 55, borderRadius: 28, borderWidth: 1, borderColor: "#E6DDF2", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.88)" },
  selected: { borderColor: "#4500B5", backgroundColor: "#F5EEFF" },
  optionText: { color: "#40384E", fontSize: 15 },
});
