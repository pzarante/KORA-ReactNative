import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { Project } from "@/src/features/projects/domain/entities/Project";
import { useConfirmLeave } from "@/src/shared/hooks/useConfirmLeave";
import ConfirmModal from "@/src/shared/ui/ConfirmModal";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { ui } from "@/src/shared/ui/styles";
import { colors } from "@/src/shared/ui/tokens";
import { Meeting, MeetingDraft } from "../../domain/entities/Meeting";
import { k, useKoraNode } from "../components/koraNode";

function RemoveButton({ label, onPress, testID }: { label: string; onPress: () => void; testID: string }) {
  return (
    <TouchableOpacity accessibilityLabel={label} onPress={onPress} style={styles.remove} testID={testID}>
      <MaterialCommunityIcons name="close" size={20} color={colors.muted} />
    </TouchableOpacity>
  );
}

function AddButton({ label, onPress, testID }: { label: string; onPress: () => void; testID: string }) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.add} testID={testID}>
      <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
      <Text style={styles.addText}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Light edit of the AI summary: title, objective, and add/remove/rewrite each agreement and next step. */
export default function EditMeetingScreen({ navigation, route }: { navigation: any; route: any }) {
  const project: Project = route.params.project;
  const meeting: Meeting = route.params.meeting;
  const koraNode = useKoraNode();
  const { profile } = useAuth();
  const initial: MeetingDraft = { titulo: meeting.titulo, objetivo: meeting.objetivo, acuerdos: meeting.acuerdos, proximosPasos: meeting.proximosPasos };
  const [draft, setDraft] = useState<MeetingDraft>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const valid = !!draft.titulo.trim();
  const { exitPending, allowLeave, confirmExit, cancelExit } = useConfirmLeave(navigation, dirty);
  const update = (patch: Partial<MeetingDraft>) => setDraft((current) => ({ ...current, ...patch }));

  const setAgreement = (index: number, text: string) => update({ acuerdos: draft.acuerdos.map((a, i) => (i === index ? text : a)) });
  const setStep = (index: number, patch: Partial<MeetingDraft["proximosPasos"][number]>) =>
    update({ proximosPasos: draft.proximosPasos.map((s, i) => (i === index ? { ...s, ...patch } : s)) });

  const save = async () => {
    if (!dirty || !valid || saving) return;
    setSaving(true);
    setError(null);
    // Empty rows are left-overs from "Agregar", not content.
    const clean: MeetingDraft = {
      titulo: draft.titulo.trim(),
      objetivo: draft.objetivo.trim(),
      acuerdos: draft.acuerdos.map((a) => a.trim()).filter(Boolean),
      proximosPasos: draft.proximosPasos.map((s) => ({ ...s, texto: s.texto.trim() })).filter((s) => s.texto),
    };
    const editadoPorNombre = profile.nombreCompleto || "Un integrante";
    try {
      await koraNode.updateMeeting(meeting.id, { ...clean, editadoPorNombre });
      allowLeave();
      navigation.popTo("MeetingNote", { project, meeting: { ...meeting, ...clean, editadoPorNombre }, justFinished: route.params.justFinished });
    } catch (err: any) {
      setError(err?.message ?? "No se pudo guardar la reunión");
      setSaving(false);
    }
  };

  return (
    <ScreenSurface scroll>
      <View style={styles.content} testID="edit-meeting-screen">
        <View style={styles.header}>
          <TouchableOpacity accessibilityLabel="Volver" onPress={() => navigation.goBack()} style={styles.back}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.flex}>
            <Text style={styles.heading}>Editar resumen</Text>
            <Text style={k.muted}>Ajusta, agrega o elimina información. El equipo verá la versión final.</Text>
          </View>
        </View>

        <View>
          <Text style={ui.label}>
            Título de la reunión <Text style={ui.required}>*</Text>
          </Text>
          <TextInput
            maxLength={80}
            onChangeText={(titulo) => update({ titulo })}
            placeholder="Ej. Seguimiento semanal"
            placeholderTextColor={colors.muted}
            style={ui.input}
            testID="meeting-title-input"
            value={draft.titulo}
          />
        </View>

        <View>
          <Text style={ui.label}>Objetivo de la sesión</Text>
          <TextInput
            multiline
            onChangeText={(objetivo) => update({ objetivo })}
            placeholder="¿Para qué se reunió el equipo?"
            placeholderTextColor={colors.muted}
            style={[ui.input, ui.textArea, styles.shortArea]}
            testID="meeting-objective-input"
            value={draft.objetivo}
          />
        </View>

        <View style={styles.group}>
          <Text style={ui.label}>Acuerdos principales</Text>
          {draft.acuerdos.map((agreement, i) => (
            <View key={i} style={styles.row}>
              <TextInput
                multiline
                onChangeText={(text) => setAgreement(i, text)}
                placeholder="Nuevo acuerdo"
                placeholderTextColor={colors.muted}
                style={[ui.input, styles.rowInput]}
                testID={`agreement-input-${i}`}
                value={agreement}
              />
              <RemoveButton label={`Eliminar acuerdo ${i + 1}`} onPress={() => update({ acuerdos: draft.acuerdos.filter((_, j) => j !== i) })} testID={`remove-agreement-${i}`} />
            </View>
          ))}
          <AddButton label="Agregar acuerdo" onPress={() => update({ acuerdos: [...draft.acuerdos, ""] })} testID="add-agreement" />
        </View>

        <View style={styles.group}>
          <Text style={ui.label}>Próximos pasos</Text>
          {draft.proximosPasos.map((step, i) => (
            <View key={i} style={styles.row}>
              <TouchableOpacity
                accessibilityRole="checkbox"
                accessibilityState={{ checked: step.hecho }}
                accessibilityLabel={`Paso ${i + 1} hecho`}
                onPress={() => setStep(i, { hecho: !step.hecho })}
                style={styles.check}
                testID={`step-check-${i}`}
              >
                <MaterialCommunityIcons name={step.hecho ? "checkbox-marked" : "checkbox-blank-outline"} size={24} color={step.hecho ? colors.primary : colors.muted} />
              </TouchableOpacity>
              <TextInput
                multiline
                onChangeText={(texto) => setStep(i, { texto })}
                placeholder="Nuevo paso (Responsable: …)"
                placeholderTextColor={colors.muted}
                style={[ui.input, styles.rowInput]}
                testID={`step-input-${i}`}
                value={step.texto}
              />
              <RemoveButton label={`Eliminar paso ${i + 1}`} onPress={() => update({ proximosPasos: draft.proximosPasos.filter((_, j) => j !== i) })} testID={`remove-step-${i}`} />
            </View>
          ))}
          <AddButton label="Agregar paso" onPress={() => update({ proximosPasos: [...draft.proximosPasos, { texto: "", hecho: false }] })} testID="add-step" />
        </View>

        {!valid ? <Text style={ui.helper}>El título no puede quedar vacío.</Text> : null}
        {error ? <Text style={ui.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={ui.outlineButton}>
            <Text style={ui.outlineButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!dirty || !valid || saving}
            onPress={save}
            style={[ui.primaryButton, (!dirty || !valid || saving) && ui.primaryButtonDisabled]}
            testID="save-meeting-button"
          >
            <Text style={[ui.primaryButtonText, (!dirty || !valid || saving) && ui.primaryButtonTextDisabled]}>{saving ? "Guardando…" : "Guardar cambios"}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ConfirmModal
        visible={exitPending}
        icon="file-document-edit-outline"
        title="¿Salir sin guardar los cambios?"
        text="Perderás lo que cambiaste en el resumen de la reunión."
        confirm="Sí, salir sin guardar"
        cancel="Seguir editando"
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  content: { gap: 22, paddingTop: 8, paddingBottom: 32 },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  back: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  heading: { color: colors.text, fontSize: 26, lineHeight: 34, fontWeight: "800", letterSpacing: -0.5 },
  shortArea: { minHeight: 90 },
  group: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowInput: { flex: 1, paddingVertical: 14 },
  check: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  remove: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  add: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", minHeight: 44, paddingHorizontal: 4 },
  addText: { color: colors.primary, fontSize: 15, fontWeight: "800" },
  actions: { flexDirection: "row", gap: 12 },
});
