import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/features/projects/presentation/components/projectUi";
import AuthSurface from "../components/AuthSurface";

// shortcut: placeholder until the real Home (feed de proyectos) exists; guests will see that same Home.
export default function GuestHomeScreen() {
  return (
    <AuthSurface>
      <View style={styles.banner} testID="guest-home-screen">
        <Text style={styles.kicker}>COMUNIDAD DE INNOVACIÓN</Text>
        <Text style={styles.headline}>Conectamos ideas, personas y soluciones para transformar realidades</Text>
      </View>
      <Text style={styles.section}>Proyectos Recientes</Text>
      <View style={styles.empty}>
        <MaterialCommunityIcons name="folder-outline" size={40} color={colors.primary} />
        <Text style={styles.emptyText}>Pronto verás aquí los proyectos de la comunidad.</Text>
      </View>
    </AuthSurface>
  );
}

const styles = StyleSheet.create({
  banner: { marginTop: 32, borderRadius: 32, backgroundColor: "#3F00A0", padding: 26 },
  kicker: { color: "#D9C4FF", fontSize: 13, fontWeight: "800" },
  headline: { color: "#FFFFFF", fontSize: 24, fontWeight: "800", marginTop: 12, lineHeight: 30 },
  section: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 32, marginBottom: 16 },
  empty: { borderWidth: 1, borderColor: colors.border, borderRadius: 28, padding: 28, alignItems: "center", gap: 12 },
  emptyText: { color: colors.muted, fontSize: 15, textAlign: "center" },
});
