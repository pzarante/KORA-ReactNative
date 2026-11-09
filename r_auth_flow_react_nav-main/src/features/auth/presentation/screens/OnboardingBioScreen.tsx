import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { ui } from "@/src/features/projects/presentation/components/projectUi";
import AuthPrimaryButton from "../components/AuthPrimaryButton";
import OnboardingLayout from "../components/OnboardingLayout";
import { useAuth } from "../context/authContext";

export default function OnboardingBioScreen({ navigation }: { navigation: any }) {
  const [bio, setBio] = useState("");
  const { profile, updateProfile } = useAuth();

  React.useEffect(() => setBio(profile.infoAdicional), [profile.infoAdicional]);

  return (
      <OnboardingLayout step={4} pending={{ infoAdicional: bio }} navigation={navigation}>
          <View style={styles.heading}>
            <Text style={styles.title}>Información adicional</Text>
            <Text style={styles.subtitle}>Esto nos ayudará a personalizar tu experiencia</Text>
          </View>
          <TextInput
            style={[ui.input, ui.textArea, styles.textArea]}
            placeholder="Cuéntanos algo más sobre ti (intereses, metas, etc.)"
            placeholderTextColor="#756A8E"
            multiline
            value={bio}
            onChangeText={setBio}
            textAlignVertical="top"
          />
          <AuthPrimaryButton
            label="Continuar"
            onPress={() => {
              updateProfile({ infoAdicional: bio.trim() });
              navigation.navigate("OnboardingSuccess");
            }}
          />
      </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  heading: { alignItems: "center", marginTop: 32, marginBottom: 22 },
  title: { color: "#211832", fontSize: 32, fontWeight: "800", textAlign: "center" },
  subtitle: { color: "#756A8E", fontSize: 15, fontWeight: "600", marginTop: 7, textAlign: "center" },
  textArea: { minHeight: 170, backgroundColor: "rgba(255,255,255,0.88)", marginBottom: 30 },
});
