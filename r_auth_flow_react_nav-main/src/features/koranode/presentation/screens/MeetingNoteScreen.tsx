import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Project } from "@/src/features/projects/domain/entities/Project";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { ui } from "@/src/shared/ui/styles";
import { colors } from "@/src/shared/ui/tokens";
import { formatRange } from "@/src/shared/utils/dates";
import { Meeting } from "../../domain/entities/Meeting";
import { InfoCard, k, KoraNodeHeader, useKoraNode } from "../components/koraNode";
import ButtonGradient from "@/src/shared/ui/ButtonGradient";

function Section({ icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <MaterialCommunityIcons name={icon} size={26} color={colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.box}>{children}</View>
    </View>
  );
}

/**
 * The shared notes of one meeting. Right after "Finalizar" it is the "Reunión finalizada" screen;
 * from the history it is the detail. Any member can tick the next steps for everyone.
 */
export default function MeetingNoteScreen({ navigation, route }: { navigation: any; route: any }) {
  const project: Project = route.params.project;
  const justFinished: boolean = !!route.params.justFinished;
  const koraNode = useKoraNode();
  const [meeting, setMeeting] = useState<Meeting>(route.params.meeting);
  const [error, setError] = useState<string | null>(null);

  // EditMeeting comes back with the saved notes in the params.
  useEffect(() => setMeeting(route.params.meeting), [route.params.meeting]);

  const toggleStep = async (index: number) => {
    const before = meeting;
    const proximosPasos = meeting.proximosPasos.map((step, i) => (i === index ? { ...step, hecho: !step.hecho } : step));
    setMeeting({ ...meeting, proximosPasos });
    setError(null);
    try {
      await koraNode.updateMeeting(meeting.id, { proximosPasos });
    } catch (err: any) {
      setMeeting(before);
      setError(err?.message ?? "No se pudo actualizar el paso");
    }
  };

  const credits = [`Creada por ${meeting.creadorNombre || "el equipo"}`, meeting.editadoPorNombre && `editada por ${meeting.editadoPorNombre}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <ScreenSurface scroll>
      <View style={styles.content} testID="meeting-note-screen">
        <KoraNodeHeader onBack={() => navigation.goBack()} device={false} />
        {justFinished ? (
          <View>
            <Text style={k.title}>Reunión finalizada</Text>
            <Text style={[k.lead, styles.lead]}>KORA NODE generó un resumen de la sesión.</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.docIcon}>
              <MaterialCommunityIcons name="file-document-outline" size={30} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.title} testID="meeting-note-title">{meeting.titulo}</Text>
              <Text style={k.muted}>{formatRange(meeting.inicio, meeting.fin)}</Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => navigation.navigate("EditMeeting", { project, meeting, justFinished })}
              style={styles.edit}
              testID="edit-meeting-button"
            >
              <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.primary} />
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inner}>
            {meeting.objetivo ? (
              <Section icon="bullseye-arrow" title="Objetivo de la sesión">
                <Text style={k.body}>{meeting.objetivo}</Text>
              </Section>
            ) : null}
            {meeting.acuerdos.length > 0 ? (
              <Section icon="checkbox-marked-outline" title="Acuerdos principales">
                {meeting.acuerdos.map((agreement, i) => (
                  <View key={i} style={styles.bullet}>
                    <View style={styles.dot} />
                    <Text style={[k.body, styles.flex]}>{agreement}</Text>
                  </View>
                ))}
              </Section>
            ) : null}
            {meeting.proximosPasos.length > 0 ? (
              <Section icon="format-list-checks" title="Próximos pasos">
                {meeting.proximosPasos.map((step, i) => (
                  <TouchableOpacity
                    key={i}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: step.hecho }}
                    onPress={() => toggleStep(i)}
                    style={styles.step}
                    testID={`meeting-step-${i}`}
                  >
                    <MaterialCommunityIcons name={step.hecho ? "checkbox-marked" : "checkbox-blank-outline"} size={22} color={step.hecho ? colors.primary : colors.muted} />
                    <Text style={[k.body, styles.flex, step.hecho && styles.done]}>{step.texto}</Text>
                  </TouchableOpacity>
                ))}
              </Section>
            ) : null}
          </View>
          <Text style={styles.credits}>{credits}</Text>
        </View>

        {error ? <Text style={k.error}>{error}</Text> : null}

        {justFinished ? (
          <>
            <InfoCard accent icon="pencil-outline" title="Puedes editar el resumen" text="Ajusta, agrega o elimina información. Todo el equipo verá la versión final en el historial." />
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => navigation.navigate("MeetingHistory", { project })} style={[ui.outlineButton, styles.flex]} testID="note-history-button">
                <Text style={ui.outlineButtonText}>Ver historial</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.popTo("KoraNode", { project })} style={ui.primaryButton} testID="note-done-button">
                <ButtonGradient />
                <Text style={ui.primaryButtonText}>Listo</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20, paddingBottom: 32 },
  flex: { flex: 1 },
  lead: { marginTop: 8 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 28, padding: 12, backgroundColor: colors.card, gap: 12 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 12, padding: 4 },
  docIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  title: { color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: "800" },
  edit: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.soft, borderRadius: 20, paddingHorizontal: 14, minHeight: 44 },
  editText: { color: colors.primary, fontSize: 15, fontWeight: "800" },
  inner: { borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 16, gap: 18, backgroundColor: "#FFFFFF" },
  section: { gap: 10 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: "800" },
  box: { backgroundColor: colors.soft, borderRadius: 16, padding: 14, gap: 8 },
  bullet: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 8 },
  step: { flexDirection: "row", alignItems: "flex-start", gap: 10, minHeight: 32 },
  done: { color: colors.muted, textDecorationLine: "line-through" },
  credits: { color: colors.muted, fontSize: 13, textAlign: "center", paddingBottom: 4 },
  actions: { flexDirection: "row", gap: 12 },
});
