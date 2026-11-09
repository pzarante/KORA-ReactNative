import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PROFILE_SKILLS } from "../../domain/entities/UserProfile";
import AuthPrimaryButton from "../components/AuthPrimaryButton";
import OnboardingLayout from "../components/OnboardingLayout";
import OptionPill from "../components/OptionPill";
import { useAuth } from "../context/authContext";

export default function OnboardingSkillsScreen({ navigation }: { navigation: any }) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const { profile, updateProfile } = useAuth();

  React.useEffect(() => setSelectedSkills(profile.habilidades), [profile.habilidades]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill],
    );
  };

  return (
    <OnboardingLayout step={3} pending={{ habilidades: selectedSkills }} navigation={navigation}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.heading}>
          <Text style={styles.title}>¿Cuáles son tus principales habilidades?</Text>
          <Text style={styles.subtitle}>Selecciona la opción(es) que mejor te describa</Text>
        </View>
        <View style={styles.grid}>
          {PROFILE_SKILLS.map((skill) => (
            <OptionPill
              key={skill}
              label={skill}
              selected={selectedSkills.includes(skill)}
              onPress={() => toggleSkill(skill)}
              style={styles.skill}
            />
          ))}
        </View>
        <AuthPrimaryButton
          label="Continuar"
          onPress={() => {
            updateProfile({ habilidades: selectedSkills });
            navigation.navigate("OnboardingBio");
          }}
        />
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 8 },
  heading: { alignItems: "center", marginTop: 24, marginBottom: 18 },
  title: { color: "#211832", fontSize: 29, fontWeight: "800", textAlign: "center" },
  subtitle: { color: "#756A8E", fontSize: 15, fontWeight: "600", marginTop: 7, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12, marginBottom: 22 },
  skill: { width: "48%" },
});
