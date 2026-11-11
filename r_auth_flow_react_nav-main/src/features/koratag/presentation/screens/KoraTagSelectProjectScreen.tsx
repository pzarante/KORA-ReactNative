import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { UserProfile } from "@/src/features/auth/domain/entities/UserProfile";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { Project } from "@/src/features/projects/domain/entities/Project";
import { memberCount, Message, ProjectIcon, RoundButton, useFeed, useProjectUseCases } from "@/src/features/projects/presentation/components/feed";
import BrandLogo from "@/src/shared/ui/BrandLogo";
import ButtonGradient from "@/src/shared/ui/ButtonGradient";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { ui } from "@/src/shared/ui/styles";
import { colors } from "@/src/shared/ui/tokens";

/** Figma p. 44: pick which of your projects the scanned person joins. */
export default function KoraTagSelectProjectScreen({ navigation, route }: { navigation: any; route: any }) {
  const person: UserProfile = route.params.profile;
  const { profile: me } = useAuth();
  const useCases = useProjectUseCases();
  const { data: feed, error: loadError } = useFeed();
  const [selected, setSelected] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mine = feed ? feed.projects.filter((p) => p.creadorId === feed.userId) : [];
  const isMember = (project: Project) =>
    project.creadorId === person.userId ||
    !!feed?.requests.some((r) => r.proyectoId === project.id && r.usuarioId === person.userId && r.estado === "aceptada");

  const accept = async () => {
    if (!selected || saving) return;
    setSaving(true);
    setError(null);
    try {
      // If they had already asked to join, accept that request instead of adding a second row.
      const pending = feed?.requests.find((r) => r.proyectoId === selected.id && r.usuarioId === person.userId && r.estado === "pendiente");
      if (pending) await useCases.setRequestStatus(pending.id, "aceptada");
      else await useCases.addMember({ proyectoId: selected.id, usuarioId: person.userId, usuarioNombre: person.nombreCompleto, rol: person.rol || "Integrante" });
      void useCases.notify({ para: [person.userId], tipo: "kora_tag", proyectoId: selected.id, actorNombre: me.nombreCompleto || selected.creadorNombre });
      navigation.replace("KoraTagJoined", { profile: person, project: selected });
    } catch (err: any) {
      setError(err?.message ?? "No se pudo agregar a la persona");
      setSaving(false);
    }
  };

  return (
    <ScreenSurface>
      <View style={styles.header}>
        <RoundButton icon="arrow-left" label="Volver" onPress={() => navigation.goBack()} />
        <View style={styles.brand}>
          <BrandLogo size={34} />
          <Text style={styles.brandText}>KORA</Text>
        </View>
        <View style={styles.headerSpace} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} testID="kora-tag-select-screen">
        <Text style={styles.title}>Selecciona un proyecto</Text>
        <Text style={styles.subtitle}>Elige en cuál de tus proyectos quieres incorporar a {person.nombreCompleto}.</Text>
        <Text style={styles.section}>Mis proyectos</Text>
        {loadError ? <Message text={loadError} /> : null}
        {feed && mine.length === 0 ? <Message text="Aún no has creado proyectos. Crea uno para poder sumar personas con KORA TAG." /> : null}
        {mine.map((project) => {
          const already = isMember(project);
          const active = selected?.id === project.id;
          return (
            <TouchableOpacity
              key={project.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: active, disabled: already }}
              disabled={already}
              onPress={() => setSelected(project)}
              style={[styles.card, active && styles.cardActive, already && styles.cardDisabled]}
              testID={`kora-tag-project-${project.id}`}
            >
              <ProjectIcon icon={project.icono} size={34} box={72} />
              <View style={styles.divider} />
              <View style={styles.cardText}>
                <Text numberOfLines={1} style={styles.cardName}>{project.nombre}</Text>
                <View style={styles.meta}>
                  <MaterialCommunityIcons name="account-group-outline" size={18} color={colors.primary} />
                  <Text style={styles.metaText}>{memberCount(feed!, project.id)} {memberCount(feed!, project.id) === 1 ? "integrante" : "integrantes"}</Text>
                  {project.etiquetas[0] ? <Text style={styles.tag}>{project.etiquetas[0]}</Text> : null}
                </View>
                <Text numberOfLines={2} style={styles.description}>{already ? `${person.nombreCompleto} ya es integrante.` : project.descripcion}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioDot} /> : null}</View>
            </TouchableOpacity>
          );
        })}
        {error ? <Text style={ui.error}>{error}</Text> : null}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          accessibilityState={{ disabled: !selected || saving }}
          disabled={!selected || saving}
          onPress={accept}
          style={[ui.primaryButton, styles.accept, (!selected || saving) && ui.primaryButtonDisabled]}
          testID="kora-tag-confirm"
        >
          <ButtonGradient disabled={!selected || saving} />
          <MaterialCommunityIcons name="account-multiple-plus-outline" size={24} color={selected ? "#FFFFFF" : colors.disabledText} />
          <Text style={[ui.primaryButtonText, !selected && ui.primaryButtonTextDisabled]}>{saving ? "Agregando…" : "Aceptar en este proyecto"}</Text>
        </TouchableOpacity>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingTop: 8 },
  brand: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  brandText: { color: colors.text, fontSize: 24, fontWeight: "800" },
  headerSpace: { width: 48 },
  content: { gap: 14, paddingBottom: 24 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", textAlign: "center", marginTop: 20 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 21, textAlign: "center", paddingHorizontal: 12 },
  section: { color: colors.text, fontSize: 20, fontWeight: "800", marginTop: 12 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 12, backgroundColor: "#FFFFFF" },
  cardActive: { borderColor: colors.primary, backgroundColor: "#F8F4FF" },
  cardDisabled: { opacity: 0.55 },
  divider: { width: 1, alignSelf: "stretch", backgroundColor: colors.border },
  cardText: { flex: 1, gap: 4 },
  cardName: { color: colors.text, fontSize: 17, fontWeight: "800" },
  meta: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  metaText: { color: colors.text, fontSize: 12 },
  tag: { color: colors.primary, fontSize: 11, fontWeight: "700", backgroundColor: colors.soft, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, overflow: "hidden" },
  description: { color: colors.text, fontSize: 12, lineHeight: 17 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.muted, alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary },
  footer: { paddingVertical: 14 },
  accept: { flex: 0 },
});
