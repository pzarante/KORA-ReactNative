import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import ProjectStepLayout from "../components/ProjectStepLayout";
import { colors, ui } from "../components/projectUi";
import { useCreateProject } from "../context/createProjectContext";

const VISIBLE_ROLES = 3;

function ReviewCard({ icon, title, onEdit, children }: { icon: any; title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardIcon}>
        <MaterialCommunityIcons name={icon} size={28} color={colors.primary} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        {children}
      </View>
      <TouchableOpacity accessibilityLabel={`Editar ${title}`} onPress={onEdit} style={styles.edit}>
        <MaterialCommunityIcons name="pencil-outline" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

export default function ProjectReviewScreen({ navigation }: { navigation: any }) {
  const { draft, create, saving, error } = useCreateProject();
  const edit = (screen: string) => navigation.navigate(screen, { fromReview: true });
  const extraRoles = draft.roles.length - VISIBLE_ROLES;

  const submit = async () => {
    const project = await create();
    if (project) navigation.reset({ index: 0, routes: [{ name: "ProjectCreated", params: { project } }] });
  };

  return (
    <ProjectStepLayout title="Revisar proyecto" nextLabel={saving ? "Creando..." : "Crear proyecto"} nextDisabled={saving} onNext={submit}>
      <Text style={styles.intro}>Verifica los datos de tu propuesta antes de publicarla en la comunidad universitaria.</Text>

      <ReviewCard icon="file-document-outline" title="Información básica" onEdit={() => edit("ProjectBasicInfo")}>
        <View style={styles.nameRow}>
          <MaterialCommunityIcons name={draft.icono as any} size={18} color={colors.primary} />
          <Text style={styles.value}>{draft.nombre}</Text>
        </View>
        <Text style={styles.muted} numberOfLines={3}>{draft.descripcion}</Text>
        {draft.etiquetas.length > 0 ? <Text style={styles.muted}>#{draft.etiquetas.join("  #")}</Text> : null}
      </ReviewCard>

      <ReviewCard icon="alert-outline" title="Problema" onEdit={() => edit("ProjectProblem")}>
        <Text style={styles.muted} numberOfLines={3}>{draft.problema || "Sin definir"}</Text>
      </ReviewCard>

      <ReviewCard icon="target" title="Objetivo y Alcance" onEdit={() => edit("ProjectGoal")}>
        <Text style={styles.muted} numberOfLines={3}>{draft.objetivo}</Text>
        {draft.alcance ? <Text style={styles.muted} numberOfLines={2}>{draft.alcance}</Text> : null}
      </ReviewCard>

      <ReviewCard icon="layers-outline" title="Etapa" onEdit={() => edit("ProjectStage")}>
        <View style={ui.chips}>
          <View style={ui.chip}>
            <Text style={ui.chipText}>{draft.etapa.toUpperCase()}</Text>
          </View>
        </View>
      </ReviewCard>

      <ReviewCard icon="account-group-outline" title="Equipo y recursos" onEdit={() => edit("ProjectTeam")}>
        {draft.roles.length > 0 ? (
          <View style={ui.chips}>
            {draft.roles.slice(0, VISIBLE_ROLES).map((role) => (
              <View key={role} style={ui.chip}>
                <Text style={ui.chipText}>{role}</Text>
              </View>
            ))}
            {extraRoles > 0 ? (
              <View style={ui.chip}>
                <Text style={ui.chipText}>+{extraRoles}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <Text style={styles.muted}>Sin roles definidos</Text>
        )}
        {draft.enlaces.length > 0 ? (
          <Text style={styles.muted} numberOfLines={1}>
            {draft.enlaces[0]}{draft.enlaces.length > 1 ? `  +${draft.enlaces.length - 1}` : ""}
          </Text>
        ) : null}
      </ReviewCard>

      {error ? <Text style={ui.error}>{error}</Text> : null}
    </ProjectStepLayout>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.muted, fontSize: 16, lineHeight: 23 },
  card: { flexDirection: "row", gap: 14, borderRadius: 28, backgroundColor: colors.card, padding: 18, alignItems: "center" },
  cardIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  cardBody: { flex: 1, gap: 6, borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: 14 },
  cardTitle: { color: colors.text, fontSize: 19, fontWeight: "800" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  value: { color: colors.text, fontSize: 15, fontWeight: "700" },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  edit: { padding: 4 },
});
