import {
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/sora";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { colors } from "@/src/shared/ui/tokens";

// Figma reference frame: 428 x 926. Every measurement below is in that frame
// and is multiplied by `scale`, so the screen keeps the exact proportions on
// any device.
const FRAME_WIDTH = 428;
const FRAME_HEIGHT = 926;

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / FRAME_WIDTH, height / FRAME_HEIGHT);
  const px = (value: number) => value * scale;

  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });

  const titleFont = fontsLoaded ? { fontFamily: "Sora_800ExtraBold" } : { fontWeight: "800" as const };
  const subtitleFont = fontsLoaded ? { fontFamily: "Sora_600SemiBold" } : { fontWeight: "600" as const };
  const buttonFont = fontsLoaded ? { fontFamily: "Sora_700Bold" } : { fontWeight: "700" as const };

  return (
    <View style={styles.root} testID="welcome-screen">
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <View style={[styles.frame, { width: px(FRAME_WIDTH), height: px(FRAME_HEIGHT) }]}>
        {/* Decorative brand blobs from the design, behind all content. */}
        <View
          pointerEvents="none"
          style={[
            styles.blob,
            {
              top: px(-40),
              right: px(-80),
              width: px(200),
              height: px(200),
              borderRadius: px(100),
              backgroundColor: "#A855F7",
              opacity: 0.15,
            },
          ]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.blob,
            {
              bottom: px(120),
              left: px(-60),
              width: px(220),
              height: px(220),
              borderRadius: px(110),
              backgroundColor: "#FF6B3D",
              opacity: 0.15,
            },
          ]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.blob,
            {
              top: px(350),
              right: px(-30),
              width: px(140),
              height: px(140),
              borderRadius: px(70),
              backgroundColor: "#E9D6FF",
              opacity: 0.4,
            },
          ]}
        />

        {/* KORA wordmark, cropped from the design reference. */}
        <View
          style={{
            position: "absolute",
            top: px(199),
            left: px(87),
            width: px(255.5),
            height: px(63.5),
          }}
        >
          <Image
            accessibilityLabel="Kora"
            source={require("../../../../../assets/images/kora-wordmark.png")}
            resizeMode="contain"
            style={{ width: "100%", height: "100%" }}
          />
        </View>

        {/* Round K badge. */}
        <View
          style={[
            styles.badge,
            {
              top: px(350),
              left: px(154),
              width: px(120),
              height: px(120),
              borderRadius: px(60),
            },
          ]}
        >
          <Image
            accessibilityLabel="Kora"
            source={require("../../../../../assets/images/kora-k.png")}
            resizeMode="contain"
            style={{ width: px(44), height: px(44) }}
          />
        </View>

        {/* Heading and subtitle. */}
        <View style={{ position: "absolute", top: px(490), left: px(32), width: px(364) }}>
          <Text
            style={[
              styles.title,
              titleFont,
              { fontSize: px(36), lineHeight: px(43.2), letterSpacing: px(-1.5) },
            ]}
          >
            ¿Ya tienes cuenta?
          </Text>
          <Text
            style={[
              styles.subtitle,
              subtitleFont,
              { fontSize: px(15), lineHeight: px(22.5), marginTop: px(12) },
            ]}
          >
            Inicia sesión para acceder a tu espacio o crea una cuenta nueva para comenzar.
          </Text>
        </View>

        {/* Iniciar Sesión */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Iniciar sesión"
          testID="welcome-login-button"
          onPress={() => navigation.navigate("Login")}
          style={[
            styles.primaryButton,
            {
              top: px(676),
              left: px(32),
              width: px(364),
              height: px(56),
              borderRadius: px(28),
              gap: px(8),
            },
          ]}
        >
          <Text style={[styles.primaryButtonText, buttonFont, { fontSize: px(16) }]}>
            Iniciar Sesión
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={px(18)} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Registrarse */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Registrarse"
          testID="welcome-signup-button"
          onPress={() => navigation.navigate("Signup")}
          style={[
            styles.secondaryButton,
            {
              top: px(748),
              left: px(32),
              width: px(364),
              height: px(56),
              borderRadius: px(28),
              borderWidth: px(2),
            },
          ]}
        >
          <Text style={[styles.secondaryButtonText, buttonFont, { fontSize: px(16) }]}>
            Registrarse
          </Text>
        </TouchableOpacity>

        {/* Ingresar como invitado */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Ingresar como invitado"
          testID="welcome-guest-button"
          onPress={() => navigation.navigate("App")}
          style={{
            position: "absolute",
            top: px(819.5),
            left: px(32),
            width: px(364),
            height: px(20),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={[styles.guestText, buttonFont, { fontSize: px(13) }]}>
            Ingresar como invitado
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  frame: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  blob: { position: "absolute" },
  badge: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E3F5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3C00A0",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.19,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    color: colors.muted,
    textAlign: "center",
  },
  primaryButton: {
    position: "absolute",
    backgroundColor: "#3C00A0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3C00A0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.19,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
  },
  secondaryButton: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderColor: "#3C00A0",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#3C00A0",
  },
  guestText: {
    color: "#3C00A0",
    textDecorationLine: "underline",
  },
});
