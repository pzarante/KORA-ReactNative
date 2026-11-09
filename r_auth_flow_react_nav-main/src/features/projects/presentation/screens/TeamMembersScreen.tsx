import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { Project } from "../../domain/entities/Project";
import { Initial, TopBar, useFocusLoad, useProjectUseCases } from "../components/feed";
import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";

export default function TeamMembersScreen({ navigation, route }: { navigation: any; route: any }) {
  const project: Project = route.params.project;
  const useCases = useProjectUseCases();
  const { data: accepted, error } = useFocusLoad(
    async () => ((await useCases.currentUserId()) ? (await useCases.listRequests({ proyectoId: project.id })).filter((r) => r.estado === "aceptada") : []),
    [useCases, project.id],
  );
  const members = [
    { name: project.creadorNombre || "Creador", rol: "", creator: true },
    ...(accepted ?? []).map((r) => ({ name: r.usuarioNombre, rol: r.rol, creator: false })),
  ];

  return (
    <ScreenSurface>
      <TopBar onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} testID="team-members-screen">
        <Text style={styles.title}>Equipo del proyecto</Text>
        <Text style={styles.subtitle}>Personas que están desarrollando esta iniciativa.</Text>
        <Text style={styles.count}>{members.length} {members.length === 1 ? "integrante" : "integrantes"}</Text>
        {error ? <Text style={ui.error}>{error}</Text> : null}
        {members.map((member, index) => (
          <View key={`${member.name}-${index}`} style={styles.member}>
            <Initial name={member.name} size={64} />
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{member.name}</Text>
                {member.creator ? (
                  <View style={ui.chip}>
                    <MaterialCommunityIcons name="crown-outline" size={16} color={colors.primary} />
                    <Text style={ui.chipText}>Creador</Text>
                  </View>
                ) : null}
              </View>
              {member.rol ? (
                <View style={styles.nameRow}>
                  <Text style={styles.rolLabel}>Rol:</Text>
                  <View style={ui.chip}>
                    <Text style={ui.chipText}>{member.rol}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center", marginTop: 16 },
  subtitle: { color: colors.muted, fontSize: 15, textAlign: "center", marginTop: 8 },
  count: { color: colors.text, fontSize: 24, fontWeight: "800", marginTop: 28, marginBottom: 8 },
  member: { flexDirection: "row", gap: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  info: { flex: 1, gap: 8, justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  name: { color: colors.text, fontSize: 20, fontWeight: "800" },
  rolLabel: { color: colors.muted, fontSize: 14, fontWeight: "700" },
});
