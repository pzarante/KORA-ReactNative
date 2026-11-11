import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { RoundButton, TopBar, useFeed } from "@/src/features/projects/presentation/components/feed";
import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";
import { profileCompletion } from "../../domain/entities/UserProfile";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import ProfileProgress from "../components/ProfileProgress";
import ProfileView from "../components/ProfileView";
import { useAuth } from "../context/authContext";
import ButtonGradient from "@/src/shared/ui/ButtonGradient";

export default function MyProfileScreen({ navigation }: { navigation: any }) {
  const { profile, logout } = useAuth();
  const { data: feed } = useFeed();
  const completion = profileCompletion(profile);
  const stats = feed
    ? {
        created: feed.projects.filter((p) => p.creadorId === feed.userId).length,
        joined: feed.requests.filter((r) => r.usuarioId === feed.userId && r.estado === "aceptada").length,
      }
    : undefined;
  const edit = () => navigation.navigate("EditProfile");

  return (
    <ScreenSurface>
      <TopBar right={<RoundButton icon="logout" label="Cerrar sesión" color={colors.orange} onPress={logout} testID="logout-button" />} />
      <ScrollView contentContainerStyle={styles.content} testID="my-profile-screen" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Mi perfil</Text>

        {completion < 1 ? (
          <View style={styles.card} testID="complete-profile-card">
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons name="account-edit-outline" size={26} color="#FFFFFF" />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Aquí está tu perfil</Text>
                <Text style={styles.cardBody}>Completa tu información para que otros puedan conocerte y unirte a proyectos.</Text>
              </View>
            </View>
            <ProfileProgress value={completion} label="Perfil completado" />
            <TouchableOpacity accessibilityRole="button" onPress={edit} style={styles.cardButton} testID="complete-profile-button">
              <ButtonGradient />
              <Text style={ui.primaryButtonText}>Completar mi información</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <ProfileView
          profile={profile}
          stats={stats}
          action={
            <View style={styles.action}>
              <TouchableOpacity onPress={edit} style={[ui.outlineButton, styles.edit]} testID="edit-profile-button">
                <Text style={ui.outlineButtonText}>Editar perfil</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </ScrollView>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center" },
  action: { alignItems: "center" },
  edit: { minHeight: 44 },
  card: { backgroundColor: colors.soft, borderRadius: 26, padding: 18, gap: 16, marginTop: 16 },
  cardHeader: { flexDirection: "row", gap: 14, alignItems: "center" },
  cardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  cardText: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  cardBody: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 2 },
  cardButton: { minHeight: 50, borderRadius: 30, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
});
