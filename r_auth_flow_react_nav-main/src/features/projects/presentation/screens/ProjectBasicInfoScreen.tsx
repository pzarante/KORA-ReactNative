import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import IconPickerModal from "../components/IconPickerModal";
import ProjectStepLayout from "../components/ProjectStepLayout";
import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";
import { PROJECT_ICONS } from "@/src/features/projects/presentation/components/projectIcons";
import { useCreateProject } from "../context/createProjectContext";
import { useProjectUseCases } from "../components/feed";

const MAX_DESCRIPTION = 150;
const MAX_SUGGESTIONS = 8;

/** Lowercase without accents, so "tecnologia" finds "Tecnología". */
const plain = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export default function ProjectBasicInfoScreen() {
  const { draft, update } = useCreateProject();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tag, setTag] = useState("");
  const useCases = useProjectUseCases();
  // Tags other projects already use, most used first: offered as suggestions (Figma p. 80).
  const [communityTags, setCommunityTags] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    useCases
      .listProjects()
      .then((projects) => {
        const counts = new Map<string, { label: string; count: number }>();
        projects.flatMap((p) => p.etiquetas).forEach((label) => {
          const key = plain(label);
          if (key) counts.set(key, { label: counts.get(key)?.label ?? label, count: (counts.get(key)?.count ?? 0) + 1 });
        });
        if (active) setCommunityTags([...counts.values()].sort((a, b) => b.count - a.count).map((t) => t.label));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [useCases]);
  const query = plain(tag);
  const suggestions = communityTags
    .filter((label) => !draft.etiquetas.some((added) => plain(added) === plain(label)))
    .filter((label) => !query || plain(label).includes(query))
    .slice(0, MAX_SUGGESTIONS);
  // Keep the chosen icon visible even when it came from "Más iconos".
  const quickIcons = [draft.icono, ...PROJECT_ICONS.filter((icon) => icon !== draft.icono)].slice(0, 6);

  const addTag = (text = tag) => {
    const value = text.trim();
    if (value && !draft.etiquetas.some((item) => item.toLowerCase() === value.toLowerCase())) {
      update({ etiquetas: [...draft.etiquetas, value] });
    }
    setTag("");
  };

  return (
    <ProjectStepLayout
      title="Información básica"
      step={2}
      next="ProjectProblem"
      nextDisabled={!draft.nombre.trim() || !draft.descripcion.trim()}
    >
      <View>
        <Text style={ui.label}>Icono del proyecto <Text style={ui.required}>*</Text></Text>
        <View style={styles.icons}>
          {quickIcons.map((icon) => (
            <TouchableOpacity
              key={icon}
              accessibilityLabel={icon}
              accessibilityState={{ selected: draft.icono === icon }}
              onPress={() => update({ icono: icon })}
              style={[styles.icon, draft.icono === icon && styles.iconSelected]}
            >
              <MaterialCommunityIcons name={icon as any} size={26} color={colors.primary} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity accessibilityLabel="Más iconos" onPress={() => setPickerOpen(true)} style={styles.more}>
            <MaterialCommunityIcons name="plus" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <Text style={ui.label}>Nombre del proyecto <Text style={ui.required}>*</Text></Text>
        <TextInput
          onChangeText={(nombre) => update({ nombre })}
          placeholder="Ej. EcoCampus"
          placeholderTextColor={colors.muted}
          style={ui.input}
          testID="project-name-input"
          value={draft.nombre}
        />
      </View>

      <View>
        <View style={styles.labelRow}>
          <Text style={ui.label}>Descripción breve <Text style={ui.required}>*</Text></Text>
          <Text style={styles.counter}>{draft.descripcion.length} / {MAX_DESCRIPTION}</Text>
        </View>
        <TextInput
          maxLength={MAX_DESCRIPTION}
          multiline
          onChangeText={(descripcion) => update({ descripcion })}
          placeholder="¿De qué trata tu proyecto?"
          placeholderTextColor={colors.muted}
          style={[ui.input, ui.textArea]}
          testID="project-description-input"
          value={draft.descripcion}
        />
      </View>

      <View>
        <Text style={ui.label}>Sobre el proyecto</Text>
        <TextInput
          multiline
          onChangeText={(sobre) => update({ sobre })}
          placeholder="Cuenta los detalles y el contexto de tu proyecto..."
          placeholderTextColor={colors.muted}
          style={[ui.input, ui.textArea]}
          testID="project-about-input"
          value={draft.sobre}
        />
      </View>

      <View>
        <Text style={ui.label}>Etiquetas relacionadas al proyecto</Text>
        <View style={[ui.input, styles.tagInput]}>
          <MaterialCommunityIcons name="magnify" size={22} color={colors.muted} />
          <TextInput
            onChangeText={setTag}
            onSubmitEditing={() => addTag()}
            placeholder="Escribe para buscar o crear tag..."
            placeholderTextColor={colors.muted}
            returnKeyType="done"
            style={styles.tagText}
            value={tag}
          />
          {tag.trim() ? (
            <TouchableOpacity accessibilityLabel="Agregar etiqueta" onPress={() => addTag()}>
              <MaterialCommunityIcons name="plus-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={[ui.chips, styles.tags]} testID="tag-suggestions">
          {suggestions.length > 0 ? (
            suggestions.map((label) => (
              <TouchableOpacity key={label} accessibilityLabel={`Agregar ${label}`} onPress={() => addTag(label)} style={styles.suggestion}>
                <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
                <Text style={styles.suggestionText}>{label}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noSuggestions}>No hay más sugerencias.</Text>
          )}
        </View>
        {draft.etiquetas.length > 0 ? (
          <View style={[ui.chips, styles.tags]}>
            {draft.etiquetas.map((item) => (
              <TouchableOpacity
                key={item}
                accessibilityLabel={`Quitar ${item}`}
                onPress={() => update({ etiquetas: draft.etiquetas.filter((t) => t !== item) })}
                style={ui.chip}
              >
                <Text style={ui.chipText}>{item}</Text>
                <MaterialCommunityIcons name="close" size={16} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>

      <IconPickerModal
        onClose={() => setPickerOpen(false)}
        onSelect={(icono) => update({ icono })}
        selected={draft.icono}
        visible={pickerOpen}
      />
    </ProjectStepLayout>
  );
}

const styles = StyleSheet.create({
  icons: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  icon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.card, alignItems: "center", justifyContent: "center" },
  iconSelected: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.soft },
  more: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, alignItems: "center", justifyContent: "center" },
  labelRow: { flexDirection: "row", justifyContent: "space-between" },
  counter: { color: colors.muted, fontSize: 14 },
  tagInput: { flexDirection: "row", alignItems: "center", gap: 10 },
  tagText: { flex: 1, color: colors.text, fontSize: 15 },
  tags: { marginTop: 12 },
  suggestion: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: "#FFFFFF" },
  suggestionText: { color: colors.text, fontSize: 14 },
  noSuggestions: { color: colors.text, fontSize: 14, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: "#FFFFFF", overflow: "hidden" },
});
