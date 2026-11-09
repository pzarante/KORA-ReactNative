import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import AuthSurface from "@/src/features/auth/presentation/components/AuthSurface";
import AuthBrand from "@/src/features/auth/presentation/components/AuthBrand";
import { commentCount, memberCount, Message, useFeed } from "../components/feed";
import { colors, ui } from "../components/projectUi";

const NEW_DAYS = 3;
const ALL = "Todos";

export default function ExploreScreen({ navigation }: { navigation: any }) {
  const [tab, setTab] = useState<"projects" | "people">("projects");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState(ALL);
  const { data: feed, error } = useFeed();

  const tags = useMemo(() => [ALL, ...new Set(feed?.projects.flatMap((p) => p.etiquetas) ?? [])], [feed]);
  const projects = (feed?.projects ?? []).filter((p) => {
    const text = `${p.nombre} ${p.descripcion} ${p.etiquetas.join(" ")}`.toLowerCase();
    return (tag === ALL || p.etiquetas.includes(tag)) && text.includes(query.trim().toLowerCase());
  });

  return (
    <AuthSurface>
      <View style={styles.brand}>
        <AuthBrand />
      </View>
      <Text style={styles.title}>Explorar</Text>
      <View style={styles.segment}>
        {(["projects", "people"] as const).map((key) => (
          <TouchableOpacity key={key} onPress={() => setTab(key)} style={[styles.segmentItem, tab === key && styles.segmentActive]} testID={`explore-tab-${key}`}>
            <Text style={[styles.segmentText, tab === key && styles.segmentTextActive]}>{key === "projects" ? "Proyectos" : "Personas"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "people" ? (
        <View style={styles.people} testID="explore-people">
          <View style={styles.tag}>
            <Text style={styles.tagBrand}>KORA</Text>
            <MaterialCommunityIcons name="qrcode-scan" size={110} color={colors.primary} />
          </View>
          <Text style={styles.peopleTitle}>Escanea un KORA TAG</Text>
          <Text style={styles.peopleText}>
            Conecta con personas de la comunidad universitaria, descubre sus habilidades e intereses y genera nuevas colaboraciones.
          </Text>
          {/* shortcut: no camera library installed yet; add expo-camera when the KORA TAG format is defined. */}
          <TouchableOpacity onPress={() => Alert.alert("Próximamente", "El escáner de KORA TAG estará disponible pronto.")} style={[ui.primaryButton, styles.scan]}>
            <MaterialCommunityIcons name="camera-outline" size={24} color="#FFFFFF" />
            <Text style={ui.primaryButtonText}>Escanear QR</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} testID="explore-projects">
          <View style={styles.search}>
            <MaterialCommunityIcons name="magnify" size={24} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar proyectos..."
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              testID="explore-search"
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {tags.map((item) => (
              <TouchableOpacity key={item} onPress={() => setTag(item)} style={[styles.filter, tag === item && styles.filterActive]}>
                <Text style={[styles.filterText, tag === item && styles.filterTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {error ? <Message text={error} /> : null}
          {feed && projects.length === 0 ? <Message text="No encontramos proyectos con ese filtro." /> : null}
          <View style={styles.grid}>
            {feed &&
              projects.map((project) => {
                const isNew = Date.now() - new Date(project.createdAt).getTime() < NEW_DAYS * 86400000;
                const members = memberCount(feed, project.id);
                return (
                  <TouchableOpacity key={project.id} onPress={() => navigation.navigate("ProjectDetail", { project })} style={styles.card}>
                    <View style={styles.cardTop}>
                      {isNew ? <Text style={styles.newBadge}>Nuevo</Text> : null}
                      <MaterialCommunityIcons name={project.icono as any} size={48} color={colors.primary} />
                    </View>
                    <View style={styles.cardBody}>
                      <View style={styles.cardTags}>
                        {project.etiquetas[0] ? <Text numberOfLines={1} style={styles.cardTag}>{project.etiquetas[0]}</Text> : <View />}
                        <Text numberOfLines={1} style={styles.cardStage}>{project.etapa}</Text>
                      </View>
                      <Text numberOfLines={1} style={styles.cardName}>{project.nombre}</Text>
                      <View style={styles.cardFooter}>
                        <MaterialCommunityIcons name="account-outline" size={16} color={colors.muted} />
                        <Text style={styles.cardMeta}>{members} {members === 1 ? "Integrante" : "Integrantes"}</Text>
                        <MaterialCommunityIcons name="comment-outline" size={16} color={colors.muted} />
                        <Text style={styles.cardMeta}>{commentCount(feed, project.id)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
          </View>
        </ScrollView>
      )}
    </AuthSurface>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: "center", paddingTop: 8 },
  title: { color: colors.text, fontSize: 34, fontWeight: "800" },
  segment: { flexDirection: "row", backgroundColor: colors.soft, borderRadius: 28, padding: 4, marginTop: 14 },
  segmentItem: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 24 },
  segmentActive: { backgroundColor: "#FFFFFF" },
  segmentText: { color: colors.muted, fontSize: 16, fontWeight: "700" },
  segmentTextActive: { color: colors.primary },
  content: { paddingBottom: 32 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 30, paddingHorizontal: 16, marginTop: 16, height: 52 },
  searchInput: { flex: 1, color: colors.text, fontSize: 15 },
  filters: { gap: 8, paddingVertical: 14 },
  filter: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: colors.soft },
  filterActive: { backgroundColor: colors.primary },
  filterText: { color: colors.text, fontSize: 14 },
  filterTextActive: { color: "#FFFFFF", fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 14 },
  card: { width: "48%", borderWidth: 1, borderColor: colors.border, borderRadius: 22, overflow: "hidden", backgroundColor: "#FFFFFF" },
  cardTop: { height: 86, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  newBadge: { position: "absolute", top: 6, left: 6, backgroundColor: colors.primary, color: "#FFFFFF", fontSize: 11, fontWeight: "800", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: "hidden" },
  cardBody: { padding: 10, gap: 6 },
  cardTags: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
  cardTag: { flexShrink: 1, color: colors.primary, backgroundColor: colors.soft, fontSize: 11, fontWeight: "700", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: "hidden" },
  cardStage: { flexShrink: 1, color: colors.orange, backgroundColor: colors.orangeSoft, fontSize: 11, fontWeight: "700", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: "hidden" },
  cardName: { color: colors.text, fontSize: 18, fontWeight: "800" },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardMeta: { color: colors.muted, fontSize: 12, marginRight: 6 },
  people: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  tag: { width: 190, height: 230, borderRadius: 26, borderWidth: 4, borderColor: colors.primary, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center", gap: 10, transform: [{ rotate: "3deg" }] },
  tagBrand: { color: colors.primary, fontSize: 26, fontWeight: "800" },
  peopleTitle: { color: colors.text, fontSize: 26, fontWeight: "800", marginTop: 18 },
  peopleText: { color: colors.muted, fontSize: 15, textAlign: "center", lineHeight: 22 },
  scan: { flex: 0, alignSelf: "stretch", marginTop: 18 },
});
