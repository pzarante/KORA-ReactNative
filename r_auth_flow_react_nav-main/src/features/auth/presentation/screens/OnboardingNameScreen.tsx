import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import AuthField from "../components/AuthField";
import AuthPrimaryButton from "../components/AuthPrimaryButton";
import OnboardingLayout from "../components/OnboardingLayout";

export default function OnboardingNameScreen({ navigation }: { navigation: any }) {
  const [name, setName] = useState("");

  return (
    <OnboardingLayout>
      <View style={styles.heading}>
        <Text style={styles.title}>¿Cómo te llamas?</Text>
        <Text style={styles.subtitle}>Ingresa tu nombre completo para comenzar</Text>
      </View>
      <AuthField
        icon="♙"
        value={name}
        onChangeText={setName}
        placeholder="Nombre completo"
        autoCapitalize="words"
      />
      <View style={styles.button}>
        <AuthPrimaryButton
          label="Continuar"
          onPress={() => navigation.navigate("OnboardingRole")}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  heading: { alignItems: "center", marginTop: 45, marginBottom: 22 },
  title: { color: "#211832", fontSize: 32, fontWeight: "800", textAlign: "center" },
  subtitle: { color: "#756A8E", fontSize: 15, fontWeight: "600", marginTop: 7, textAlign: "center" },
  button: { marginTop: 37 },
});
