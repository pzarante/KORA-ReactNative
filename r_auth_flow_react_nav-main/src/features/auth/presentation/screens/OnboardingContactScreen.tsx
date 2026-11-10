import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";
import { contactError } from "../../domain/entities/UserProfile";
import AuthPrimaryButton from "../components/AuthPrimaryButton";
import ContactFields from "../components/ContactFields";
import OnboardingLayout from "../components/OnboardingLayout";
import { useAuth } from "../context/authContext";

export default function OnboardingContactScreen({ navigation }: { navigation: any }) {
  const { profile, updateProfile } = useAuth();
  const [contact, setContact] = useState({ whatsapp: profile.whatsapp, correoContacto: profile.correoContacto });
  const [error, setError] = useState<string>();

  return (
    <OnboardingLayout step={5} pending={contact} navigation={navigation}>
      <View style={styles.heading}>
        <Text style={styles.title}>¿Cómo quieres que te contacten?</Text>
        <Text style={styles.subtitle}>Elige los medios por los que otros miembros del equipo puedan comunicarse contigo.</Text>
        <Text style={styles.required}>Debes agregar al menos uno.</Text>
      </View>
      <ContactFields
        value={contact}
        onChange={(patch) => {
          setContact((current) => ({ ...current, ...patch }));
          setError(undefined);
        }}
      />
      {error ? <Text style={ui.error}>{error}</Text> : null}
      <View style={styles.button}>
        <AuthPrimaryButton
          label="Continuar"
          testID="onboarding-contact-continue"
          onPress={() => {
            const problem = contactError(contact, true);
            if (problem) return setError(problem);
            updateProfile({ ...contact, correoContacto: contact.correoContacto.trim() });
            navigation.navigate("OnboardingSuccess");
          }}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  heading: { alignItems: "center", marginTop: 32, marginBottom: 8 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center" },
  subtitle: { color: colors.muted, fontSize: 15, fontWeight: "600", marginTop: 7, textAlign: "center", lineHeight: 21 },
  required: { color: colors.primary, fontSize: 15, fontWeight: "800", marginTop: 12, textAlign: "center" },
  button: { marginTop: 28 },
});
