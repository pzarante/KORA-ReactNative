import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AuthSurface from "@/src/features/auth/presentation/components/AuthSurface";
import { Project } from "../../domain/entities/Project";
import { Initial, Message, timeAgo, TopBar, useFocusLoad, useProjectDS } from "../components/feed";
import { colors, ui } from "../components/projectUi";

export default function RequestsScreen({ navigation, route }: { navigation: any; route: any }) {
  const project: Project = route.params.project;
  const ds = useProjectDS();
  const { data: requests, error } = useFocusLoad(
    async () => (await ds.listRequests({ proyectoId: project.id })).filter((r) => r.estado === "pendiente"),
    [ds, project.id],
  );

  return (
    <AuthSurface>
      <TopBar onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} testID="requests-screen">
        <Text style={styles.title}>Solicitudes para unirse</Text>
        <Text style={styles.subtitle}>Personas interesadas en aportar a tu iniciativa.</Text>
        {error ? <Message text={error} /> : null}
        {requests && requests.length === 0 ? <Message text="No hay solicitudes pendientes." /> : null}
        {requests?.map((request) => (
          <TouchableOpacity
            key={request.id}
            onPress={() => navigation.navigate("ApplicantProfile", { request, project })}
            style={styles.card}
            testID={`request-${request.id}`}
          >
            <View style={styles.header}>
              <Initial name={request.usuarioNombre} />
              <View style={styles.flex}>
                <Text style={styles.name}>{request.usuarioNombre}</Text>
                <Text style={styles.time}>{timeAgo(request.createdAt)}</Text>
              </View>
              <Text style={styles.link}>Ver perfil</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={colors.primary} />
            </View>
            {request.rol ? (
              <View style={ui.chips}>
                <View style={ui.chip}>
                  <Text style={ui.chipText}>{request.rol}</Text>
                </View>
              </View>
            ) : null}
            <Text style={styles.message}>&quot;{request.mensaje}&quot;</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </AuthSurface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: 16, paddingBottom: 32 },
  title: { color: colors.text, fontSize: 30, fontWeight: "800", marginTop: 16 },
  subtitle: { color: colors.muted, fontSize: 15 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 26, padding: 18, gap: 12, backgroundColor: "#FFFFFF" },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { color: colors.text, fontSize: 18, fontWeight: "800" },
  time: { color: colors.muted, fontSize: 13 },
  link: { color: colors.primary, fontSize: 15, fontWeight: "800" },
  message: { color: colors.muted, fontSize: 15, lineHeight: 21 },
});
