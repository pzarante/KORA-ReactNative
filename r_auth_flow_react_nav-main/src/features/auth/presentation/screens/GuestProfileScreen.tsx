import React from "react";
import { StyleSheet, Text } from "react-native";

import { colors } from "@/src/shared/ui/tokens";
import { TopBar } from "@/src/features/projects/presentation/components/feed";
import AccountPrompt from "../components/AccountPrompt";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";

export default function GuestProfileScreen({ navigation }: { navigation: any }) {
  return (
    <ScreenSurface scroll>
      <TopBar />
      <Text style={styles.title} testID="guest-profile-screen">Mi perfil</Text>
      <AccountPrompt
        title="Aún no tienes una cuenta"
        text="Estás explorando KORA como invitado. Con una cuenta podrás crear proyectos y formar equipos."
        primaryLabel="Crear cuenta"
        onPrimary={() => navigation.navigate("Signup")}
        secondaryLabel="Ya tengo una cuenta"
        onSecondary={() => navigation.navigate("Login")}
      />
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 32, fontWeight: "800", marginTop: 24 },
});
