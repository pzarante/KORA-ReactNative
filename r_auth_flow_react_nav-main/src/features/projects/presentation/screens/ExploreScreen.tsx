import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Alert, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { commentCount, memberCount, Message, TopBar, useFeed, useProjectUseCases } from "../components/feed";
import QRScannerModal from "../components/QRScannerModal";
import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";
import ButtonGradient from "@/src/shared/ui/ButtonGradient";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { ProfileUseCases } from "@/src/features/auth/domain/use-cases/ProfileUseCases";

const NEW_DAYS = 3;
const ALL = "Todos";

export default function ExploreScreen({ navigation }: { navigation: any }) {
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState<"projects" | "people">("projects");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState(ALL);
  const { data: feed, error, refreshing, reload } = useFeed();
  const di = useDI();
  const profiles = useMemo(() => di.resolve<ProfileUseCases>(TOKENS.ProfileUseCases), [di]);
  const projectUseCases = useProjectUseCases();
  const [scannerVisible, setScannerVisible] = useState(false);

  const scan = () => {
    if (!isLoggedIn) return navigation.navigate("AccountRequired");
    // No camera on web: fall back to the simulated scanner.
    if (Platform.OS === "web") return navigation.navigate("KoraTagScan");
    setScannerVisible(true);
  };

  // The QR comes from MyQRCodeModal: {"id": userId, ...}. It continues the same KORA TAG flow.
  const onScanned = async (data: string) => {
    setScannerVisible(false);
    let id: unknown;
    try {
      id = JSON.parse(data)?.id;
    } catch {}
    try {
      const [me, everyone] = await Promise.all([projectUseCases.currentUserId(), profiles.listProfiles()]);
      const profile = everyone.find((p) => p.userId === id && p.userId !== me);
      if (profile) navigation.navigate("KoraTagProfile", { profile });
      else Alert.alert("KORA TAG", "Ese código no es el KORA TAG de otra persona de la comunidad.");
    } catch (err: any) {
      Alert.alert("KORA TAG", err?.message ?? "No se pudo leer el KORA TAG");
    }
  };

  const tags = useMemo(() => [ALL, ...new Set(feed?.projects.flatMap((p) => p.etiquetas) ?? [])], [feed]);
  const projects = (feed?.projects ?? []).filter((p) => {
    const text = `${p.nombre} ${p.descripcion} ${p.etiquetas.join(" ")}`.toLowerCase();
    return (tag === ALL || p.etiquetas.includes(tag)) && text.includes(query.trim().toLowerCase());
  });

  return (
    <ScreenSurface>
      <TopBar />
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
          <TouchableOpacity
            onPress={scan}
            style={[ui.primaryButton, styles.scan]}
            testID="kora-tag-scan-button"
          >
            <ButtonGradient />
            <MaterialCommunityIcons name="camera-outline" size={24} color="#FFFFFF" />
            <Text style={ui.primaryButtonText}>Escanear QR</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} testID="explore-projects"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} />}
        >
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
      <QRScannerModal visible={scannerVisible} onClose={() => setScannerVisible(false)} onScanSuccess={onScanned} />
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
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
