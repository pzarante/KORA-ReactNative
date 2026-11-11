import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { profileCompletion } from "@/src/features/auth/domain/entities/UserProfile";
import ProfileProgress from "@/src/features/auth/presentation/components/ProfileProgress";
import ProfileView from "@/src/features/auth/presentation/components/ProfileView";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import {
  RoundButton,
  TopBar,
  useFeed,
} from "@/src/features/projects/presentation/components/feed";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { ui } from "@/src/shared/ui/styles";
import { colors } from "@/src/shared/ui/tokens";

import MyQRCodeModal from "@/src/features/projects/presentation/components/MyQRCodeModal";

export default function MyProfileScreen({ navigation }: { navigation: any }) {
  const { profile, logout } = useAuth();
  const { data: feed } = useFeed();
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const completion = profileCompletion(profile);
  const stats = feed
    ? {
        created: feed.projects.filter((p) => p.creadorId === feed.userId)
          .length,
        joined: feed.requests.filter(
          (r) => r.usuarioId === feed.userId && r.estado === "aceptada",
        ).length,
      }
    : undefined;

  const edit = () => navigation.navigate("EditProfile");

  return (
    <ScreenSurface>
      <TopBar
        right={
          <RoundButton
            icon="logout"
            label="Cerrar sesión"
            color={colors.orange}
            onPress={logout}
            testID="logout-button"
          />
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        testID="my-profile-screen"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Mi perfil</Text>

        {completion < 1 ? (
          <View style={styles.card} testID="complete-profile-card">
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons
                  name="account-edit-outline"
                  size={26}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Aquí está tu perfil</Text>
                <Text style={styles.cardBody}>
                  Completa tu información para que otros puedan conocerte y
                  unirte a proyectos.
                </Text>
              </View>
            </View>
            <ProfileProgress value={completion} label="Perfil completado" />
            <TouchableOpacity
              accessibilityRole="button"
              onPress={edit}
              style={styles.cardButton}
              testID="complete-profile-button"
            >
              <Text style={ui.primaryButtonText}>Completar mi información</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <ProfileView
          profile={profile}
          stats={stats}
          action={
            <View style={styles.actionRow}>
              {/* Botón para mostrar el KORA TAG */}
              <TouchableOpacity
                onPress={() => setQrModalVisible(true)}
                style={[ui.primaryButton, styles.qrBtn]}
                testID="show-qr-button"
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="qrcode"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={[ui.primaryButtonText, { fontSize: 13 }]}>
                  Mi KORA TAG
                </Text>
              </TouchableOpacity>

              {/* Botón para editar */}
              <TouchableOpacity
                onPress={edit}
                style={[ui.outlineButton, styles.edit]}
                testID="edit-profile-button"
                activeOpacity={0.8}
              >
                <Text style={[ui.outlineButtonText, { fontSize: 13 }]}>
                  Editar perfil
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      </ScrollView>

      {/* Modal para visualizar el código QR */}
      <MyQRCodeModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        userProfile={profile}
      />
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#F4EFFC",
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  cardButton: {
    ...ui.primaryButton,
    marginTop: 14,
  },

  /* Estilos de botones alineados */
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  qrBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  edit: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
});
