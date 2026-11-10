import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { Project } from "@/src/features/projects/domain/entities/Project";
import { useFocusLoad } from "@/src/shared/hooks/useFocusLoad";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { colors } from "@/src/shared/ui/tokens";
import { Chip, InfoCard, k, KoraNodeHeader, StatusPill, StepsCard, useKoraNode, WideButton } from "../components/koraNode";

/** Entry point from the project: links the device the first time, then it is the hub to start meetings. */
export default function KoraNodeScreen({ navigation, route }: { navigation: any; route: any }) {
  const project: Project = route.params.project;
  const koraNode = useKoraNode();
  // Wrapped in an object so "no link yet" (null) is not mistaken for "still loading".
  const { data, error, reload } = useFocusLoad(async () => ({ link: await koraNode.getLink(project.id) }), [koraNode, project.id]);

  return (
    <ScreenSurface scroll>
      <View style={styles.content} testID="kora-node-screen">
        {error ? (
          <>
            <KoraNodeHeader onBack={() => navigation.goBack()} />
            <Text style={k.error}>{error}</Text>
            <TouchableOpacity onPress={reload}>
              <Text style={styles.link}>Reintentar</Text>
            </TouchableOpacity>
          </>
        ) : !data ? (
          <>
            <KoraNodeHeader onBack={() => navigation.goBack()} />
            <ActivityIndicator color={colors.primary} />
          </>
        ) : data.link ? (
          <Hub navigation={navigation} project={project} />
        ) : (
          <Sync navigation={navigation} project={project} />
        )}
      </View>
    </ScreenSurface>
  );
}

function Sync({ navigation, project }: { navigation: any; project: Project }) {
  const koraNode = useKoraNode();
  const { profile } = useAuth();
  const code = koraNode.syncCode(project.id);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // The device is simulated: it "hears" the code a few seconds after the screen opens.
  useEffect(() => {
    let active = true;
    setError(null);
    koraNode
      .syncDevice(project.id, profile.nombreCompleto || "Un integrante")
      .then(() => active && navigation.navigate("KoraNodeSynced", { project }))
      .catch((err) => active && setError(err?.message ?? "No se pudo vincular el KORA NODE"));
    return () => {
      active = false;
    };
  }, [koraNode, project, profile.nombreCompleto, navigation, attempt]);

  return (
    <>
      <KoraNodeHeader onBack={() => navigation.goBack()} subtitle="Conecta tu proyecto y comienza a trabajar con tu asistente inteligente." />

      <View style={k.card}>
        <Text style={k.cardTitle}>Sincroniza tu proyecto</Text>
        <Text style={k.body}>Vincula KORA NODE con tu proyecto para que pueda registrar, organizar y acompañar el trabajo de tu equipo.</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>Tu código de sincronización</Text>
          <View style={styles.codeRow}>
            <Text selectable style={styles.code} testID="kora-node-code">{code}</Text>
            <TouchableOpacity accessibilityLabel="Compartir código" onPress={() => Share.share({ message: code })} style={styles.codeShare}>
              <MaterialCommunityIcons name="share-variant-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <StepsCard
        title="¿Cómo sincronizarlo?"
        steps={[
          "Enciende tu KORA NODE.",
          <View key="mic" style={styles.inline}>
            <Text style={styles.stepText}>Presiona el botón del micrófono</Text>
            <View style={styles.micBubble}>
              <MaterialCommunityIcons name="microphone-outline" size={20} color={colors.primary} />
            </View>
          </View>,
          <>
            <Text style={styles.stepText}>Dicta el código de sincronización:</Text>
            <Chip text={code} />
          </>,
          "Espera la confirmación de conexión en la app.",
        ]}
      />

      {error ? (
        <View style={styles.waiting}>
          <Text style={k.error}>{error}</Text>
          <TouchableOpacity onPress={() => setAttempt((n) => n + 1)}>
            <Text style={styles.link}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.waiting} testID="kora-node-waiting">
          <ActivityIndicator color={colors.primary} />
          <Text style={k.muted}>Esperando la confirmación de tu KORA NODE…</Text>
        </View>
      )}
    </>
  );
}

function Hub({ navigation, project }: { navigation: any; project: Project }) {
  return (
    <>
      <KoraNodeHeader onBack={() => navigation.goBack()} badge="check" />
      <StatusPill label="Sincronizado" />
      <Text style={k.lead}>Tu KORA NODE está conectado y listo para iniciar una reunión.</Text>
      <InfoCard icon="information-outline" title="Una vez inicies, KORA NODE" text="estará en estado de escucha. Puedes hablar con naturalidad junto a tu equipo." />
      <StepsCard
        title="¿Cómo iniciarla?"
        steps={[
          "Pulsa el botón de Iniciar reunión.",
          <>
            <Text style={styles.stepText}>KORA NODE dirá</Text>
            <Chip text="“Listo para iniciar modo escucha”." />
          </>,
          "Comienza la reunión diciendo el objetivo de la sesión.",
        ]}
      />
      <WideButton icon="microphone-outline" label="Iniciar reunión" onPress={() => navigation.navigate("MeetingInProgress", { project })} testID="start-meeting-button" />
      <WideButton icon="file-document-outline" label="Historial de reuniones" onPress={() => navigation.navigate("MeetingHistory", { project })} outline testID="meeting-history-button" />
    </>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20, paddingBottom: 32 },
  link: { color: colors.primary, fontWeight: "800", textAlign: "center", textDecorationLine: "underline", padding: 12 },
  codeBox: { backgroundColor: colors.soft, borderRadius: 24, padding: 16, gap: 10, marginTop: 4 },
  codeLabel: { color: colors.text, fontSize: 14, textAlign: "center" },
  codeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  code: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, paddingVertical: 10, color: colors.primary, fontSize: 28, fontWeight: "800", textAlign: "center", letterSpacing: 1 },
  codeShare: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  inline: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  stepText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  micBubble: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  waiting: { alignItems: "center", gap: 8 },
});
