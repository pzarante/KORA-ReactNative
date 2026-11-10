import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppTabBar from "@/src/navigation/AppTabBar";
import BrandBlob from "@/src/shared/ui/BrandBlob";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { Project, PROJECT_STAGES } from "../../domain/entities/Project";
import { Initial, ProjectIcon, RoundButton, Tags, TopBar, useFocusLoad, useProjectUseCases } from "../components/feed";
import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";
import { formatDate } from "@/src/shared/utils/dates";
import ButtonGradient from "@/src/shared/ui/ButtonGradient";

/** The design shows friendly titles for links ("Plan de sostenibilidad Uninorte"), so one is derived from the URL. */
function linkTitle(url: string) {
  try {
    const parsed = new URL(url);
    const segment = parsed.pathname.split("/").filter(Boolean).pop();
    const source = segment ?? parsed.hostname.replace(/^www\./, "");
    const pretty = decodeURIComponent(source).replace(/[-_]+/g, " ").trim();
    return pretty ? pretty.replace(/\b\w/g, (char) => char.toUpperCase()) : parsed.hostname;
  } catch {
    return url;
  }
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
  const useCases = useProjectUseCases();
  const { data } = useFocusLoad(async () => {
    const userId = await useCases.currentUserId();
    // Guests can't read Roble, so they only see the creator.
    const requests = userId && project.id ? await useCases.listRequests({ proyectoId: project.id }) : [];
    return { userId, requests };
  }, [useCases, project.id]);

  const userId = data?.userId ?? null;
  const isCreator = !!userId && userId === project.creadorId;
  const myRequest = data?.requests.find((r) => r.usuarioId === userId);
  const isMember = isCreator || myRequest?.estado === "aceptada";
  const editButton = (
    <TouchableOpacity onPress={() => navigation.navigate("EditProject", { project })} style={[ui.primaryButton, styles.editButton]} testID="edit-project-button">
      <ButtonGradient />
      <MaterialCommunityIcons name="pencil-outline" size={20} color="#FFFFFF" />
      <Text style={ui.primaryButtonText}>Editar proyecto</Text>
    </TouchableOpacity>
  );
  const koraNodeButton = (
    <TouchableOpacity onPress={() => navigation.navigate("KoraNode", { project })} style={[ui.primaryButton, styles.nodeButton]} testID="kora-node-button">
      <ButtonGradient />
      <Image source={require("../../../../../assets/kora-node/device.png")} resizeMode="contain" style={styles.nodeIcon} tintColor="#FFFFFF" />
      {/* No arrow (unlike Figma): beside "Solicitudes" it doesn't fit on 360 pt phones. */}
      <Text adjustsFontSizeToFit numberOfLines={1} style={[ui.primaryButtonText, styles.nodeText]}>KORA NODE</Text>
    </TouchableOpacity>
  );
  const members = [creador, ...(data?.requests.filter((r) => r.estado === "aceptada").map((r) => r.usuarioNombre) ?? [])];
  const pending = data?.requests.filter((r) => r.estado === "pendiente").length ?? 0;

  const askToJoin = () => {
    if (!isLoggedIn) navigation.navigate("AccountRequired");
    else if (!profile.onboardingCompletado) navigation.navigate("CompleteProfile");
    else navigation.navigate("JoinRequest", { project });
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.container} testID="project-detail-screen">
      {/* Atmósfera de marca: los blobs decorativos del diseño, detrás del contenido. */}
      <BrandBlob blur={20} color="#A855F7" diameter={200} style={styles.blobTopRight} />
      <BrandBlob blur={22.5} color="#FF6B3D" diameter={220} style={styles.blobBottomLeft} />
      <View style={styles.topBar}>
        <TopBar
          onBack={() => navigation.goBack()}
          right={<RoundButton icon="home-variant-outline" label="Ir al inicio" onPress={() => navigation.popTo("App")} />}
        />
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
              <React.Fragment key={stage}>
                {index > 0 ? <View style={[styles.dash, index <= stageIndex && styles.dashActive]} /> : null}
                <View style={[styles.dot, index <= stageIndex && styles.dotActive]} />
              </React.Fragment>
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

        {project.sobre ? (
          <Section icon="lightbulb-outline" title="Sobre el proyecto">
            <Text style={styles.body}>{project.sobre}</Text>
          </Section>
        ) : null}

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
              <TouchableOpacity key={url} accessibilityLabel={linkTitle(url)} onPress={() => Linking.openURL(url)} style={styles.link}>
                <MaterialCommunityIcons name="link-variant" size={18} color={colors.primary} />
                <Text numberOfLines={1} style={styles.linkText}>{linkTitle(url)}</Text>
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
        {isMember ? (
          <View style={styles.memberActions}>
            <View style={styles.footerRow}>
              {isCreator ? (
                <TouchableOpacity onPress={() => navigation.navigate("Requests", { project })} style={[ui.outlineButton, styles.flex, styles.requestsButton]} testID="view-requests-button">
                  <Text style={ui.outlineButtonText}>Solicitudes{pending ? ` (${pending})` : ""}</Text>
                </TouchableOpacity>
              ) : null}
              {koraNodeButton}
            </View>
            {editButton}
          </View>
        ) : myRequest ? (
          <Text style={styles.status}>{myRequest.estado === "pendiente" ? "Solicitud enviada, esperando respuesta" : "Tu solicitud fue rechazada"}</Text>
        ) : !project.buscandoPersonas ? (
          <Text style={styles.status}>Este proyecto no está buscando integrantes</Text>
        ) : (
          <TouchableOpacity onPress={askToJoin} style={ui.primaryButton} testID="join-project-button">
            <ButtonGradient />
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
  topBar: { paddingHorizontal: 24 },
  content: { padding: 24, gap: 16 },
  hero: { flexDirection: "row", gap: 16 },
  heroText: { flex: 1 },
  name: { color: colors.text, fontSize: 26, lineHeight: 34, fontWeight: "800", letterSpacing: -0.5 },
  description: { color: colors.muted, fontSize: 15, marginTop: 6, lineHeight: 22 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 16, backgroundColor: colors.card },
  small: { color: colors.muted, fontSize: 13 },
  strong: { color: colors.text, fontSize: 17, fontWeight: "800", marginTop: 2 },
  dots: { flexDirection: "row", alignItems: "center" },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: "#D5C1E9", backgroundColor: "#FFFFFF" },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dash: { width: 8, height: 2, borderRadius: 1, backgroundColor: "#D5C1E9" },
  dashActive: { backgroundColor: colors.primary },
  divider: { width: 1, alignSelf: "stretch", backgroundColor: colors.border },
  section: { flexDirection: "row", gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 16, backgroundColor: colors.card },
  sectionIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  sectionBody: { flex: 1, gap: 8 },
  sectionTitle: { color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: "700" },
  subTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  body: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  link: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.soft, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  linkText: { flex: 1, color: colors.text, fontSize: 14 },
  teamRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4 },
  overlap: { marginLeft: -12 },
  more: { color: colors.primary, fontWeight: "800", marginLeft: 4 },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginLeft: "auto" },
  pillText: { color: colors.primary, fontSize: 14, fontWeight: "800" },
  commentsRow: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 16, backgroundColor: colors.card },
  commentsTitle: { flex: 1, color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: "700" },
  // No top border: the tab bar right below already draws one. White so the blobs don't show through.
  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "#FFFFFF" },
  editButton: { paddingHorizontal: 16 },
  memberActions: { flex: 1, gap: 12 },
  footerRow: { flexDirection: "row", gap: 12 },
  nodeButton: { gap: 5, paddingHorizontal: 10 },
  nodeIcon: { width: 24, height: 12 },
  nodeText: { fontSize: 15 },
  requestsButton: { paddingHorizontal: 12 },
  blobTopRight: { position: "absolute", top: -70, right: -80 },
  blobBottomLeft: { position: "absolute", bottom: 101, left: -175 },
  status: { flex: 1, color: colors.primary, fontSize: 15, fontWeight: "800", textAlign: "center", paddingVertical: 16 },
});
