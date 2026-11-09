import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import AccountPrompt from "@/src/features/auth/presentation/components/AccountPrompt";
import AuthSurface from "@/src/features/auth/presentation/components/AuthSurface";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { Project } from "../../domain/entities/Project";
import { memberCount, Message, ProjectRow, useFeed } from "../components/feed";
import { colors } from "../components/projectUi";

const STATUS = { pendiente: "Pendiente", rechazada: "Rechazada", aceptada: "Aceptada" };

function Logged({ navigation }: { navigation: any }) {
  const { data: feed, error } = useFeed();
  if (error) return <Message text={error} />;
  if (!feed) return null;

  const byId = new Map(feed.projects.map((p) => [p.id, p]));
  const mine = feed.requests.filter((r) => r.usuarioId === feed.userId);
  const created = feed.projects.filter((p) => p.creadorId === feed.userId);
  const joined = mine.filter((r) => r.estado === "aceptada").map((r) => byId.get(r.proyectoId)).filter((p): p is Project => !!p);
  const waiting = mine.filter((r) => r.estado !== "aceptada" && byId.has(r.proyectoId));
  const open = (project: Project) => navigation.navigate("ProjectDetail", { project });

  return (
    <ScrollView contentContainerStyle={styles.content} testID="my-projects-screen" showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Mis Proyectos</Text>
      <Text style={styles.section}>Creados</Text>
      {created.length === 0 ? <Message text="Aún no has creado proyectos." /> : null}
      {created.map((p) => <ProjectRow key={p.id} project={p} members={memberCount(feed, p.id)} onPress={() => open(p)} />)}
      <Text style={styles.section}>Participando</Text>
      {joined.length === 0 ? <Message text="Todavía no participas en otros proyectos." /> : null}
      {joined.map((p) => <ProjectRow key={p.id} project={p} members={memberCount(feed, p.id)} onPress={() => open(p)} />)}
      {waiting.length > 0 ? <Text style={styles.section}>Mis solicitudes</Text> : null}
      {waiting.map((r) => {
        const project = byId.get(r.proyectoId)!;
        return <ProjectRow key={r.id} project={project} members={0} badge={STATUS[r.estado]} onPress={() => open(project)} />;
      })}
    </ScrollView>
  );
}

export default function MyProjectsScreen({ navigation }: { navigation: any }) {
  const { isLoggedIn } = useAuth();
  return (
    <AuthSurface>
      {isLoggedIn ? (
        <Logged navigation={navigation} />
      ) : (
        <View style={styles.flex}>
          <AccountPrompt
            title="Tus proyectos en un solo lugar"
            text="Crea una cuenta para crear proyectos, unirte a otros y seguir tus solicitudes."
            primaryLabel="Crear cuenta"
            onPrimary={() => navigation.navigate("Signup")}
            secondaryLabel="Ya tengo una cuenta"
            onSecondary={() => navigation.navigate("Login")}
          />
        </View>
      )}
    </AuthSurface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: 12, paddingBottom: 32 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", marginTop: 16 },
  section: { color: colors.text, fontSize: 20, fontWeight: "800", marginTop: 16 },
});
