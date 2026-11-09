import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import ProjectStepLayout from "../components/ProjectStepLayout";
import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";
import { useCreateProject } from "../context/createProjectContext";

export default function ProjectProblemScreen() {
  const { draft, update } = useCreateProject();

  return (
    <ProjectStepLayout title="Problema" step={3} next="ProjectGoal">
      <View>
        <Text style={styles.heading}>Define el problema</Text>
        <Text style={styles.subtitle}>¿Qué necesidad o desafío identificaste en tu entorno universitario?</Text>
      </View>
      <TextInput
        multiline
        onChangeText={(problema) => update({ problema })}
        placeholder="Describe el problema que quieres resolver..."
        placeholderTextColor={colors.muted}
        style={[ui.input, ui.textArea, styles.area]}
        value={draft.problema}
      />
    </ProjectStepLayout>
  );
}

const styles = StyleSheet.create({
  heading: { color: colors.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 8, lineHeight: 22 },
  area: { minHeight: 200 },
});
