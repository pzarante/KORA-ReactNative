import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppTabBar from "@/src/AppTabBar";
import AuthBrand from "@/src/features/auth/presentation/components/AuthBrand";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { Project, PROJECT_STAGES } from "../../domain/entities/Project";
import { Initial, ProjectIcon, Tags, useFocusLoad, useProjectDS } from "../components/feed";
import { colors, ui } from "../components/projectUi";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatDate(iso: string) {
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function Section({ icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionIcon}>
        <MaterialCommunityIcons name={icon} size={26} color={colors.primary} />
      </View>
      <View style={styles.sectionBody}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
      </View>
    </View>
  );
}

export default function ProjectDetailScreen({ navigation, route }: { navigation: any; route: any }) {
  const project: Project = route.params.project;
  const stageIndex = PROJECT_STAGES.indexOf(project.etapa);
  const creador = project.creadorNombre || "Tú";
  const { isLoggedIn, profile } = useAuth();
  const ds = useProjectDS();
  const { data } = useFocusLoad(async () => {
    const userId = await ds.currentUserId();
    // Guests can't read Roble, so they only see the creator.
    const requests = userId && project.id ? await ds.listRequests({ proyectoId: project.id }) : [];
    return { userId, requests };
  }, [ds, project.id]);

  const userId = data?.userId ?? null;
  const isCreator = !!userId && userId === project.creadorId;
  const myRequest = data?.requests.find((r) => r.usuarioId === userId);
  const members = [creador, ...(data?.requests.filter((r) => r.estado === "aceptada").map((r) => r.usuarioNombre) ?? [])];
  const pending = data?.requests.filter((r) => r.estado === "pendiente").length ?? 0;

  const askToJoin = () => {
    if (!isLoggedIn) navigation.navigate("AccountRequired");
    else if (!profile.onboardingCompletado) navigation.navigate("CompleteProfile");
    else navigation.navigate("JoinRequest", { project });
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.container} testID="project-detail-screen">
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityLabel="Volver" onPress={() => navigation.goBack()} style={styles.roundButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <AuthBrand />
        <TouchableOpacity accessibilityLabel="Ir al inicio" onPress={() => navigation.popTo("App")} style={styles.roundButton}>
          <MaterialCommunityIcons name="home-variant-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <ProjectIcon icon={project.icono} />
          <View style={styles.heroText}>
            <Text style={styles.name}>{project.nombre}</Text>
            <Text style={styles.description}>{project.descripcion}</Text>
          </View>
        </View>
        <Tags tags={project.etiquetas} />

        <View style={styles.row}>
          <MaterialCommunityIcons name="layers-outline" size={26} color={colors.primary} />
          <View style={styles.flex}>
            <Text style={styles.small}>Etapa del proyecto</Text>
            <Text style={styles.strong}>{project.etapa}</Text>
          </View>
          <View style={styles.dots}>
            {PROJECT_STAGES.map((stage, index) => (
              <View key={stage} style={[styles.dot, index <= stageIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="account-outline" size={26} color={colors.primary} />
          <View style={styles.flex}>
            <Text style={styles.small}>Creador</Text>
            <Text style={styles.strong}>{creador}</Text>
          </View>
          <View style={styles.divider} />
          <MaterialCommunityIcons name="calendar-blank-outline" size={26} color={colors.primary} />
          <View style={styles.flex}>
            <Text style={styles.small}>Fecha de creación</Text>
            <Text style={styles.strong}>{formatDate(project.createdAt)}</Text>
          </View>
        </View>

        {project.problema ? (
          <Section icon="alert-outline" title="Problema">
            <Text style={styles.body}>{project.problema}</Text>
          </Section>
        ) : null}

        <Section icon="target" title="Objetivo general">
          <Text style={styles.body}>{project.objetivo}</Text>
          {project.alcance ? (
            <>
              <View style={styles.separator} />
              <Text style={styles.subTitle}>Alcance</Text>
              <Text style={styles.body}>{project.alcance}</Text>
            </>
          ) : null}
        </Section>

        {project.roles.length > 0 ? (
          <Section icon="account-group-outline" title="¿En qué puedes aportar?">
            <Text style={styles.body}>Estos son los roles que se necesitan para el desarrollo del proyecto.</Text>
            <View style={ui.chips}>
              {project.roles.map((role) => (
                <View key={role} style={ui.chip}>
                  <Text style={ui.chipText}>{role}</Text>
                </View>
              ))}
            </View>
          </Section>
        ) : null}

        {project.enlaces.length > 0 ? (
          <Section icon="layers-outline" title="Referencias y recursos">
            {project.enlaces.map((url) => (
              <TouchableOpacity key={url} onPress={() => Linking.openURL(url)} style={styles.link}>
                <MaterialCommunityIcons name="link-variant" size={18} color={colors.primary} />
                <Text numberOfLines={1} style={styles.linkText}>{url}</Text>
                <MaterialCommunityIcons name="open-in-new" size={18} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </Section>
        ) : null}

        <Section icon="account-group-outline" title="Equipo del proyecto">
          <Text style={styles.body}>{members.length} {members.length === 1 ? "integrante" : "integrantes"}</Text>
          <View style={styles.teamRow}>
            {members.slice(0, 4).map((name, index) => (
              <View key={`${name}-${index}`} style={index > 0 && styles.overlap}>
                <Initial name={name} />
              </View>
            ))}
            {members.length > 4 ? <Text style={styles.more}>+{members.length - 4}</Text> : null}
            <TouchableOpacity onPress={() => navigation.navigate("TeamMembers", { project })} style={styles.pill} testID="view-team-button">
              <Text style={styles.pillText}>Ver equipo</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Section>

        <TouchableOpacity onPress={() => navigation.navigate("Comments", { project })} style={styles.commentsRow} testID="view-comments-button">
          <MaterialCommunityIcons name="comment-text-multiple-outline" size={26} color={colors.primary} />
          <Text style={styles.commentsTitle}>Comentarios</Text>
          <Text style={styles.pillText}>Ver comentarios</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={colors.primary} />
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        {isCreator ? (
          <TouchableOpacity onPress={() => navigation.navigate("Requests", { project })} style={[ui.outlineButton, styles.flex]} testID="view-requests-button">
            <Text style={ui.outlineButtonText}>Ver solicitudes{pending ? ` (${pending})` : ""}</Text>
          </TouchableOpacity>
        ) : myRequest?.estado === "aceptada" ? (
          <Text style={styles.status}>Eres parte del equipo</Text>
        ) : myRequest ? (
          <Text style={styles.status}>{myRequest.estado === "pendiente" ? "Solicitud enviada, esperando respuesta" : "Tu solicitud fue rechazada"}</Text>
        ) : (
          <TouchableOpacity onPress={askToJoin} style={ui.primaryButton} testID="join-project-button">
            <Text style={ui.primaryButtonText}>Solicitar unirme</Text>
          </TouchableOpacity>
        )}
      </View>
      <AppTabBar navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  flex: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8 },
  roundButton: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  content: { padding: 20, gap: 16 },
  hero: { flexDirection: "row", gap: 16 },
  heroText: { flex: 1 },
  name: { color: colors.text, fontSize: 30, fontWeight: "800" },
  description: { color: colors.muted, fontSize: 15, marginTop: 6, lineHeight: 21 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 28, padding: 18 },
  small: { color: colors.muted, fontSize: 13 },
  strong: { color: colors.text, fontSize: 17, fontWeight: "800", marginTop: 2 },
  dots: { flexDirection: "row", gap: 4 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: "#B9AEDA" },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  divider: { width: 1, alignSelf: "stretch", backgroundColor: colors.border },
  section: { flexDirection: "row", gap: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 28, padding: 18 },
  sectionIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  sectionBody: { flex: 1, gap: 8 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
  subTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  body: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  link: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.soft, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  linkText: { flex: 1, color: colors.text, fontSize: 14 },
  teamRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4 },
  overlap: { marginLeft: -12 },
  more: { color: colors.primary, fontWeight: "800", marginLeft: 4 },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginLeft: "auto" },
  pillText: { color: colors.primary, fontSize: 14, fontWeight: "800" },
  commentsRow: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 28, padding: 18 },
  commentsTitle: { flex: 1, color: colors.text, fontSize: 18, fontWeight: "800" },
  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border },
  status: { flex: 1, color: colors.primary, fontSize: 15, fontWeight: "800", textAlign: "center", paddingVertical: 16 },
});
