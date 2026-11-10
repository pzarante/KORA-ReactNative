import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { Project, ProjectChanges, PROJECT_STAGES, URL_PATTERN } from "../../domain/entities/Project";
import AddRolesSheet from "../components/AddRolesSheet";
import { useFocusLoad, useProjectUseCases } from "../components/feed";
import IconPickerModal from "../components/IconPickerModal";
import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";
import ConfirmModal from "@/src/shared/ui/ConfirmModal";
import { useConfirmLeave } from "@/src/shared/hooks/useConfirmLeave";

const MAX_TEXT = 250;
const EDITABLE = ["icono", "nombre", "descripcion", "sobre", "etiquetas", "etapa", "problema", "objetivo", "alcance", "roles", "enlaces", "buscandoPersonas"] as const;
type Draft = Required<ProjectChanges>;

function Card({ icon, title, text, danger, children }: { icon: any; title: string; text: string; danger?: boolean; children?: React.ReactNode }) {
  return (
    <View style={[styles.card, danger && styles.dangerCard]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, danger && styles.dangerIcon]}>
          <MaterialCommunityIcons name={icon} size={26} color={danger ? colors.error : colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={[styles.cardTitle, danger && styles.dangerText]}>{title}</Text>
          <Text style={styles.cardText}>{text}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function LongField({ value, onChange, testID }: { value: string; onChange: (text: string) => void; testID?: string }) {
  return (
    <View>
      <TextInput maxLength={MAX_TEXT} multiline onChangeText={onChange} style={[ui.input, styles.textArea]} testID={testID} value={value} />
      <Text style={styles.counter}>{value.length} / {MAX_TEXT}</Text>
    </View>
  );
}

/** Small "+ Agregar …" pill that turns into an input; `validate` returns an error message or null. */
function AddInline({ label, placeholder, onAdd, validate }: { label: string; placeholder: string; onAdd: (value: string) => void; validate?: (value: string) => string | null }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    const value = text.trim();
    if (!value) return setOpen(false);
    const problem = validate?.(value) ?? null;
    if (problem) return setError(problem);
    onAdd(value);
    setText("");
    setError(null);
    setOpen(false);
  };

  if (!open) {
    return (
      <TouchableOpacity onPress={() => setOpen(true)} style={styles.addPill}>
        <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
        <Text style={ui.chipText}>{label}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <View style={styles.addInput}>
      <View style={styles.row}>
        <TextInput
          autoCapitalize="none"
          autoFocus
          onChangeText={(value) => {
            setText(value);
            setError(null);
          }}
          onSubmitEditing={submit}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          returnKeyType="done"
          style={[ui.input, styles.flex]}
          value={text}
        />
        <TouchableOpacity accessibilityLabel={label} onPress={submit} style={styles.addButton}>
          <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

/** Only members reach this screen (see ProjectDetail); only the creator can delete. */
export default function EditProjectScreen({ navigation, route }: { navigation: any; route: any }) {
  const project: Project = route.params.project;
  const initial = Object.fromEntries(EDITABLE.map((key) => [key, project[key]])) as Draft;
  const ds = useProjectUseCases();
  const { profile } = useAuth();
  const { data: userId } = useFocusLoad(() => ds.currentUserId(), [ds]);
  const [draft, setDraft] = useState<Draft>(initial);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [stagesOpen, setStagesOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));
  const changes = Object.fromEntries(EDITABLE.filter((key) => JSON.stringify(draft[key]) !== JSON.stringify(initial[key])).map((key) => [key, draft[key]])) as ProjectChanges;
  const dirty = Object.keys(changes).length > 0;
  const valid = !!draft.nombre.trim() && !!draft.descripcion.trim();
  const stageIndex = PROJECT_STAGES.indexOf(draft.etapa);

  // Back button, Android back and swipe all ask before dropping unsaved changes.
  const { exitPending, allowLeave, confirmExit, cancelExit } = useConfirmLeave(navigation, dirty);

  const save = async () => {
    if (!dirty || !valid || saving) return;
    setSaving(true);
    setError(null);
    try {
      const trimmed = { ...changes, ...(changes.nombre !== undefined && { nombre: changes.nombre.trim() }) };
      await ds.updateProject(project.id, trimmed);
      const accepted = (await ds.listRequests({ proyectoId: project.id })).filter((r) => r.estado === "aceptada");
      void ds.notify({
        para: [project.creadorId, ...accepted.map((r) => r.usuarioId)],
        tipo: "edicion",
        proyectoId: project.id,
        actorNombre: profile.nombreCompleto || "Un integrante",
      });
      allowLeave();
      navigation.popTo("ProjectDetail", { project: { ...project, ...trimmed } });
    } catch (err: any) {
      setError(err?.message ?? "No se pudo guardar el proyecto");
      setSaving(false);
    }
  };

  const remove = async () => {
    setConfirmDelete(false);
    setError(null);
    try {
      await ds.archiveProject(project.id);
      allowLeave();
      navigation.popTo("App");
    } catch (err: any) {
      setError(err?.message ?? "No se pudo eliminar el proyecto");
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="edit-project-screen">
      <View pointerEvents="none" style={styles.purpleGlow} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityLabel="Volver" onPress={() => navigation.goBack()} style={styles.back} testID="edit-project-back">
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.flex}>
            <Text style={styles.title}>Editar proyecto</Text>
            <Text style={styles.subtitle}>Modifica la información de tu proyecto.</Text>
          </View>
          <View style={styles.backSpace} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <TouchableOpacity accessibilityLabel="Cambiar icono" onPress={() => setPickerOpen(true)} style={styles.bigIcon}>
                <MaterialCommunityIcons name={draft.icono as any} size={48} color={colors.primary} />
              </TouchableOpacity>
              <View style={styles.verticalDivider} />
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>Información básica</Text>
                <Text style={styles.cardText}>Edita el nombre, la descripción y las etiquetas de tu proyecto.</Text>
              </View>
            </View>
            <Text style={styles.label}>Nombre del proyecto</Text>
            <TextInput onChangeText={(nombre) => update({ nombre })} style={ui.input} testID="edit-project-name" value={draft.nombre} />
            <Text style={styles.label}>Descripción</Text>
            <LongField value={draft.descripcion} onChange={(descripcion) => update({ descripcion })} />
            {/* No length limit here: creation has none, so older texts may be longer than MAX_TEXT. */}
            <Text style={styles.label}>Sobre el proyecto</Text>
            <TextInput
              multiline
              onChangeText={(sobre) => update({ sobre })}
              placeholder="Cuenta los detalles y el contexto de tu proyecto..."
              placeholderTextColor={colors.muted}
              style={[ui.input, styles.textArea]}
              testID="edit-project-about"
              value={draft.sobre}
            />
            <Text style={styles.label}>Etiquetas</Text>
            <View style={ui.chips}>
              {draft.etiquetas.map((tag, index) => (
                <TouchableOpacity
                  key={tag}
                  accessibilityLabel={`Quitar ${tag}`}
                  onPress={() => update({ etiquetas: draft.etiquetas.filter((t) => t !== tag) })}
                  style={[ui.chip, index % 2 === 1 && styles.orangeChip]}
                >
                  <Text style={[ui.chipText, index % 2 === 1 && styles.orangeText]}>{tag}</Text>
                  <MaterialCommunityIcons name="close" size={16} color={index % 2 === 1 ? colors.orange : colors.primary} />
                </TouchableOpacity>
              ))}
              <AddInline
                label="Agregar etiqueta"
                placeholder="Nueva etiqueta"
                onAdd={(tag) => !draft.etiquetas.some((t) => t.toLowerCase() === tag.toLowerCase()) && update({ etiquetas: [...draft.etiquetas, tag] })}
              />
            </View>
          </View>

          <Card icon="layers-outline" title="Etapa del proyecto" text="Selecciona la etapa actual de tu proyecto.">
            <View style={styles.row}>
              <TouchableOpacity onPress={() => setStagesOpen(!stagesOpen)} style={[ui.input, styles.select]} testID="edit-project-stage">
                <Text style={styles.selectText}>{draft.etapa || "Selecciona una etapa"}</Text>
                <MaterialCommunityIcons name={stagesOpen ? "chevron-up" : "chevron-down"} size={24} color={colors.muted} />
              </TouchableOpacity>
              <View style={styles.dots}>
                {PROJECT_STAGES.map((stage, index) => (
                  <View key={stage} style={[styles.dot, index <= stageIndex && styles.dotActive]} />
                ))}
              </View>
            </View>
            {stagesOpen ? (
              <View style={styles.options}>
                {PROJECT_STAGES.map((stage) => (
                  <TouchableOpacity
                    key={stage}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: draft.etapa === stage }}
                    onPress={() => {
                      update({ etapa: stage });
                      setStagesOpen(false);
                    }}
                    style={[styles.option, draft.etapa === stage && styles.optionSelected]}
                  >
                    <Text style={[styles.selectText, draft.etapa === stage && styles.optionTextSelected]}>{stage}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </Card>

          <Card icon="alert-outline" title="Problema" text="Describe la situación o necesidad que aborda tu proyecto.">
            <LongField value={draft.problema} onChange={(problema) => update({ problema })} />
          </Card>
          <Card icon="target" title="Objetivo general" text="Define el propósito principal de tu proyecto.">
            <LongField value={draft.objetivo} onChange={(objetivo) => update({ objetivo })} />
          </Card>
          <Card icon="flag-outline" title="Alcance" text="Define hasta dónde llega tu proyecto.">
            <LongField value={draft.alcance} onChange={(alcance) => update({ alcance })} />
          </Card>

          <Card icon="account-group-outline" title="Roles necesarios" text="Indica los roles o perfiles que buscas para tu equipo.">
            <View style={ui.chips}>
              {draft.roles.map((role) => (
                <TouchableOpacity key={role} accessibilityLabel={`Quitar ${role}`} onPress={() => update({ roles: draft.roles.filter((r) => r !== role) })} style={ui.chip}>
                  <Text style={ui.chipText}>{role}</Text>
                  <MaterialCommunityIcons name="close" size={16} color={colors.primary} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setRolesOpen(true)} style={styles.addPill}>
                <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
                <Text style={ui.chipText}>Agregar rol</Text>
              </TouchableOpacity>
            </View>
          </Card>

          <Card icon="layers-outline" title="Referencias y recursos" text="Añade documentos, enlaces o materiales que apoyen el proyecto.">
            {draft.enlaces.map((url) => (
              <View key={url} style={styles.link}>
                <MaterialCommunityIcons name="link-variant" size={20} color={colors.primary} />
                <TouchableOpacity onPress={() => Linking.openURL(url)} style={styles.flex}>
                  <Text numberOfLines={1} style={styles.linkText}>{url}</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityLabel={`Quitar ${url}`} onPress={() => update({ enlaces: draft.enlaces.filter((u) => u !== url) })}>
                  <MaterialCommunityIcons name="close" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
            <AddInline
              label="Agregar recurso"
              placeholder="https://..."
              validate={(url) => (URL_PATTERN.test(url) ? null : "Escribe un enlace válido que empiece por http:// o https://")}
              onAdd={(url) => !draft.enlaces.includes(url) && update({ enlaces: [...draft.enlaces, url] })}
            />
          </Card>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons name="bullhorn-outline" size={26} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>Buscando personas</Text>
                <Text style={styles.cardText}>
                  Activa esta opción si aún necesitas integrantes para tu equipo. Cuando la desactives, nadie podrá solicitar unirse.
                </Text>
              </View>
              <Switch
                accessibilityLabel="Buscando personas"
                onValueChange={(buscandoPersonas) => update({ buscandoPersonas })}
                thumbColor="#FFFFFF"
                trackColor={{ false: "#E4E0EA", true: colors.primary }}
                testID="edit-project-looking"
                value={draft.buscandoPersonas}
              />
            </View>
          </View>

          {userId && userId === project.creadorId ? (
            <Card
              danger
              icon="trash-can-outline"
              title="Eliminar proyecto"
              text="Esta acción archivará el proyecto de forma permanente. Ya no se mostrará en el feed, ni en búsquedas ni en Mis Proyectos."
            >
              <TouchableOpacity onPress={() => setConfirmDelete(true)} style={styles.deleteButton} testID="edit-project-delete">
                <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.error} />
                <Text style={styles.deleteText}>Eliminar este proyecto</Text>
              </TouchableOpacity>
            </Card>
          ) : null}

          {error ? <Text style={ui.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            accessibilityState={{ disabled: !dirty || !valid || saving }}
            disabled={!dirty || !valid || saving}
            onPress={save}
            style={[ui.primaryButton, styles.save, (!dirty || !valid) && ui.primaryButtonDisabled]}
            testID="edit-project-save"
          >
            <MaterialCommunityIcons name="check" size={24} color={!dirty || !valid ? "#A49DB0" : "#FFFFFF"} />
            <Text style={[ui.primaryButtonText, (!dirty || !valid) && ui.primaryButtonTextDisabled]}>{saving ? "Guardando..." : "Guardar cambios"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <IconPickerModal onClose={() => setPickerOpen(false)} onSelect={(icono) => update({ icono })} selected={draft.icono} visible={pickerOpen} />
      <AddRolesSheet onClose={() => setRolesOpen(false)} onDone={(roles) => update({ roles })} roles={draft.roles} visible={rolesOpen} />
      <ConfirmModal
        visible={exitPending}
        icon="file-document-edit-outline"
        title="¿Salir sin guardar los cambios?"
        text="Perderás las modificaciones que has realizado en el proyecto."
        confirm="Sí, salir sin guardar"
        cancel="Seguir editando"
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
      <ConfirmModal
        visible={confirmDelete}
        icon="trash-can-outline"
        title="¿Eliminar este proyecto?"
        text="Ya no se mostrará en el feed, ni en búsquedas ni en Mis Proyectos."
        confirm="Sí, eliminar"
        cancel="Cancelar"
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  purpleGlow: { position: "absolute", top: -70, right: -72, width: 220, height: 220, borderRadius: 110, backgroundColor: "#E5CEFF", opacity: 0.72 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 24, paddingTop: 8 },
  back: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  backSpace: { width: 48 },
  title: { color: colors.text, fontSize: 26, fontWeight: "800", textAlign: "center", letterSpacing: -0.5 },
  subtitle: { color: colors.text, fontSize: 14, textAlign: "center", marginTop: 2 },
  content: { padding: 16, gap: 16 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 16, gap: 12, backgroundColor: colors.card },
  dangerCard: { backgroundColor: "#FDECEA", borderColor: "#FDECEA" },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  dangerIcon: { borderRadius: 14, backgroundColor: "#F9D6D2" },
  bigIcon: { width: 68, height: 68, borderRadius: 18, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  verticalDivider: { width: 1, alignSelf: "stretch", backgroundColor: colors.border },
  cardTitle: { color: colors.text, fontSize: 19, fontWeight: "800" },
  dangerText: { color: colors.error },
  cardText: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 2 },
  label: { color: colors.text, fontSize: 15, fontWeight: "800" },
  textArea: { minHeight: 80, borderRadius: 20, paddingTop: 12, textAlignVertical: "top" },
  counter: { color: colors.muted, fontSize: 12, textAlign: "right", marginTop: 4 },
  orangeChip: { backgroundColor: colors.orangeSoft },
  orangeText: { color: colors.orange },
  addPill: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, alignSelf: "flex-start", backgroundColor: "#FFFFFF" },
  addInput: { alignSelf: "stretch", width: "100%", gap: 6 },
  addButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  error: { color: colors.error, fontSize: 13 },
  select: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 46 },
  selectText: { color: colors.text, fontSize: 15 },
  dots: { flexDirection: "row", gap: 4 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: "#B9AEDA" },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  options: { gap: 8 },
  option: { minHeight: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border, justifyContent: "center", paddingHorizontal: 16, backgroundColor: "#FFFFFF" },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.soft },
  optionTextSelected: { color: colors.primary, fontWeight: "800" },
  link: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.soft, borderRadius: 18, paddingHorizontal: 14, minHeight: 44 },
  linkText: { color: colors.text, fontSize: 14 },
  deleteButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, borderRadius: 26, borderWidth: 1.5, borderColor: colors.error, backgroundColor: "#FFFFFF", marginLeft: 60 },
  deleteText: { color: colors.error, fontSize: 16, fontWeight: "800" },
  footer: { paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8 },
  save: { flex: 0 },
});
