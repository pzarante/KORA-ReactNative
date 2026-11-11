import React from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

import ScreenSurface from "./ScreenSurface";
import { colors } from "./tokens";

/** Figma p. 21: shown while the app restores the session and loads its font. */
export default function SplashScreen() {
  return (
    <ScreenSurface>
      <View style={styles.container} testID="splash-screen">
        <View style={styles.brand}>
          <Image
            accessibilityLabel="Kora"
            resizeMode="contain"
            source={require("../../../assets/images/kora-wordmark.png")}
            style={styles.wordmark}
          />
          <Text style={styles.tagline}>
            <Text style={styles.orange}>CONECTA</Text> IDEAS, <Text style={styles.purple}>CREA</Text> IMPACTO
          </Text>
        </View>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>CARGANDO…</Text>
        </View>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "space-around", paddingVertical: 60 },
  brand: { alignItems: "center" },
  wordmark: { width: 260, height: 80 },
  tagline: { color: colors.muted, fontSize: 16, fontWeight: "800", letterSpacing: 0.3, marginTop: 6 },
  orange: { color: colors.orange },
  purple: { color: colors.primary },
  loading: { alignItems: "center", gap: 16 },
  loadingText: { color: colors.muted, fontSize: 14, fontWeight: "700", letterSpacing: 1 },
});
