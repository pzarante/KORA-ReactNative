import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import AuthField from "../components/AuthField";
import AuthPrimaryButton from "../components/AuthPrimaryButton";
import OnboardingLayout from "../components/OnboardingLayout";
import { useAuth } from "../context/authContext";
import { colors } from "@/src/shared/ui/tokens";

export default function OnboardingNameScreen({ navigation }: { navigation: any }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const { profile, updateProfile } = useAuth();

  React.useEffect(() => setName(profile.nombreCompleto), [profile.nombreCompleto]);

  return (
    <OnboardingLayout step={1} pending={{ nombreCompleto: name }} navigation={navigation}>
      <View style={styles.heading}>
        <Text style={styles.title}>¿Cómo te llamas?</Text>
        <Text style={styles.subtitle}>Ingresa tu nombre completo para comenzar</Text>
      </View>
      <AuthField
        icon="account-outline"
        value={name}
        onChangeText={(text) => {
          setName(text);
          setError(undefined);
        }}
        placeholder="Nombre completo *"
        autoCapitalize="words"
        autoComplete="name"
        error={error}
        testID="onboarding-name-input"
      />
      <View style={styles.button}>
        <AuthPrimaryButton
          label="Continuar"
          testID="onboarding-continue"
          onPress={() => {
            if (!name.trim()) return setError("Tu nombre es obligatorio");
            updateProfile({ nombreCompleto: name.trim() });
            navigation.navigate("OnboardingIntro");
          }}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  heading: { alignItems: "center", marginTop: 32, marginBottom: 22 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center" },
  subtitle: { color: colors.muted, fontSize: 15, fontWeight: "600", marginTop: 7, textAlign: "center" },
  button: { marginTop: 37 },
});
