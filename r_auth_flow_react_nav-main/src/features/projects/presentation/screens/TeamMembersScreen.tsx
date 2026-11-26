import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { ProfileUseCases } from "@/src/features/auth/domain/use-cases/ProfileUseCases";
import ConfirmModal from "@/src/shared/ui/ConfirmModal";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { JoinRequest, Project } from "../../domain/entities/Project";
import { Initial, TopBar, useFocusLoad, useProjectUseCases } from "../components/feed";
import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";

type Member = { id: string; requestId?: string; name: string; rol: string; creator: boolean };

export default function TeamMembersScreen({ navigation, route }: { navigation: any; route: any }) {
  const project: Project = route.params.project;
  const useCases = useProjectUseCases();
  const di = useDI();
  const profileUseCases = useMemo(() => di.resolve<ProfileUseCases>(TOKENS.ProfileUseCases), [di]);
  const [kicking, setKicking] = useState<Member | null>(null);
  const [kickError, setKickError] = useState<string | null>(null);
  const { data, error, reload } = useFocusLoad(
    async () => {
      const userId = await useCases.currentUserId();
      if (!userId) return { userId, accepted: [] as JoinRequest[], contacts: {} as Record<string, string> };
      const accepted = (await useCases.listRequests({ proyectoId: project.id })).filter((r) => r.estado === "aceptada");
      // shortcut: one getProfile per member, fine for small teams; batch into one read if teams grow.
      const ids = [project.creadorId, ...accepted.map((r) => r.usuarioId)];
      const profiles = await Promise.all(ids.map((id) => profileUseCases.getProfile(id).catch(() => null)));
      const contacts: Record<string, string> = {};
      ids.forEach((id, i) => {
        const text = [profiles[i]?.whatsapp, profiles[i]?.correoContacto].filter(Boolean).join(" · ");
        if (text) contacts[id] = text;
      });
      return { userId, accepted, contacts };
    },
    [useCases, profileUseCases, project.id],
  );
  const isCreator = !!data?.userId && data.userId === project.creadorId;
  const members: Member[] = [
    { id: project.creadorId, name: project.creadorNombre || "Creador", rol: "", creator: true },
    ...(data?.accepted ?? []).map((r) => ({ id: r.usuarioId, requestId: r.id, name: r.usuarioNombre, rol: r.rol, creator: false })),
  ];

  const kick = async () => {
    const member = kicking!;
    setKicking(null);
    setKickError(null);
    try {
      await useCases.setRequestStatus(member.requestId!, "expulsada");
      void useCases.notify({ para: [member.id], tipo: "expulsion", proyectoId: project.id, actorNombre: project.creadorNombre });
      void useCases.notify({
        para: members.filter((m) => !m.creator && m.id !== member.id).map((m) => m.id),
        tipo: "salida", proyectoId: project.id, actorNombre: member.name,
      });
      reload();
    } catch {
      setKickError("No pudimos expulsar a esta persona. Inténtalo de nuevo.");
    }
  };

  return (
    <ScreenSurface>
      <TopBar onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} testID="team-members-screen">
        <Text style={styles.title}>Equipo del proyecto</Text>
        <Text style={styles.subtitle}>Personas que están desarrollando esta iniciativa.</Text>
        <Text style={styles.count}>{members.length} {members.length === 1 ? "integrante" : "integrantes"}</Text>
        {error ? <Text style={ui.error}>{error}</Text> : null}
        {kickError ? <Text style={ui.error}>{kickError}</Text> : null}
        {members.map((member, index) => (
          <View key={`${member.id}-${index}`} style={styles.member}>
            <Initial name={member.name} size={64} />
            <View style={styles.info}>
              <View style={styles.nameLine}>
                <Text numberOfLines={1} style={styles.name}>{member.name}</Text>
                {member.creator ? (
                  <View style={ui.chip}>
                    <MaterialCommunityIcons name="crown-outline" size={16} color={colors.primary} />
                    <Text style={ui.chipText}>Creador</Text>
                  </View>
                ) : null}
              </View>
              {data?.contacts[member.id] ? <Text numberOfLines={1} style={styles.contact}>{data.contacts[member.id]}</Text> : null}
              {member.rol ? (
                <View style={styles.nameRow}>
                  <Text style={styles.rolLabel}>Rol:</Text>
                  <View style={ui.chip}>
                    <Text style={ui.chipText}>{member.rol}</Text>
                  </View>
                </View>
              ) : null}
            </View>
            {isCreator && member.requestId ? (
              <TouchableOpacity onPress={() => setKicking(member)} style={[ui.outlineButton, styles.kick]} testID={`kick-member-${member.requestId}`}>
                <Text style={ui.outlineButtonText}>Expulsar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </ScrollView>
      <ConfirmModal
        visible={!!kicking}
        icon="account-remove-outline"
        title={`¿Expulsar a ${kicking?.name ?? ""}?`}
        text="Dejará de formar parte del equipo."
        confirm="Expulsar"
        cancel="Cancelar"
        onConfirm={kick}
        onCancel={() => setKicking(null)}
      />
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
  nameLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { flexShrink: 1, color: colors.text, fontSize: 20, fontWeight: "800" },
  contact: { color: colors.muted, fontSize: 14 },
  kick: { flex: 0, alignSelf: "center", minHeight: 36, paddingHorizontal: 14 },
  rolLabel: { color: colors.muted, fontSize: 14, fontWeight: "700" },
});
