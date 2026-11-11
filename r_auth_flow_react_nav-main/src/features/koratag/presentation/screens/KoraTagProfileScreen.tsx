import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { UserProfile } from "@/src/features/auth/domain/entities/UserProfile";
import ProfileView from "@/src/features/auth/presentation/components/ProfileView";
import { RoundButton, useFeed } from "@/src/features/projects/presentation/components/feed";
import ButtonGradient from "@/src/shared/ui/ButtonGradient";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { ui } from "@/src/shared/ui/styles";
import { colors } from "@/src/shared/ui/tokens";

/** Profile read from a KORA TAG (Figma p. 43): decide whether to add the person to a project. */
export default function KoraTagProfileScreen({ navigation, route }: { navigation: any; route: any }) {
  const profile: UserProfile = route.params.profile;
  const { data: feed } = useFeed();

  return (
    <ScreenSurface>
      <View style={styles.header}>
        <RoundButton icon="arrow-left" label="Volver" onPress={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} testID="kora-tag-profile-screen">
        <ProfileView
          profile={profile}
          action={profile.rol ? <Text style={styles.roleChip}>{profile.rol}</Text> : null}
          stats={
            feed
              ? {
                  created: feed.projects.filter((p) => p.creadorId === profile.userId).length,
                  joined: feed.requests.filter((r) => r.usuarioId === profile.userId && r.estado === "aceptada").length,
                  labels: ["Proyectos", "Colaboraciones"],
                }
              : undefined
          }
        />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[ui.outlineButton, styles.button]} testID="kora-tag-decline">
          <MaterialCommunityIcons name="close" size={22} color={colors.primary} />
          <Text style={[ui.outlineButtonText, styles.buttonText]}>No aceptar en proyecto</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("KoraTagSelectProject", { profile })} style={[ui.primaryButton, styles.button]} testID="kora-tag-accept">
          <ButtonGradient />
          <MaterialCommunityIcons name="account-multiple-plus-outline" size={22} color="#FFFFFF" />
          <Text style={[ui.primaryButtonText, styles.buttonText]}>Aceptar en proyecto</Text>
        </TouchableOpacity>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 8 },
  content: { paddingBottom: 24 },
  roleChip: {
    alignSelf: "center", color: colors.primary, fontSize: 14, fontWeight: "800", backgroundColor: colors.soft,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 6, overflow: "hidden",
  },
  footer: { flexDirection: "row", gap: 12, paddingVertical: 14 },
  button: { flex: 1, flexDirection: "row", gap: 8, paddingHorizontal: 12 },
  buttonText: { fontSize: 14, flexShrink: 1, textAlign: "center" },
});
