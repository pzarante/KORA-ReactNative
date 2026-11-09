import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import BrandLogo from "@/src/shared/ui/BrandLogo";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";

export default function CreateProjectIntroScreen({ navigation }: { navigation: any }) {
  return (
    <ScreenSurface>
      <View style={styles.container} testID="create-project-intro">
        <View style={styles.brand}>
          <BrandLogo />
        </View>
        <View style={styles.illustration}>
          <MaterialCommunityIcons name="folder-plus-outline" size={120} color={colors.primary} />
        </View>
        <Text style={styles.title}>Crear un proyecto</Text>
        <Text style={styles.text}>
          Estás a punto de iniciar la creación de un nuevo proyecto para la comunidad universitaria.
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => navigation.navigate("ProjectStage")} style={ui.primaryButton} testID="create-project-start">
            <Text style={ui.primaryButtonText}>Comenzar  →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.getParent()?.goBack()} style={ui.outlineButton}>
            <Text style={ui.outlineButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 50 },
  brand: { marginBottom: 50 },
  illustration: { width: 220, height: 180, borderRadius: 110, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center", marginBottom: 32 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center" },
  text: { color: colors.muted, fontSize: 16, textAlign: "center", marginTop: 16, lineHeight: 24 },
  actions: { alignSelf: "stretch", marginTop: "auto", marginBottom: 24, gap: 14 },
});
