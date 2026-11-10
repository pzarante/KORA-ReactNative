import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import AuthBrand from "@/src/features/auth/presentation/components/AuthBrand";
import { ProjectDataSource } from "../../data/datasources/ProjectDataSource";
import { JoinRequest, Project, ProjectComment } from "../../domain/entities/Project";
import NotificationBell from "./NotificationBell";
import { colors, ui } from "./projectUi";

export function useProjectDS() {
  const di = useDI();
  return useMemo(() => di.resolve<ProjectDataSource>(TOKENS.ProjectDataSource), [di]);
}

/** Runs `load` every time the screen gains focus, so lists refresh after creating or answering something. */
export function useFocusLoad<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(() => {
    let active = true;
    load()
      .then((value) => active && (setData(value), setError(null)))
      .catch((err) => active && setError(err?.message ?? "No se pudo cargar la información"));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useFocusEffect(run);
  return { data, error, reload: run };
}

export type Feed = { projects: Project[]; requests: JoinRequest[]; comments: ProjectComment[]; userId: string | null };

/** Everything the lists need, including the counters for members and comments. */
export function useFeed() {
  const ds = useProjectDS();
  return useFocusLoad<Feed>(
    async () => {
      const [projects, requests, comments, userId] = await Promise.all([
        ds.listProjects(),
        ds.listRequests(),
        ds.listComments(),
        ds.currentUserId(),
      ]);
      return { projects, requests, comments, userId };
    },
    [ds],
  );
}

export const memberCount = (feed: Feed, projectId: string) =>
  1 + feed.requests.filter((r) => r.proyectoId === projectId && r.estado === "aceptada").length;

export const commentCount = (feed: Feed, projectId: string) =>
  feed.comments.filter((c) => c.proyectoId === projectId).length;

export function timeAgo(iso: string, now = Date.now()) {
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} ${days === 1 ? "día" : "días"}`;
}

export function Initial({ name, size = 46 }: { name: string; size?: number }) {
  return (
    <View style={[styles.initial, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initialText, { fontSize: size * 0.42 }]}>{(name.trim()[0] ?? "?").toUpperCase()}</Text>
    </View>
  );
}

export function RoundButton({ icon, label, onPress, color = colors.primary, testID }: { icon: any; label: string; onPress: () => void; color?: string; testID?: string }) {
  return (
    <TouchableOpacity accessibilityLabel={label} onPress={onPress} style={styles.roundButton} testID={testID}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </TouchableOpacity>
  );
}

/** Back arrow, logo, the notifications bell and an optional button on the right, as in every detail screen of the design. */
export function TopBar({ onBack, right }: { onBack?: () => void; right?: React.ReactNode }) {
  return (
    <View style={styles.topBar}>
      <View style={styles.side}>{onBack ? <RoundButton icon="arrow-left" label="Volver" onPress={onBack} /> : null}</View>
      <AuthBrand />
      <View style={[styles.side, styles.sideRight]}>
        <NotificationBell />
        {right}
      </View>
    </View>
  );
}

/** Tags alternate purple and orange, like the cards in the design. */
export function Tags({ tags, small }: { tags: string[]; small?: boolean }) {
  if (tags.length === 0) return null;
  return (
    <View style={ui.chips}>
      {tags.map((tag, index) => (
        <View key={tag} style={[ui.chip, small && styles.smallChip, index % 2 === 1 && styles.orangeChip]}>
          <Text style={[ui.chipText, small && styles.smallChipText, index % 2 === 1 && styles.orangeText]}>{tag}</Text>
        </View>
      ))}
    </View>
  );
}

export function ProjectIcon({ icon, size = 64, box = 110 }: { icon: string; size?: number; box?: number }) {
  return (
    <View style={[styles.projectIcon, { width: box, height: box, borderRadius: box * 0.28 }]}>
      <MaterialCommunityIcons name={icon as any} size={size} color={colors.primary} />
    </View>
  );
}

/** Icon, name, description and tags: heads the comments and join-request screens. */
export function ProjectSummary({ project }: { project: Project }) {
  return (
    <View style={styles.summary}>
      <ProjectIcon icon={project.icono} size={44} box={76} />
      <View style={styles.summaryText}>
        <Text style={styles.summaryName}>{project.nombre}</Text>
        <Text numberOfLines={3} style={styles.summaryDescription}>{project.descripcion}</Text>
        <Tags tags={project.etiquetas.slice(0, 2)} small />
      </View>
    </View>
  );
}

/** Row card used by Inicio and Mis Proyectos. */
export function ProjectRow({ project, members, onPress, badge }: { project: Project; members: number; onPress: () => void; badge?: string }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row} testID={`project-row-${project.id}`}>
      <ProjectIcon icon={project.icono} size={32} box={64} />
      <View style={styles.rowText}>
        <Text numberOfLines={1} style={styles.rowName}>{project.nombre}</Text>
        <Text numberOfLines={1} style={styles.rowCreator}>{project.creadorNombre}</Text>
        <Tags tags={project.etiquetas.slice(0, 2)} small />
      </View>
      <View style={styles.rowMembers}>
        {badge ? (
          <Text style={styles.badge}>{badge}</Text>
        ) : (
          <>
            <MaterialCommunityIcons name="account-outline" size={24} color={colors.muted} />
            <Text style={styles.rowCount}>{members}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function Message({ text }: { text: string }) {
  return <Text style={styles.message}>{text}</Text>;
}

const styles = StyleSheet.create({
  initial: { backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  initialText: { color: colors.primary, fontWeight: "800" },
  roundButton: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8 },
  // Equal sides keep the logo centered when the right side has two buttons.
  side: { flex: 1, flexDirection: "row" },
  sideRight: { justifyContent: "flex-end", gap: 8 },
  smallChip: { paddingHorizontal: 10, paddingVertical: 4 },
  smallChipText: { fontSize: 12 },
  orangeChip: { backgroundColor: colors.orangeSoft },
  orangeText: { color: colors.orange },
  projectIcon: { backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  summary: { flexDirection: "row", gap: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 28, padding: 18, backgroundColor: colors.card },
  summaryText: { flex: 1, gap: 6 },
  summaryName: { color: colors.text, fontSize: 20, fontWeight: "800" },
  summaryDescription: { color: colors.text, fontSize: 14, lineHeight: 19 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 28, padding: 16, backgroundColor: colors.card },
  rowText: { flex: 1, gap: 4 },
  rowName: { color: colors.text, fontSize: 17, fontWeight: "800" },
  rowCreator: { color: colors.muted, fontSize: 14 },
  rowMembers: { alignItems: "center" },
  rowCount: { color: colors.muted, fontSize: 15, fontWeight: "700" },
  badge: { color: colors.orange, fontSize: 12, fontWeight: "800" },
  message: { color: colors.muted, fontSize: 15, textAlign: "center", padding: 24 },
});
