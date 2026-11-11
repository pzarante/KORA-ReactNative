import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { ProfileUseCases } from "@/src/features/auth/domain/use-cases/ProfileUseCases";
import { RoundButton, useProjectUseCases } from "@/src/features/projects/presentation/components/feed";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { ui } from "@/src/shared/ui/styles";
import { colors } from "@/src/shared/ui/tokens";

/** How long the fake camera "looks" before reading a tag. Tests set it to 0. */
export const SCAN_DELAY_MS = { value: 2500 };

const FRAME = 240;

/**
 * Simulated KORA TAG scanner (the course doesn't need a real camera): it shows a viewfinder and,
 * after a moment, "reads" the tag of someone from the community who isn't you.
 */
export default function KoraTagScanScreen({ navigation }: { navigation: any }) {
  const di = useDI();
  const profiles = useMemo(() => di.resolve<ProfileUseCases>(TOKENS.ProfileUseCases), [di]);
  const projects = useProjectUseCases();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const line = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(line, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(line, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [line]);

  useEffect(() => {
    let active = true;
    setError(null);
    const timer = setTimeout(async () => {
      try {
        const [me, everyone] = await Promise.all([projects.currentUserId(), profiles.listProfiles()]);
        const others = everyone.filter((p) => p.userId !== me && p.nombreCompleto.trim());
        if (!active) return;
        if (others.length === 0) return setError("No encontramos KORA TAGs de otras personas todavía.");
        const scanned = others[Math.floor(Math.random() * others.length)];
        navigation.replace("KoraTagProfile", { profile: scanned });
      } catch (err: any) {
        if (active) setError(err?.message ?? "No se pudo leer el KORA TAG");
      }
    }, SCAN_DELAY_MS.value);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [attempt, navigation, profiles, projects]);

  const translateY = line.interpolate({ inputRange: [0, 1], outputRange: [12, FRAME - 16] });

  return (
    <ScreenSurface>
      <View style={styles.header}>
        <RoundButton icon="arrow-left" label="Volver" onPress={() => navigation.goBack()} />
      </View>
      <View style={styles.content} testID="kora-tag-scan-screen">
        <Text style={styles.title}>Escanea un KORA TAG</Text>
        <Text style={styles.text}>Apunta la cámara al código QR del KORA TAG de la persona.</Text>

        <View style={styles.frame}>
          {[styles.cornerTL, styles.cornerTR, styles.cornerBL, styles.cornerBR].map((corner, i) => (
            <View key={i} style={[styles.corner, corner]} />
          ))}
          <MaterialCommunityIcons name="qrcode" size={120} color="#D9CBF3" />
          {!error ? <Animated.View style={[styles.line, { transform: [{ translateY }] }]} /> : null}
        </View>

        {error ? (
          <>
            <Text style={ui.error}>{error}</Text>
            <TouchableOpacity onPress={() => setAttempt((n) => n + 1)} style={[ui.outlineButton, styles.retry]} testID="kora-tag-retry">
              <Text style={ui.outlineButtonText}>Intentar de nuevo</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.status}>Buscando KORA TAG…</Text>
        )}
        <Text style={styles.note}>Simulación: el escáner elige una persona de la comunidad.</Text>
      </View>
    </ScreenSurface>
  );
}

const corner = { position: "absolute" as const, width: 42, height: 42, borderColor: colors.primary };
const styles = StyleSheet.create({
  header: { paddingTop: 8 },
  content: { flex: 1, alignItems: "center", paddingTop: 24 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", textAlign: "center" },
  text: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 8, paddingHorizontal: 12 },
  frame: { width: FRAME, height: FRAME, marginTop: 36, alignItems: "center", justifyContent: "center", borderRadius: 28, backgroundColor: "rgba(240,235,255,0.6)" },
  corner,
  cornerTL: { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 28 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 28 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 28 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 28 },
  line: { position: "absolute", top: 0, left: 18, right: 18, height: 3, borderRadius: 2, backgroundColor: colors.orange },
  status: { color: colors.primary, fontSize: 16, fontWeight: "700", marginTop: 28 },
  retry: { marginTop: 16, alignSelf: "stretch" },
  note: { color: colors.muted, fontSize: 12, marginTop: "auto", marginBottom: 24, textAlign: "center" },
});
