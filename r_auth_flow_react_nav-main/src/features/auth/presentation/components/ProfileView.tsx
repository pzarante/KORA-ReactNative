import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";
import { RoleDetails, UserProfile } from "../../domain/entities/UserProfile";

const ROLE_ICONS: Record<string, any> = { Estudiante: "school-outline", Docente: "briefcase-outline", Egresado: "briefcase-outline" };

type InfoColumn = { icon?: any; label: string; value?: string };

/** The two columns after the role in the info row (Figma p. 103–105); empty ones are skipped. */
function roleColumns(rol: string, d: RoleDetails): InfoColumn[] {
  const columns: Record<string, InfoColumn[]> = {
    Estudiante: [
      { label: "Carrera", value: d.carrera },
      { icon: "calendar-blank-outline", label: "Semestre", value: d.semestre ? `${d.semestre}°` : "" },
    ],
    Docente: [
      { icon: "layers-outline", label: "Departamento", value: d.departamento },
      { icon: "book-open-outline", label: "Asignaturas", value: d.asignaturas },
    ],
    Egresado: [
      { icon: "school-outline", label: "Carrera", value: d.carrera },
      { icon: "calendar-blank-outline", label: "Año de egreso", value: d.anioEgreso },
    ],
  };
  return (columns[rol] ?? []).filter((column) => column.value);
}

type Props = {
  profile: Pick<UserProfile, "nombreCompleto" | "rol" | "habilidades" | "infoAdicional"> & Partial<Pick<UserProfile, "whatsapp" | "correoContacto">> & RoleDetails;
  stats?: { created: number; joined: number; labels?: [string, string] };
  /** Rendered under the name, e.g. "Editar perfil". */
  action?: React.ReactNode;
};

export default function ProfileView({ profile, stats, action }: Props) {
  const name = profile.nombreCompleto || "Sin nombre";
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name[0].toUpperCase()}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      {action}

      {stats ? (
        <View style={styles.stats}>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="folder-outline" size={32} color={colors.primary} />
            <View style={styles.statText}>
              <Text style={styles.statValue}>{stats.created}</Text>
              <Text style={styles.statLabel}>{stats.labels?.[0] ?? "Creados"}</Text>
            </View>
          </View>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="account-group-outline" size={32} color={colors.primary} />
            <View style={styles.statText}>
              <Text style={styles.statValue}>{stats.joined}</Text>
              <Text style={styles.statLabel}>{stats.labels?.[1] ?? "Participando"}</Text>
            </View>
          </View>
        </View>
      ) : null}

      {profile.rol ? (
        <>
          <Text style={styles.section}>{profile.rol === "Estudiante" ? "Información académica" : "Información profesional"}</Text>
          <View style={styles.infoRow} testID="profile-info-row">
            <View style={styles.infoCell}>
              <MaterialCommunityIcons name={ROLE_ICONS[profile.rol] ?? "account-outline"} size={24} color={colors.primary} />
              <Text style={styles.boxStrong}>{profile.rol}</Text>
            </View>
            {roleColumns(profile.rol, profile).map((column) => (
              <React.Fragment key={column.label}>
                <View style={styles.infoDivider} />
                <View style={[styles.infoCell, styles.infoCellFlex]}>
                  {column.icon ? <MaterialCommunityIcons name={column.icon} size={22} color={colors.primary} /> : null}
                  <View style={styles.flex}>
                    <Text style={styles.infoLabel}>{column.label}</Text>
                    <Text numberOfLines={2} style={styles.infoValue}>{column.value}</Text>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>
        </>
      ) : null}

      {profile.habilidades.length > 0 ? (
        <>
          <Text style={styles.section}>Habilidades</Text>
          <View style={ui.chips}>
            {profile.habilidades.map((skill) => (
              <View key={skill} style={ui.chip}>
                <Text style={[ui.chipText, styles.skill]}>{skill}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {profile.whatsapp || profile.correoContacto ? (
        <>
          <Text style={styles.section}>Contacto</Text>
          <View style={styles.contact}>
            {profile.whatsapp ? (
              <View style={styles.box}>
                <MaterialCommunityIcons name="whatsapp" size={26} color={colors.primary} />
                <Text style={styles.boxText}>{profile.whatsapp}</Text>
              </View>
            ) : null}
            {profile.correoContacto ? (
              <View style={styles.box}>
                <MaterialCommunityIcons name="email-outline" size={26} color={colors.primary} />
                <Text style={styles.boxText}>{profile.correoContacto}</Text>
              </View>
            ) : null}
          </View>
        </>
      ) : null}

      {profile.infoAdicional ? (
        <>
          <Text style={styles.section}>Información adicional</Text>
          <View style={styles.box}>
            <MaterialCommunityIcons name="file-document-outline" size={26} color={colors.primary} />
            <Text style={styles.boxText}>{profile.infoAdicional}</Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "stretch" },
  avatar: { alignSelf: "center", width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: "#B9A1F0", backgroundColor: colors.soft, alignItems: "center", justifyContent: "center", marginTop: 12 },
  avatarText: { color: colors.text, fontSize: 72, fontWeight: "800" },
  name: { color: colors.text, fontSize: 34, fontWeight: "800", textAlign: "center", marginTop: 8, marginBottom: 12 },
  stats: { flexDirection: "row", gap: 14, marginTop: 20 },
  stat: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-around", backgroundColor: colors.soft, borderRadius: 26, paddingVertical: 16 },
  statText: { alignItems: "center" },
  statValue: { color: colors.text, fontSize: 30, fontWeight: "800" },
  statLabel: { color: colors.text, fontSize: 14 },
  section: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 26, marginBottom: 12 },
  box: { flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 26, padding: 18 },
  contact: { gap: 10 },
  boxStrong: { color: colors.text, fontSize: 15, fontWeight: "800" },
  infoRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 22, paddingVertical: 14, paddingHorizontal: 12 },
  infoCell: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoCellFlex: { flex: 1 },
  infoDivider: { width: 1, alignSelf: "stretch", backgroundColor: colors.border, marginHorizontal: 10 },
  infoLabel: { color: colors.muted, fontSize: 11 },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: "700" },
  flex: { flex: 1 },
  boxText: { flex: 1, color: colors.text, fontSize: 15, lineHeight: 21 },
  skill: { fontWeight: "500" },
});
