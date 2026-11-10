import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { Project } from "@/src/features/projects/domain/entities/Project";
import { useProjectUseCases } from "@/src/features/projects/presentation/components/feed";
import { useConfirmLeave } from "@/src/shared/hooks/useConfirmLeave";
import ConfirmModal from "@/src/shared/ui/ConfirmModal";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { ui } from "@/src/shared/ui/styles";
import { colors } from "@/src/shared/ui/tokens";
import { InfoCard, k, KoraNodeHeader, StatusPill, useKoraNode } from "../components/koraNode";
import ButtonGradient from "@/src/shared/ui/ButtonGradient";

const clock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

/** The device is "listening": a timer that can pause, then "Finalizar" turns the meeting into shared notes. */
export default function MeetingInProgressScreen({ navigation, route }: { navigation: any; route: any }) {
  const project: Project = route.params.project;
  const koraNode = useKoraNode();
  const projects = useProjectUseCases();
  const { profile } = useAuth();
  const startedAt = useRef(new Date().toISOString());
  const mounted = useRef(true);
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Leaving mid-meeting would lose it, so back/swipe ask first.
  const { exitPending, allowLeave, confirmExit, cancelExit } = useConfirmLeave(navigation, true);

  useEffect(() => () => void (mounted.current = false), []);

  useEffect(() => {
    if (paused || finishing) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [paused, finishing]);

  const finish = async () => {
    setFinishing(true);
    setError(null);
    try {
      const accepted = (await projects.listRequests({ proyectoId: project.id })).filter((r) => r.estado === "aceptada");
      const autor = profile.nombreCompleto || "Un integrante";
      const meeting = await koraNode.finishMeeting({
        proyectoId: project.id,
        proyectoNombre: project.nombre,
        etapa: project.etapa,
        integrantes: [project.creadorNombre, ...accepted.map((r) => r.usuarioNombre)].filter(Boolean),
        inicio: startedAt.current,
        fin: new Date().toISOString(),
        creadorNombre: autor,
      });
      void projects.notify({
        para: [project.creadorId, ...accepted.map((r) => r.usuarioId)],
        tipo: "reunion",
        proyectoId: project.id,
        actorNombre: autor,
        detalle: meeting.titulo,
      });
      // Already saved: if the person left meanwhile, the notes simply wait in the history.
      if (!mounted.current) return;
      allowLeave();
      navigation.replace("MeetingNote", { project, meeting, justFinished: true });
    } catch (err: any) {
      if (!mounted.current) return;
      setError(err?.message ?? "No se pudo guardar el resumen de la reunión");
      setFinishing(false);
    }
  };

  return (
    <ScreenSurface scroll>
      {finishing ? (
        <View style={styles.content} testID="meeting-generating">
          <KoraNodeHeader onBack={() => navigation.goBack()} badge="mic" />
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={k.title}>Generando resumen…</Text>
          <Text style={k.lead}>KORA NODE está organizando los acuerdos y próximos pasos de tu equipo.</Text>
        </View>
      ) : (
        <View style={styles.content} testID="meeting-in-progress-screen">
          <KoraNodeHeader onBack={() => navigation.goBack()} badge={paused ? "mic" : "live"} />
          <Text style={k.title}>{paused ? "Reunión en pausa" : "Reunión en curso"}</Text>
          <StatusPill label={paused ? "Escucha en pausa" : "Modo escucha activo"} color={paused ? colors.border : undefined} />
          <Text style={styles.clock} accessibilityLabel={`Tiempo de reunión ${clock(seconds)}`}>{clock(seconds)}</Text>
          <Text style={k.lead}>
            {paused ? "KORA NODE dejó de escuchar. Reanuda cuando el equipo quiera continuar." : "KORA NODE está registrando la conversación de tu equipo."}
          </Text>
          <InfoCard
            accent
            icon="forum-outline"
            title="Puedes hacerle preguntas en tiempo real"
            text="KORA NODE responde sobre el proyecto, los acuerdos y los avances de la reunión."
          />
          {error ? <Text style={k.error}>{error}</Text> : null}
          <TouchableOpacity onPress={() => setPaused((p) => !p)} style={[ui.primaryButton, styles.button]} testID="pause-meeting-button">
            <ButtonGradient />
            <Text style={ui.primaryButtonText}>{paused ? "Reanudar reunión" : "Pausar reunión"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={finish} style={ui.outlineButton} testID="finish-meeting-button">
            <Text style={ui.outlineButtonText}>Finalizar reunión</Text>
          </TouchableOpacity>
        </View>
      )}
      <ConfirmModal
        visible={exitPending}
        icon="microphone-off"
        title="¿Salir de la reunión?"
        text="KORA NODE dejará de escuchar y no se guardará el resumen de esta reunión."
        confirm="Sí, salir sin guardar"
        cancel="Seguir en la reunión"
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, paddingBottom: 32 },
  clock: { color: colors.primary, fontSize: 44, fontWeight: "800", textAlign: "center", fontVariant: ["tabular-nums"] },
  button: { flex: 0 },
});
