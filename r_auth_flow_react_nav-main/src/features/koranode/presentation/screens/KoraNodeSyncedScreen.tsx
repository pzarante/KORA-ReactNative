import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Project } from "@/src/features/projects/domain/entities/Project";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { colors } from "@/src/shared/ui/tokens";
import { k, KoraNodeHeader, WideButton } from "../components/koraNode";

const NEXT = [
  { icon: "forum-outline", text: "Registra y centraliza las conversaciones del equipo." },
  { icon: "creation", text: "Recibe resúmenes, conclusiones y próximos pasos con IA." },
  { icon: "account-group-outline", text: "Comparte las notas con todo el equipo del proyecto." },
];

export default function KoraNodeSyncedScreen({ navigation, route }: { navigation: any; route: any }) {
  const project: Project = route.params.project;
  const toHub = () => navigation.popTo("KoraNode", { project });

  return (
    <ScreenSurface scroll>
      <View style={styles.content} testID="kora-node-synced-screen">
        <KoraNodeHeader onBack={toHub} badge="check" />
        <View>
          <Text style={k.title}>¡Sincronización exitosa!</Text>
          <Text style={[k.lead, styles.lead]}>Tu KORA NODE ya está vinculado con el proyecto.</Text>
        </View>

        <TouchableOpacity accessibilityRole="button" onPress={() => navigation.popTo("ProjectDetail", { project })} style={styles.project}>
          <View style={styles.projectIcon}>
            <MaterialCommunityIcons name="link-variant" size={28} color={colors.primary} />
          </View>
          <View style={styles.divider} />
          <View style={styles.flex}>
            <Text style={k.muted}>Proyecto sincronizado</Text>
            <Text numberOfLines={1} style={styles.projectName}>{project.nombre}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={26} color={colors.primary} />
        </TouchableOpacity>

        <View style={k.card}>
          <Text style={k.cardTitle}>¿Qué sigue?</Text>
          <Text style={k.body}>Ahora puedes trabajar con tu equipo, registrar conversaciones y dejar que la IA de KORA NODE organice y resuma sus ideas.</Text>
          {NEXT.map((item) => (
            <View key={item.icon} style={styles.nextRow}>
              <View style={styles.nextIcon}>
                <MaterialCommunityIcons name={item.icon as any} size={26} color={colors.primary} />
              </View>
              <Text style={[k.body, styles.flex]}>{item.text}</Text>
            </View>
          ))}
        </View>

        <WideButton icon="check-circle-outline" label="Continuar" onPress={toHub} testID="kora-node-continue" />
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20, paddingBottom: 32 },
  flex: { flex: 1 },
  lead: { marginTop: 8 },
  project: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.soft, borderRadius: 28, padding: 16 },
  projectIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  divider: { width: 1, alignSelf: "stretch", backgroundColor: colors.border },
  projectName: { color: colors.text, fontSize: 20, fontWeight: "800", marginTop: 2 },
  nextRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  nextIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
});
