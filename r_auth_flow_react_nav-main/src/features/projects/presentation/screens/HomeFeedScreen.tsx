import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AuthSurface from "@/src/features/auth/presentation/components/AuthSurface";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import NotificationBell from "../components/NotificationBell";
import { Initial, memberCount, Message, ProjectRow, useFeed } from "../components/feed";
import { colors } from "../components/projectUi";

const RECENT = 10;

export default function HomeFeedScreen({ navigation }: { navigation: any }) {
  const { isLoggedIn, profile } = useAuth();
  const { data: feed, error } = useFeed();

  return (
    <AuthSurface>
      <ScrollView contentContainerStyle={styles.content} testID="home-screen" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <NotificationBell />
          {/* Guests get a silhouette; their Profile tab offers creating an account or logging in. */}
          <TouchableOpacity accessibilityLabel="Mi perfil" onPress={() => navigation.navigate("Profile")} style={styles.avatar} testID="header-profile">
            {isLoggedIn ? (
              <Initial name={profile.nombreCompleto || "K"} size={48} />
            ) : (
              <View style={styles.guest}>
                <MaterialCommunityIcons name="account" size={30} color={colors.primary} />
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.banner}>
          <Text style={styles.kicker}>COMUNIDAD DE INNOVACIÓN</Text>
          <Text style={styles.headline}>Conectamos ideas, personas y soluciones para transformar realidades</Text>
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.section}>Proyectos Recientes</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Explore")}>
            <Text style={styles.link}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        {error ? <Message text={error} /> : null}
        {feed && feed.projects.length === 0 ? <Message text="Aún no hay proyectos. ¡Crea el primero!" /> : null}
        <View style={styles.list}>
          {feed?.projects.slice(0, RECENT).map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              members={memberCount(feed, project.id)}
              onPress={() => navigation.navigate("ProjectDetail", { project })}
            />
          ))}
        </View>
      </ScrollView>
    </AuthSurface>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
  header: { flexDirection: "row", justifyContent: "flex-end", gap: 12, minHeight: 56, paddingTop: 8 },
  avatar: { borderRadius: 24, borderWidth: 1.5, borderColor: colors.primary },
  guest: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  banner: { marginTop: 12, borderRadius: 32, backgroundColor: "#3F00A0", padding: 26 },
  kicker: { color: "#D9C4FF", fontSize: 13, fontWeight: "800" },
  headline: { color: "#FFFFFF", fontSize: 24, fontWeight: "800", marginTop: 12, lineHeight: 30 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 32, marginBottom: 16 },
  section: { color: colors.text, fontSize: 22, fontWeight: "800" },
  link: { color: colors.primary, fontSize: 16, fontWeight: "700", textDecorationLine: "underline" },
  list: { gap: 14 },
});
