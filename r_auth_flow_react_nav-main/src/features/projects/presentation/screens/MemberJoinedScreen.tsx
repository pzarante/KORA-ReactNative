import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { JoinRequest, Project } from "../../domain/entities/Project";
import { Initial, RoundButton } from "../components/feed";
import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";

export default function MemberJoinedScreen({ navigation, route }: { navigation: any; route: any }) {
  const { request, project }: { request: JoinRequest; project: Project } = route.params;

  return (
    <ScreenSurface scroll>
      <View style={styles.top}>
        <RoundButton icon="home-variant-outline" label="Ir al inicio" color={colors.text} onPress={() => navigation.popTo("App")} />
      </View>
      <View style={styles.container} testID="member-joined-screen">
        <Text style={styles.title}>¡{request.usuarioNombre} se ha unido a tu iniciativa!</Text>
        <Text style={styles.text}>Ahora forma parte de tu equipo.</Text>
        <View style={styles.card}>
          <Initial name={request.usuarioNombre} size={72} />
          <View>
            <Text style={styles.name}>{request.usuarioNombre}</Text>
            <Text style={styles.rol}>{request.rol}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => navigation.replace("TeamMembers", { project })} style={[ui.primaryButton, styles.button]} testID="member-joined-team-button">
            <Text style={ui.primaryButtonText}>Ver equipo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={ui.outlineButton}>
            <Text style={ui.outlineButtonText}>Seguir revisando solicitudes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: "flex-end", paddingTop: 8 },
  container: { flex: 1, justifyContent: "center", gap: 16 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center" },
  text: { color: colors.muted, fontSize: 16, textAlign: "center" },
  card: { flexDirection: "row", alignItems: "center", gap: 20, backgroundColor: colors.card, borderRadius: 30, padding: 24, marginTop: 20 },
  name: { color: colors.text, fontSize: 22, fontWeight: "800" },
  rol: { color: colors.muted, fontSize: 15 },
  actions: { gap: 14, marginTop: 40 },
  button: { flex: 0 },
});
