import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { RoundButton, TopBar, useFeed } from "@/src/features/projects/presentation/components/feed";
import { colors, ui } from "@/src/features/projects/presentation/components/projectUi";
import AuthSurface from "../components/AuthSurface";
import ProfileView from "../components/ProfileView";
import { useAuth } from "../context/authContext";

export default function MyProfileScreen({ navigation }: { navigation: any }) {
  const { profile, logout } = useAuth();
  const { data: feed } = useFeed();
  const stats = feed
    ? {
        created: feed.projects.filter((p) => p.creadorId === feed.userId).length,
        joined: feed.requests.filter((r) => r.usuarioId === feed.userId && r.estado === "aceptada").length,
      }
    : undefined;

  return (
    <AuthSurface>
      <TopBar right={<RoundButton icon="logout" label="Cerrar sesión" color={colors.orange} onPress={logout} testID="logout-button" />} />
      <ScrollView contentContainerStyle={styles.content} testID="my-profile-screen" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Mi perfil</Text>
        <ProfileView
          profile={profile}
          stats={stats}
          action={
            <View style={styles.action}>
              {/* Editing reuses the onboarding steps, which start filled with the saved profile. */}
              <TouchableOpacity onPress={() => navigation.navigate("OnboardingName")} style={[ui.outlineButton, styles.edit]}>
                <Text style={ui.outlineButtonText}>Editar perfil</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </ScrollView>
    </AuthSurface>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center" },
  action: { alignItems: "center" },
  edit: { minHeight: 44 },
});
