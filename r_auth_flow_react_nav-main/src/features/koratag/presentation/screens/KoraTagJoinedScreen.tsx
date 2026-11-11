import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { UserProfile } from "@/src/features/auth/domain/entities/UserProfile";
import { Project } from "@/src/features/projects/domain/entities/Project";
import BrandLogo from "@/src/shared/ui/BrandLogo";
import ButtonGradient from "@/src/shared/ui/ButtonGradient";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { ui } from "@/src/shared/ui/styles";
import { colors } from "@/src/shared/ui/tokens";

/** The KORA TAG badge of Figma p. 45: lanyard, card with the brand and a check. */
function TagIllustration() {
  return (
    <View style={styles.illustration}>
      <View style={styles.blob} />
      <View style={styles.strap} />
      <View style={styles.clip} />
      <View style={styles.badge}>
        <Text style={styles.badgeBrand}>KORA</Text>
        <MaterialCommunityIcons name="account-plus-outline" size={64} color={colors.primary} />
      </View>
      <View style={styles.check}>
        <MaterialCommunityIcons name="check" size={28} color="#FFFFFF" />
      </View>
      <View style={[styles.spark, styles.spark1]} />
      <View style={[styles.spark, styles.spark2]} />
      <View style={[styles.spark, styles.spark3]} />
    </View>
  );
}

export default function KoraTagJoinedScreen({ navigation, route }: { navigation: any; route: any }) {
  const { profile, project }: { profile: UserProfile; project: Project } = route.params;
  return (
    <ScreenSurface scroll>
      <View style={styles.content} testID="kora-tag-joined-screen">
        <View style={styles.brand}>
          <BrandLogo size={34} />
          <Text style={styles.brandText}>KORA</Text>
        </View>
        <TagIllustration />
        <Text style={styles.title}>¡Se ha unido a tu proyecto con éxito!</Text>
        <Text style={styles.text}>{profile.nombreCompleto} ahora forma parte de</Text>
        <Text style={styles.project}>{project.nombre}.</Text>
        <View style={styles.thanks}>
          <MaterialCommunityIcons name="qrcode-scan" size={44} color={colors.primary} />
          <View style={styles.thanksDivider} />
          <View style={styles.flex}>
            <Text style={styles.thanksTitle}>Gracias por usar el KORA TAG</Text>
            <Text style={styles.thanksText}>y seguir construyendo conexiones en la comunidad universitaria.</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.replace("ProjectDetail", { project })} style={[ui.primaryButton, styles.button]} testID="kora-tag-back-to-project">
          <ButtonGradient />
          <Text style={ui.primaryButtonText}>Volver a mi proyecto</Text>
        </TouchableOpacity>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { alignItems: "center", paddingTop: 16, paddingBottom: 24 },
  brand: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandText: { color: colors.text, fontSize: 24, fontWeight: "800" },
  illustration: { width: 240, height: 290, alignItems: "center", marginTop: 12 },
  blob: { position: "absolute", top: 70, width: 230, height: 190, borderRadius: 95, backgroundColor: colors.soft },
  strap: { width: 34, height: 90, borderWidth: 6, borderColor: colors.primary, borderBottomWidth: 0, borderTopLeftRadius: 17, borderTopRightRadius: 17, backgroundColor: "#FFFFFF" },
  clip: { width: 40, height: 22, borderRadius: 6, borderWidth: 5, borderColor: colors.primary, backgroundColor: "#FFFFFF", marginTop: -8 },
  badge: {
    width: 150, height: 170, marginTop: -4, borderRadius: 18, borderWidth: 6, borderColor: colors.primary, backgroundColor: "#FBF9FF",
    alignItems: "center", justifyContent: "center", gap: 6, transform: [{ rotate: "-4deg" }],
  },
  badgeBrand: { color: colors.primary, fontSize: 24, fontWeight: "800" },
  check: { position: "absolute", bottom: 4, right: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: "#FFFFFF" },
  spark: { position: "absolute", width: 4, height: 18, borderRadius: 2, backgroundColor: colors.primary },
  spark1: { top: 40, right: 50, transform: [{ rotate: "15deg" }] },
  spark2: { top: 54, right: 34, transform: [{ rotate: "45deg" }] },
  spark3: { top: 76, right: 26, transform: [{ rotate: "75deg" }] },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", textAlign: "center", marginTop: 20, lineHeight: 36 },
  text: { color: colors.muted, fontSize: 17, textAlign: "center", marginTop: 16 },
  project: { color: colors.text, fontSize: 18, fontWeight: "800", textAlign: "center", marginTop: 6 },
  thanks: { flexDirection: "row", alignItems: "center", gap: 16, alignSelf: "stretch", backgroundColor: colors.soft, borderRadius: 22, padding: 18, marginTop: 26 },
  thanksDivider: { width: 1.5, alignSelf: "stretch", backgroundColor: colors.primary },
  thanksTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  thanksText: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 4 },
  button: { flex: 0, alignSelf: "stretch", marginTop: 28 },
});
