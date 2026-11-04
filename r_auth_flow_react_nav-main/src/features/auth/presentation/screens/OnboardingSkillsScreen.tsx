import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AuthPrimaryButton from "../components/AuthPrimaryButton";
import OnboardingLayout from "../components/OnboardingLayout";

const skills = [
  "Creatividad", "Investigación", "Innovación", "Programación",
  "Liderazgo", "Marketing", "Comunicación", "Emprendimiento",
  "Diseño", "Trabajo en equipo", "Tecnología", "Gestión de proyectos",
];

export default function OnboardingSkillsScreen({ navigation }: { navigation: any }) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill],
    );
  };

  return (
    <OnboardingLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.heading}>
          <Text style={styles.title}>¿Cuáles son tus principales habilidades?</Text>
          <Text style={styles.subtitle}>Selecciona la opción(es) que mejor te describa</Text>
        </View>
        <View style={styles.grid}>
          {skills.map((skill) => {
            const selected = selectedSkills.includes(skill);
            return (
              <TouchableOpacity
                key={skill}
                onPress={() => toggleSkill(skill)}
                style={[styles.skill, selected && styles.selected]}
              >
                <Text style={styles.skillText}>{skill}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <AuthPrimaryButton
          label="Continuar"
          onPress={() => navigation.navigate("OnboardingSuccess")}
        />
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 22 },
  heading: { alignItems: "center", marginTop: 45, marginBottom: 18 },
  title: { color: "#211832", fontSize: 29, fontWeight: "800", textAlign: "center" },
  subtitle: { color: "#756A8E", fontSize: 15, fontWeight: "600", marginTop: 7, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  skill: { width: "43%", minHeight: 54, paddingHorizontal: 10, borderRadius: 28, borderWidth: 1, borderColor: "#E6DDF2", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.88)" },
  selected: { borderColor: "#4500B5", backgroundColor: "#F5EEFF" },
  skillText: { color: "#40384E", fontSize: 15, textAlign: "center" },
});
