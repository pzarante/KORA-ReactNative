import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { ProfileDataSource } from "@/src/features/auth/data/datasources/ProfileDataSource";
import AuthSurface from "@/src/features/auth/presentation/components/AuthSurface";
import ProfileView from "@/src/features/auth/presentation/components/ProfileView";
import { JoinRequest, Project, RequestStatus } from "../../domain/entities/Project";
import { TopBar, useFeed, useFocusLoad, useProjectDS } from "../components/feed";
import { ui } from "../components/projectUi";

export default function ApplicantProfileScreen({ navigation, route }: { navigation: any; route: any }) {
  const { request, project }: { request: JoinRequest; project: Project } = route.params;
  const di = useDI();
  const profileDS = useMemo(() => di.resolve<ProfileDataSource>(TOKENS.ProfileDataSource), [di]);
  const ds = useProjectDS();
  const { data: profile } = useFocusLoad(() => profileDS.getProfile(request.usuarioId), [profileDS, request.usuarioId]);
  const { data: feed } = useFeed();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answer = async (estado: RequestStatus) => {
    setSaving(true);
    setError(null);
    try {
      await ds.setRequestStatus(request.id, estado);
      void ds.notify({
        para: [request.usuarioId],
        tipo: estado === "aceptada" ? "solicitud_aceptada" : "solicitud_rechazada",
        proyectoId: project.id,
        actorNombre: project.creadorNombre,
      });
      if (estado === "aceptada") navigation.replace("MemberJoined", { request, project });
      else navigation.goBack();
    } catch (err: any) {
      setError(err?.message ?? "No se pudo responder la solicitud");
      setSaving(false);
    }
  };

  return (
    <AuthSurface>
      <TopBar onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} testID="applicant-profile-screen">
        <ProfileView
          profile={profile ?? { nombreCompleto: request.usuarioNombre, rol: "", habilidades: [], infoAdicional: "" }}
          stats={
            feed
              ? {
                  created: feed.projects.filter((p) => p.creadorId === request.usuarioId).length,
                  joined: feed.requests.filter((r) => r.usuarioId === request.usuarioId && r.estado === "aceptada").length,
                }
              : undefined
          }
        />
        {error ? <Text style={ui.error}>{error}</Text> : null}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity disabled={saving} onPress={() => answer("rechazada")} style={[ui.outlineButton, styles.flex]} testID="reject-request-button">
          <Text style={ui.outlineButtonText}>Rechazar</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={saving} onPress={() => answer("aceptada")} style={ui.primaryButton} testID="accept-request-button">
          <Text style={ui.primaryButtonText}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </AuthSurface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 24 },
  footer: { flexDirection: "row", gap: 14, paddingVertical: 14 },
});
