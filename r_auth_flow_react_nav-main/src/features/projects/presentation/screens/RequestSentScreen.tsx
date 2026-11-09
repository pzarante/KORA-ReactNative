import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AuthSurface from "@/src/features/auth/presentation/components/AuthSurface";
import { RoundButton, TopBar } from "../components/feed";
import { colors, ui } from "../components/projectUi";

export default function RequestSentScreen({ navigation }: { navigation: any }) {
  return (
    <AuthSurface scroll>
      <TopBar right={<RoundButton icon="home-variant-outline" label="Ir al inicio" color={colors.text} onPress={() => navigation.popTo("App", { screen: "Home" })} />} />
      <View style={styles.container} testID="request-sent-screen">
        <View style={styles.check}>
          <MaterialCommunityIcons name="check" size={64} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>¡Solicitud enviada!</Text>
        <Text style={styles.text}>Tu solicitud para unirte a esta iniciativa ha sido enviada al creador</Text>
      </View>
      <View style={styles.note}>
        <MaterialCommunityIcons name="clock-outline" size={32} color={colors.primary} />
        <Text style={styles.noteText}>El creador revisará tu solicitud y se te notificará cuando haya una respuesta.</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.popTo("App", { screen: "MyProjects" })} style={[ui.outlineButton, styles.button]}>
        <Text style={ui.outlineButtonText}>Ver mis solicitudes</Text>
      </TouchableOpacity>
    </AuthSurface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  check: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#3F00A0", alignItems: "center", justifyContent: "center", marginBottom: 32 },
  title: { color: colors.text, fontSize: 30, fontWeight: "800" },
  text: { color: colors.muted, fontSize: 16, fontWeight: "600", textAlign: "center", marginTop: 10 },
  note: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 12, marginBottom: 20 },
  noteText: { flex: 1, color: colors.text, fontSize: 14, fontWeight: "600" },
  button: { marginBottom: 24 },
});
