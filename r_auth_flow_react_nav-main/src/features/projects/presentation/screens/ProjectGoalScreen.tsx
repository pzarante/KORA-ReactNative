import React from "react";
import { Text, TextInput, View } from "react-native";

import ProjectStepLayout from "../components/ProjectStepLayout";
import { colors, ui } from "../components/projectUi";
import { useCreateProject } from "../context/createProjectContext";

export default function ProjectGoalScreen() {
  const { draft, update } = useCreateProject();

  return (
    <ProjectStepLayout title="Objetivo y Alcance" step={4} next="ProjectTeam" nextDisabled={!draft.objetivo.trim()}>
      <View>
        <Text style={ui.label}>Objetivo general <Text style={ui.required}>*</Text></Text>
        <TextInput
          multiline
          onChangeText={(objetivo) => update({ objetivo })}
          placeholder="¿Qué quieres lograr con el proyecto?"
          placeholderTextColor={colors.muted}
          style={[ui.input, ui.textArea]}
          testID="project-goal-input"
          value={draft.objetivo}
        />
      </View>
      <View>
        <Text style={ui.label}>Alcance del proyecto</Text>
        <TextInput
          multiline
          onChangeText={(alcance) => update({ alcance })}
          placeholder="¿Hasta dónde llega esta primera fase?"
          placeholderTextColor={colors.muted}
          style={[ui.input, ui.textArea]}
          value={draft.alcance}
        />
        <Text style={ui.helper}>Define límites claros de tiempo, recursos y espacio de prueba.</Text>
      </View>
    </ProjectStepLayout>
  );
}
