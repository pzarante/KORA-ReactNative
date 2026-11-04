import React from "react";
import { StyleSheet, Text, View } from "react-native";

import AuthPrimaryButton from "../components/AuthPrimaryButton";
import OnboardingLayout from "../components/OnboardingLayout";
import { useAuth } from "../context/authContext";

export default function OnboardingSuccessScreen({ navigation }: { navigation: any }) {
  const { completeProfile, error } = useAuth();

  return (
    <OnboardingLayout>
      <View style={styles.heading}>
        <Text style={styles.title}>¡Todo listo!</Text>
        <Text style={styles.subtitle}>Tu perfil ha sido creado exitosamente</Text>
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>👩🏻</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>✓</Text></View>
      </View>
      <AuthPrimaryButton
        label="Ir a la comunidad"
        onPress={async () => {
          await completeProfile();
          navigation.navigate("App");
        }}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  heading: { alignItems: "center", marginTop: 25, marginBottom: 39 },
  title: { color: "#211832", fontSize: 32, fontWeight: "800", textAlign: "center" },
  subtitle: { color: "#756A8E", fontSize: 15, fontWeight: "600", marginTop: 7, textAlign: "center" },
  avatar: { width: 204, height: 204, borderRadius: 102, borderWidth: 1, borderColor: "#4500B5", backgroundColor: "#E79CA8", alignSelf: "center", alignItems: "center", justifyContent: "center", marginBottom: 50 },
  avatarText: { fontSize: 110 },
  badge: { position: "absolute", right: -2, bottom: -1, width: 57, height: 57, borderRadius: 29, backgroundColor: "#4500B5", borderWidth: 2, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#FFFFFF", fontSize: 25, fontWeight: "800" },
  error: { color: "#B42318", marginTop: 16, textAlign: "center" },
});
