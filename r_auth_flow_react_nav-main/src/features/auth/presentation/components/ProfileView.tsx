import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";
import { UserProfile } from "../../domain/entities/UserProfile";

const ROLE_ICONS: Record<string, any> = { Estudiante: "school-outline", Docente: "briefcase-outline", Egresado: "briefcase-outline" };

type Props = {
  profile: Pick<UserProfile, "nombreCompleto" | "rol" | "habilidades" | "infoAdicional">;
  stats?: { created: number; joined: number };
  /** Rendered under the name, e.g. "Editar perfil". */
  action?: React.ReactNode;
};

// shortcut: carrera, semestre, teléfono and correo from the design are not stored in Usuario yet; add the columns and an onboarding step to show them.
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
              <Text style={styles.statLabel}>Creados</Text>
            </View>
          </View>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="account-group-outline" size={32} color={colors.primary} />
            <View style={styles.statText}>
              <Text style={styles.statValue}>{stats.joined}</Text>
              <Text style={styles.statLabel}>Participando</Text>
            </View>
          </View>
        </View>
      ) : null}

      {profile.rol ? (
        <>
          <Text style={styles.section}>{profile.rol === "Estudiante" ? "Información académica" : "Información profesional"}</Text>
          <View style={styles.box}>
            <MaterialCommunityIcons name={ROLE_ICONS[profile.rol] ?? "account-outline"} size={26} color={colors.primary} />
            <Text style={styles.boxStrong}>{profile.rol}</Text>
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
  boxStrong: { color: colors.text, fontSize: 17, fontWeight: "800" },
  boxText: { flex: 1, color: colors.text, fontSize: 15, lineHeight: 21 },
  skill: { fontWeight: "500" },
});
