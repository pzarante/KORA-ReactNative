import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AccountPrompt from "@/src/features/auth/presentation/components/AccountPrompt";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { openCreate } from "@/src/navigation/tabs";
import ButtonGradient from "@/src/shared/ui/ButtonGradient";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { ui } from "@/src/shared/ui/styles";
import { colors } from "@/src/shared/ui/tokens";
import { Project } from "../../domain/entities/Project";
import { commentCount, Message, ProjectIcon, Tags, TopBar, memberCount, useFeed, useFocusLoad, useProjectUseCases } from "../components/feed";

type Tab = "mine" | "joined" | "saved" | "requests";

// Figma p. 35–38: two rows of two pills.
const TABS: { key: Tab; label: string }[] = [
  { key: "mine", label: "Mis proyectos" },
  { key: "joined", label: "Participando" },
  { key: "saved", label: "Guardados" },
  { key: "requests", label: "Solicitudes" },
];

const EMPTY: Record<Tab, string> = {
  mine: "Aún no has creado proyectos.",
  joined: "Todavía no participas en otros proyectos.",
  saved: "Guarda proyectos desde su detalle para verlos aquí.",
  requests: "No tienes solicitudes pendientes.",
};

const STATUS = { pendiente: "Pendiente", rechazada: "Rechazada", aceptada: "Aceptada" };

/** Card of the Mis Proyectos lists: icon, name, tags, members and comments, and an optional status. */
function MyProjectCard({ project, members, comments, status, highlighted, onPress }: {
  project: Project; members: number; comments: number; status?: string; highlighted?: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, highlighted && styles.cardHighlighted]} testID={`my-project-${project.id}`}>
      <ProjectIcon icon={project.icono} size={26} box={52} background={highlighted ? "#FFFFFF" : undefined} />
      <View style={styles.cardText}>
        <Text numberOfLines={1} style={styles.cardName}>{project.nombre}</Text>
        <Tags tags={project.etiquetas.slice(0, 2)} small onTint={highlighted} />
        <View style={styles.counts}>
          <MaterialCommunityIcons name="account-group-outline" size={18} color={colors.muted} />
          <Text style={styles.count}>{members}</Text>
          <MaterialCommunityIcons name="comment-outline" size={16} color={colors.muted} />
          <Text style={styles.count}>{comments}</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={26} color={colors.text} />
      {status ? (
        <View style={styles.status}>
          <MaterialCommunityIcons name={status === "Rechazada" ? "close-circle-outline" : "clock-outline"} size={14} color={colors.text} />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

function Logged({ navigation }: { navigation: any }) {
  const { isLoggedIn } = useAuth();
  const useCases = useProjectUseCases();
  const { data: feed, error } = useFeed();
  const { data: savedIds } = useFocusLoad(() => useCases.listSaved().catch(() => [] as string[]), [useCases]);
  const [tab, setTab] = useState<Tab>("mine");

  const byId = new Map((feed?.projects ?? []).map((p) => [p.id, p]));
  const mine = feed ? feed.requests.filter((r) => r.usuarioId === feed.userId) : [];
  const lists: Record<Tab, { project: Project; status?: string; key: string }[]> = {
    mine: (feed?.projects ?? []).filter((p) => p.creadorId === feed?.userId).map((project) => ({ project, key: project.id })),
    joined: mine.filter((r) => r.estado === "aceptada" && byId.has(r.proyectoId)).map((r) => ({ project: byId.get(r.proyectoId)!, key: r.id })),
    saved: (savedIds ?? []).filter((id) => byId.has(id)).map((id) => ({ project: byId.get(id)!, key: id })),
    requests: mine.filter((r) => r.estado !== "aceptada" && byId.has(r.proyectoId)).map((r) => ({ project: byId.get(r.proyectoId)!, status: STATUS[r.estado], key: r.id })),
  };

  return (
    <ScrollView contentContainerStyle={styles.content} testID="my-projects-screen" showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Proyectos</Text>
      <Text style={styles.subtitle}>Gestiona tus iniciativas y conecta con personas que quieren aportar.</Text>

      <View style={styles.tabs}>
        {TABS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === key }}
            onPress={() => setTab(key)}
            style={[styles.tab, tab === key && styles.tabActive]}
            testID={`my-projects-tab-${key}`}
          >
            {tab === key ? <ButtonGradient radius={24} /> : null}
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={() => openCreate(navigation, isLoggedIn)} style={[ui.primaryButton, styles.create]} testID="my-projects-create">
        <ButtonGradient />
        <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
        <Text style={ui.primaryButtonText}>Crear nuevo proyecto</Text>
      </TouchableOpacity>

      {error ? <Message text={error} /> : null}
      {feed && lists[tab].length === 0 ? <Message text={EMPTY[tab]} /> : null}
      {feed
        ? lists[tab].map(({ project, status, key }) => (
            <MyProjectCard
              key={key}
              project={project}
              members={memberCount(feed, project.id)}
              comments={commentCount(feed, project.id)}
              status={status}
              highlighted={tab === "mine"}
              onPress={() => navigation.navigate("ProjectDetail", { project })}
            />
          ))
        : null}
    </ScrollView>
  );
}

export default function MyProjectsScreen({ navigation }: { navigation: any }) {
  const { isLoggedIn } = useAuth();
  return (
    <ScreenSurface>
      <TopBar />
      {isLoggedIn ? (
        <Logged navigation={navigation} />
      ) : (
        <View style={styles.flex}>
          <AccountPrompt
            title="Tus proyectos en un solo lugar"
            text="Crea una cuenta para crear proyectos, unirte a otros y seguir tus solicitudes."
            primaryLabel="Crear cuenta"
            onPrimary={() => navigation.navigate("Signup")}
            secondaryLabel="Ya tengo una cuenta"
            onSecondary={() => navigation.navigate("Login")}
          />
        </View>
      )}
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: 14, paddingBottom: 32 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", marginTop: 16 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 21, marginTop: -6 },
  tabs: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10, marginTop: 6 },
  tab: { width: "48.5%", minHeight: 40, borderRadius: 24, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  tabActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  tabText: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: "#FFFFFF", fontWeight: "700" },
  create: { flex: 0, marginTop: 4, marginBottom: 6 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: colors.border,
    borderRadius: 26, paddingVertical: 18, paddingHorizontal: 18, backgroundColor: colors.card,
  },
  cardHighlighted: { backgroundColor: colors.soft, borderColor: "#D9CBF3" },
  cardText: { flex: 1, gap: 6 },
  cardName: { color: colors.text, fontSize: 17, fontWeight: "800" },
  counts: { flexDirection: "row", alignItems: "center", gap: 4 },
  count: { color: colors.muted, fontSize: 13, fontWeight: "600", marginRight: 8 },
  status: {
    position: "absolute", top: 12, right: 16, flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: colors.orangeSoft, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3,
  },
  statusText: { color: colors.text, fontSize: 12, fontWeight: "700" },
});
