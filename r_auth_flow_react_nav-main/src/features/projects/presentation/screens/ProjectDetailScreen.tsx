import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuthBrand from "@/src/features/auth/presentation/components/AuthBrand";
import { Project, PROJECT_STAGES } from "../../domain/entities/Project";
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

  return (
    <SafeAreaView style={styles.container} testID="project-detail-screen">
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
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name={project.icono as any} size={64} color={colors.primary} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.name}>{project.nombre}</Text>
            <Text style={styles.description}>{project.descripcion}</Text>
          </View>
        </View>
        {project.etiquetas.length > 0 ? (
          <View style={ui.chips}>
            {project.etiquetas.map((tag, index) => (
              <View key={tag} style={[ui.chip, index % 2 === 1 && styles.orangeChip]}>
                <Text style={[ui.chipText, index % 2 === 1 && styles.orangeText]}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

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
          <Text style={styles.body}>1 integrante</Text>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{creador.charAt(0).toUpperCase()}</Text>
          </View>
        </Section>
      </ScrollView>
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
  heroIcon: { width: 110, height: 110, borderRadius: 32, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  heroText: { flex: 1 },
  name: { color: colors.text, fontSize: 30, fontWeight: "800" },
  description: { color: colors.muted, fontSize: 15, marginTop: 6, lineHeight: 21 },
  orangeChip: { backgroundColor: colors.orangeSoft },
  orangeText: { color: colors.orange },
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
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.primary, fontSize: 18, fontWeight: "800" },
});
