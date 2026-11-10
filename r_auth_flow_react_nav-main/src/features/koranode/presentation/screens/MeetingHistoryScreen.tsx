import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Project } from "@/src/features/projects/domain/entities/Project";
import { useFocusLoad } from "@/src/shared/hooks/useFocusLoad";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { ui } from "@/src/shared/ui/styles";
import { colors } from "@/src/shared/ui/tokens";
import { formatRange } from "@/src/shared/utils/dates";
import { Meeting } from "../../domain/entities/Meeting";
import { k, KoraNodeHeader, useKoraNode } from "../components/koraNode";

const FILTERS = {
  todas: { label: "Todas", test: () => true },
  pendientes: { label: "Con pendientes", test: (m: Meeting) => m.proximosPasos.some((s) => !s.hecho) },
  mes: {
    label: "Este mes",
    test: (m: Meeting) => {
      const date = new Date(m.inicio);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    },
  },
} as const;
type FilterKey = keyof typeof FILTERS;

const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Every meeting of the project, shared by the whole team: the collection of their notes. */
export default function MeetingHistoryScreen({ navigation, route }: { navigation: any; route: any }) {
  const project: Project = route.params.project;
  const koraNode = useKoraNode();
  const { data: meetings, error } = useFocusLoad(() => koraNode.listMeetings(project.id), [koraNode, project.id]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("todas");
  const [showFilters, setShowFilters] = useState(false);

  const words = normalize(query).split(/\s+/).filter(Boolean);
  const visible = (meetings ?? []).filter((m) => {
    const text = normalize([m.titulo, m.objetivo, ...m.acuerdos].join(" "));
    return FILTERS[filter].test(m) && words.every((word) => text.includes(word));
  });

  return (
    <ScreenSurface scroll>
      <View style={styles.content} testID="meeting-history-screen">
        <KoraNodeHeader onBack={() => navigation.goBack()} device={false} />

        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <MaterialCommunityIcons name="file-document-outline" size={40} color={colors.primary} />
          </View>
          <View style={styles.introDivider} />
          <View style={styles.flex}>
            <Text style={styles.heading}>Historial de reuniones</Text>
            <Text style={k.muted}>Los resúmenes de {project.nombre}, compartidos con todo el equipo.</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.search}>
            <MaterialCommunityIcons name="magnify" size={22} color={colors.primary} />
            <TextInput
              onChangeText={setQuery}
              placeholder="Buscar reunión…"
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              testID="meeting-search"
              value={query}
            />
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ expanded: showFilters }}
            onPress={() => setShowFilters((s) => !s)}
            style={[styles.filterButton, filter !== "todas" && styles.filterButtonActive]}
            testID="meeting-filter"
          >
            <MaterialCommunityIcons name="filter-variant" size={22} color={filter !== "todas" ? "#FFFFFF" : colors.primary} />
            <Text style={[styles.filterText, filter !== "todas" && styles.filterTextActive]}>Filtrar</Text>
          </TouchableOpacity>
        </View>

        {showFilters ? (
          <View style={ui.chips}>
            {(Object.keys(FILTERS) as FilterKey[]).map((key) => (
              <TouchableOpacity
                key={key}
                accessibilityRole="radio"
                accessibilityState={{ selected: filter === key }}
                onPress={() => setFilter(key)}
                style={[styles.chip, filter === key && styles.chipActive]}
                testID={`filter-${key}`}
              >
                <Text style={[styles.chipText, filter === key && styles.chipTextActive]}>{FILTERS[key].label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {error ? <Text style={k.error}>{error}</Text> : null}
        {!meetings && !error ? <ActivityIndicator color={colors.primary} /> : null}
        {meetings && meetings.length === 0 ? (
          <Text style={styles.empty}>Aún no hay reuniones. Inicia la primera con tu KORA NODE y su resumen aparecerá aquí.</Text>
        ) : meetings && visible.length === 0 ? (
          <Text style={styles.empty}>Ninguna reunión coincide con tu búsqueda.</Text>
        ) : null}

        {visible.map((meeting) => (
          <TouchableOpacity
            key={meeting.id}
            accessibilityRole="button"
            onPress={() => navigation.navigate("MeetingNote", { project, meeting })}
            style={styles.card}
            testID={`meeting-row-${meeting.id}`}
          >
            <View style={styles.cardHead}>
              <View style={styles.folder}>
                <MaterialCommunityIcons name="folder-outline" size={28} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text numberOfLines={2} style={styles.cardTitle}>{meeting.titulo}</Text>
                <View style={styles.dateRow}>
                  <MaterialCommunityIcons name="calendar-blank-outline" size={16} color={colors.muted} />
                  <Text style={[k.muted, styles.flex]}>{formatRange(meeting.inicio, meeting.fin)}</Text>
                </View>
              </View>
              <View style={styles.arrow}>
                <MaterialCommunityIcons name="arrow-right" size={22} color={colors.primary} />
              </View>
            </View>
            {meeting.objetivo ? (
              <Text numberOfLines={2} style={styles.summary}>{meeting.objetivo}</Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, paddingBottom: 32 },
  flex: { flex: 1 },
  intro: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 4 },
  introIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  introDivider: { width: 1.5, alignSelf: "stretch", backgroundColor: colors.primary },
  heading: { color: colors.text, fontSize: 22, lineHeight: 28, fontWeight: "800" },
  searchRow: { flexDirection: "row", gap: 10 },
  search: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, minHeight: 50, borderRadius: 25, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 16 },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 10 },
  filterButton: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 50, borderRadius: 25, backgroundColor: colors.soft, paddingHorizontal: 16 },
  filterButtonActive: { backgroundColor: colors.primary },
  filterText: { color: colors.primary, fontSize: 15, fontWeight: "800" },
  filterTextActive: { color: "#FFFFFF" },
  chip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.soft },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.text, fontSize: 14, fontWeight: "700" },
  chipTextActive: { color: "#FFFFFF" },
  empty: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: "center", padding: 16 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 14, backgroundColor: colors.card, gap: 12 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  folder: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  cardTitle: { color: colors.text, fontSize: 17, lineHeight: 22, fontWeight: "800" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  arrow: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  summary: { color: colors.text, fontSize: 14, lineHeight: 20, backgroundColor: colors.soft, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
});
