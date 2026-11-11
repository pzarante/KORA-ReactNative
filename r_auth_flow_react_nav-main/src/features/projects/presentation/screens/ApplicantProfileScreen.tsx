import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { ProfileUseCases } from "@/src/features/auth/domain/use-cases/ProfileUseCases";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import ProfileView from "@/src/features/auth/presentation/components/ProfileView";
import { JoinRequest, Project, RequestStatus } from "../../domain/entities/Project";
import { TopBar, useFeed, useFocusLoad, useProjectUseCases } from "../components/feed";
import { ui } from "@/src/shared/ui/styles";
import ButtonGradient from "@/src/shared/ui/ButtonGradient";

export default function ApplicantProfileScreen({ navigation, route }: { navigation: any; route: any }) {
  const { request, project }: { request: JoinRequest; project: Project } = route.params;
  const di = useDI();
  const profileUseCases = useMemo(() => di.resolve<ProfileUseCases>(TOKENS.ProfileUseCases), [di]);
  const projectUseCases = useProjectUseCases();
  const { data: profile } = useFocusLoad(() => profileUseCases.getProfile(request.usuarioId), [profileUseCases, request.usuarioId]);
  const { data: feed } = useFeed();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answer = async (estado: RequestStatus) => {
    setSaving(true);
    setError(null);
    try {
      await projectUseCases.setRequestStatus(request.id, estado);
      void projectUseCases.notify({
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
    <ScreenSurface>
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
          <ButtonGradient />
          <Text style={ui.primaryButtonText}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 24 },
  footer: { flexDirection: "row", gap: 14, paddingVertical: 14 },
});
