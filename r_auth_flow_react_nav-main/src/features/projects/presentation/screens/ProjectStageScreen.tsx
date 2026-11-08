import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { PROJECT_STAGES } from "../../domain/entities/Project";
import ProjectStepLayout from "../components/ProjectStepLayout";
import { colors } from "../components/projectUi";
import { useCreateProject } from "../context/createProjectContext";

export default function ProjectStageScreen() {
  const { draft, update } = useCreateProject();

  return (
    <ProjectStepLayout title="Etapa del proyecto" step={1} next="ProjectBasicInfo" nextDisabled={!draft.etapa}>
      <Text style={styles.heading}>Selecciona la etapa actual</Text>
      <View style={styles.options}>
        {PROJECT_STAGES.map((stage) => {
          const selected = draft.etapa === stage;
          return (
            <TouchableOpacity
              key={stage}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => update({ etapa: stage })}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
              <Text style={styles.optionText}>{stage}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ProjectStepLayout>
  );
}

const styles = StyleSheet.create({
  heading: { color: colors.text, fontSize: 20, fontWeight: "800" },
  options: { gap: 12 },
  option: { minHeight: 62, borderRadius: 31, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 18 },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.soft },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#8C84A0", alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  optionText: { color: colors.text, fontSize: 16 },
});
