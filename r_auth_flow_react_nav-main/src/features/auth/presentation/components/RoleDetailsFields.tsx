import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ui } from "@/src/shared/ui/styles";
import { colors } from "@/src/shared/ui/tokens";
import { ANIOS_EGRESO, CARRERAS, RoleDetails, SEMESTRES } from "../../domain/entities/UserProfile";

type Props = { rol: string; value: RoleDetails; onChange: (patch: RoleDetails) => void };

/** The questions each role answers after picking it (Figma p. 28–30). Renders nothing without a role. */
export default function RoleDetailsFields({ rol, value, onChange }: Props) {
  if (rol === "Estudiante") {
    return (
      <View style={styles.fields}>
        <Field label="¿Qué carrera estudias?">
          <SelectField
            options={CARRERAS}
            placeholder="Selecciona tu carrera"
            value={value.carrera ?? ""}
            onSelect={(carrera) => onChange({ carrera })}
            testID="role-carrera-select"
          />
        </Field>
        <Field label="¿En qué semestre estás?">
          <View style={styles.semesters}>
            {SEMESTRES.map((n) => {
              const selected = value.semestre === n;
              return (
                <TouchableOpacity
                  key={n}
                  accessibilityLabel={`Semestre ${n}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => onChange({ semestre: selected ? "" : n })}
                  style={[styles.semester, selected && styles.semesterSelected]}
                  testID={`role-semestre-${n}`}
                >
                  <Text style={[styles.semesterText, selected && styles.semesterTextSelected]}>{n}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Field>
      </View>
    );
  }
  if (rol === "Docente") {
    return (
      <View style={styles.fields}>
        <Field label="¿Qué departamento(s)?">
          <Input
            placeholder="Ej: Ingeniería, ciencias básicas, ciencias de…"
            value={value.departamento ?? ""}
            onChangeText={(departamento) => onChange({ departamento })}
            testID="role-departamento-input"
          />
        </Field>
        <Field label="¿Qué asignatura(s)?">
          <Input
            placeholder="Ej: Tipografía, Taller básico I, Portafolio…"
            value={value.asignaturas ?? ""}
            onChangeText={(asignaturas) => onChange({ asignaturas })}
            testID="role-asignaturas-input"
          />
        </Field>
      </View>
    );
  }
  if (rol === "Egresado") {
    return (
      <View style={styles.fields}>
        <Field label="¿Qué carrera estudiaste?">
          <Input
            placeholder="Escribe el nombre de tu carrera"
            value={value.carrera ?? ""}
            onChangeText={(carrera) => onChange({ carrera })}
            testID="role-carrera-input"
          />
        </Field>
        <Field label="¿En qué año te graduaste?">
          <SelectField
            options={ANIOS_EGRESO}
            placeholder="Selecciona el año"
            value={value.anioEgreso ?? ""}
            onSelect={(anioEgreso) => onChange({ anioEgreso })}
            testID="role-anio-select"
          />
        </Field>
        <Field label="¿Cuál es tu cargo?">
          <Input
            placeholder="Escribe tu cargo"
            value={value.cargo ?? ""}
            onChangeText={(cargo) => onChange({ cargo })}
            testID="role-cargo-input"
          />
        </Field>
      </View>
    );
  }
  return null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput placeholderTextColor={colors.muted} style={[ui.input, styles.input]} {...props} />;
}

/** A pill that opens its options right below it; tapping the chosen one again keeps it. */
function SelectField({ options, placeholder, value, onSelect, testID }: {
  options: string[]; placeholder: string; value: string; onSelect: (value: string) => void; testID?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={[ui.input, styles.input, styles.select]}
        testID={testID}
      >
        <Text style={[styles.selectText, !value && styles.placeholder]}>{value || placeholder}</Text>
        <MaterialCommunityIcons name={open ? "chevron-up" : "chevron-down"} size={24} color={colors.text} />
      </TouchableOpacity>
      {open ? (
        <ScrollView nestedScrollEnabled style={styles.options} keyboardShouldPersistTaps="handled">
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected: option === value }}
              onPress={() => {
                onSelect(option);
                setOpen(false);
              }}
              style={[styles.option, option === value && styles.optionSelected]}
            >
              <Text style={[styles.optionText, option === value && styles.optionTextSelected]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fields: { gap: 22 },
  label: { color: colors.text, fontSize: 15, fontWeight: "700", marginBottom: 10, marginLeft: 4 },
  input: { backgroundColor: "rgba(255,255,255,0.88)" },
  select: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectText: { color: colors.text, fontSize: 15, flex: 1 },
  placeholder: { color: colors.muted },
  options: { maxHeight: 220, marginTop: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: "#FFFFFF" },
  option: { paddingHorizontal: 18, paddingVertical: 12 },
  optionSelected: { backgroundColor: colors.soft },
  optionText: { color: colors.text, fontSize: 15 },
  optionTextSelected: { color: colors.primary, fontWeight: "700" },
  semesters: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  semester: {
    width: "15%", minWidth: 44, aspectRatio: 1.15, borderRadius: 24, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.88)",
  },
  semesterSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  semesterText: { color: colors.text, fontSize: 15, fontWeight: "600" },
  semesterTextSelected: { color: "#FFFFFF", fontWeight: "800" },
});
