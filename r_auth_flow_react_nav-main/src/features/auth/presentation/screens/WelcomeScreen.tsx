import { Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold, useFonts } from "@expo-google-fonts/sora";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import BrandLogo from "@/src/shared/ui/BrandLogo";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { colors } from "@/src/shared/ui/tokens";

// Sizes come from the Figma frame (428 x 926) but are not scaled: the column scrolls
// on short phones or with large system text instead of shrinking or overlapping.
export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const [fontsLoaded] = useFonts({ Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold });
  // Until Sora loads, the system font with the same weight.
  const font = (family: string, weight: "600" | "700" | "800") => (fontsLoaded ? { fontFamily: family } : { fontWeight: weight });

  return (
    <ScreenSurface scroll>
      <View style={styles.container} testID="welcome-screen">
        <View style={styles.top}>
          <View style={styles.brand}>
            <Image
              accessibilityLabel="Kora"
              source={require("../../../../../assets/images/kora-wordmark.png")}
              resizeMode="contain"
              style={styles.wordmark}
            />
            <View style={styles.badge}>
              <BrandLogo size={44} />
            </View>
          </View>

          <View style={styles.texts}>
            <Text style={[styles.title, font("Sora_800ExtraBold", "800")]}>¿Ya tienes cuenta?</Text>
            <Text style={[styles.subtitle, font("Sora_600SemiBold", "600")]}>
              Inicia sesión para acceder a tu espacio o crea una cuenta nueva para comenzar.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
            testID="welcome-login-button"
            onPress={() => navigation.navigate("Login")}
            style={[styles.button, styles.primaryButton]}
          >
            <Text style={[styles.primaryButtonText, font("Sora_700Bold", "700")]}>Iniciar Sesión</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Registrarse"
            testID="welcome-signup-button"
            onPress={() => navigation.navigate("Signup")}
            style={[styles.button, styles.secondaryButton]}
          >
            <Text style={[styles.secondaryButtonText, font("Sora_700Bold", "700")]}>Registrarse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Ingresar como invitado"
            testID="welcome-guest-button"
            onPress={() => navigation.navigate("App")}
            style={styles.guestButton}
          >
            <Text style={[styles.guestText, font("Sora_700Bold", "700")]}>Ingresar como invitado</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingVertical: 24 },
  // Logo and texts take the spare height and stay centered above the buttons, as in the design.
  top: { flex: 1, justifyContent: "center", gap: 20 },
  brand: { alignItems: "center", gap: 48 },
  wordmark: { width: 256, maxWidth: "100%", aspectRatio: 511 / 127 },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E3F5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.19,
    shadowRadius: 24,
    elevation: 8,
  },
  texts: { gap: 12 },
  title: { color: colors.text, textAlign: "center", fontSize: 36, lineHeight: 43, letterSpacing: -1.5 },
  subtitle: { color: colors.muted, textAlign: "center", fontSize: 15, lineHeight: 22.5 },
  actions: { gap: 16, marginTop: 32 },
  button: { minHeight: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  primaryButton: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.19,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16 },
  secondaryButton: { backgroundColor: "#FFFFFF", borderWidth: 2, borderColor: colors.primary },
  secondaryButtonText: { color: colors.primary, fontSize: 16 },
  // 44 pt: minimum touch area from DESIGN_SYSTEM.md, even though the text is small.
  guestButton: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  guestText: { color: colors.primary, fontSize: 13, textDecorationLine: "underline" },
});
