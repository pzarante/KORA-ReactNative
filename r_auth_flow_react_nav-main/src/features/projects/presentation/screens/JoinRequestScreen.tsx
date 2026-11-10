import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { Project } from "../../domain/entities/Project";
import { ProjectSummary, TopBar, useProjectUseCases } from "../components/feed";
import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";
import ButtonGradient from "@/src/shared/ui/ButtonGradient";

export default function JoinRequestScreen({ navigation, route }: { navigation: any; route: any }) {
  const project: Project = route.params.project;
  const useCases = useProjectUseCases();
  const { profile } = useAuth();
  const [mensaje, setMensaje] = useState("");
  const [rol, setRol] = useState(project.roles.length === 0 ? "Colaborador" : "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = !!mensaje.trim() && !!rol && !sending;

  const send = async () => {
    if (!ready) return;
    setSending(true);
    setError(null);
    try {
      await useCases.sendRequest({ proyectoId: project.id, rol, mensaje: mensaje.trim(), usuarioNombre: profile.nombreCompleto });
      void useCases.notify({ para: [project.creadorId], tipo: "solicitud", proyectoId: project.id, actorNombre: profile.nombreCompleto, detalle: rol });
      navigation.replace("RequestSent");
    } catch (err: any) {
      setError(err?.message ?? "No se pudo enviar la solicitud");
      setSending(false);
    }
  };

  return (
    <ScreenSurface>
      <TopBar onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} testID="join-request-screen">
        <Text style={styles.title}>Solicitar unirme</Text>
        <Text style={styles.subtitle}>Cuéntale al creador de la iniciativa por qué te gustaría ser parte de este proyecto</Text>
        <ProjectSummary project={project} />
        <View>
          <Text style={ui.label}>¿Por qué quieres unirte?</Text>
          <TextInput
            value={mensaje}
            onChangeText={setMensaje}
            placeholder="Escribe aquí tu mensaje..."
            placeholderTextColor={colors.muted}
            multiline
            style={[ui.input, ui.textArea, styles.message]}
            testID="join-message-input"
          />
        </View>
        {project.roles.length > 0 ? (
          <View>
            <Text style={ui.label}>¿En qué rol podrías aportar?</Text>
            <View style={ui.chips}>
              {project.roles.map((item) => (
                <TouchableOpacity
                  key={item}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: rol === item }}
                  onPress={() => setRol(item)}
                  style={[styles.role, rol === item && styles.roleActive]}
                >
                  <Text style={[styles.roleText, rol === item && styles.roleTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}
        {error ? <Text style={ui.error}>{error}</Text> : null}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[ui.outlineButton, styles.flex]}>
          <Text style={ui.outlineButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={!ready} onPress={send} style={[ui.primaryButton, !ready && ui.primaryButtonDisabled]} testID="send-request-button">
          <ButtonGradient disabled={!ready} />
          <Text style={[ui.primaryButtonText, !ready && ui.primaryButtonTextDisabled]}>{sending ? "Enviando..." : "Enviar solicitud"}</Text>
        </TouchableOpacity>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: 22, paddingBottom: 24 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center", marginTop: 12 },
  subtitle: { color: colors.muted, fontSize: 15, fontWeight: "600", textAlign: "center" },
  message: { minHeight: 160 },
  role: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10 },
  roleActive: { backgroundColor: colors.primary },
  roleText: { color: colors.primary, fontWeight: "700" },
  roleTextActive: { color: "#FFFFFF" },
  footer: { flexDirection: "row", gap: 14, paddingVertical: 14 },
});
