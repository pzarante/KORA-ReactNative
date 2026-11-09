import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { Project } from "../../domain/entities/Project";
import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";

export default function ProjectCreatedScreen({ navigation, route }: { navigation: any; route: any }) {
  const project: Project = route.params.project;

  return (
    <ScreenSurface>
      <View style={styles.container} testID="project-created-screen">
        <View style={styles.check}>
          <MaterialCommunityIcons name="check" size={64} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>¡Proyecto Creado!</Text>
        <Text style={styles.text}>
          Tu proyecto <Text style={styles.name}>{project.nombre}</Text> ha sido publicado exitosamente en Kora y ya es visible
          para toda la comunidad universitaria.
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => navigation.getParent()?.replace("ProjectDetail", { project })}
            style={ui.primaryButton}
            testID="view-project-button"
          >
            <Text style={ui.primaryButtonText}>Ver proyecto</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.getParent()?.goBack()} style={styles.home}>
            <Text style={styles.homeText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 140 },
  check: { width: 130, height: 130, borderRadius: 65, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginBottom: 36 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center" },
  text: { color: colors.muted, fontSize: 16, textAlign: "center", marginTop: 14, lineHeight: 24 },
  name: { color: colors.text, fontWeight: "800" },
  actions: { alignSelf: "stretch", marginTop: "auto", marginBottom: 32, gap: 8 },
  home: { alignItems: "center", paddingVertical: 14 },
  homeText: { color: colors.primary, fontSize: 16, fontWeight: "800", textDecorationLine: "underline" },
});
