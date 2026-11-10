import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { colors } from "@/src/shared/ui/tokens";
import { KoraNodeUseCases } from "../../domain/use-cases/KoraNodeUseCases";
import ButtonGradient from "@/src/shared/ui/ButtonGradient";

/** The "listening / synced" green of the KORA NODE designs; only used by this feature. */
export const LIVE_GREEN = "#6FBFA8";

export function useKoraNode() {
  const di = useDI();
  return useMemo(() => di.resolve<KoraNodeUseCases>(TOKENS.KoraNodeUseCases), [di]);
}

type Badge = "check" | "mic" | "live";

/** Back button, "KORA NODE" title, subtitle and, optionally, the device drawing with a state badge. */
export function KoraNodeHeader({ onBack, subtitle = "Asistente colaborativo de tu equipo", badge, device = true }: {
  onBack: () => void;
  subtitle?: string;
  badge?: Badge;
  device?: boolean;
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity accessibilityLabel="Volver" onPress={onBack} style={styles.back} testID="kora-node-back">
        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
      </TouchableOpacity>
      <Text style={styles.brand}>KORA NODE</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {device ? (
        <View style={styles.device}>
          <Image accessibilityLabel="Dispositivo KORA NODE" source={require("../../../../../assets/kora-node/device.png")} resizeMode="contain" style={styles.deviceImage} />
          {badge ? (
            <View style={styles.badge}>
              {badge === "live" ? (
                <View style={styles.liveDot} />
              ) : (
                <MaterialCommunityIcons name={badge === "check" ? "check" : "microphone-outline"} size={30} color="#FFFFFF" />
              )}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/** Lavender pill with a green dot: "Sincronizado", "Modo escucha activo". */
export function StatusPill({ label, color = LIVE_GREEN }: { label: string; color?: string }) {
  return (
    <View style={styles.pill}>
      <View style={[styles.pillDot, { backgroundColor: color }]} />
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

/** Numbered steps joined by a line, as in "¿Cómo sincronizarlo?". */
export function StepsCard({ title, steps }: { title: string; steps: React.ReactNode[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {steps.map((step, index) => (
        <View key={index} style={styles.step}>
          <View style={styles.stepRail}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            {index < steps.length - 1 ? <View style={styles.stepLine} /> : null}
          </View>
          <View style={styles.stepBody}>{typeof step === "string" ? <Text style={styles.stepText}>{step}</Text> : step}</View>
        </View>
      ))}
    </View>
  );
}

/** Lavender card: icon, divider, bold title and muted text. */
export function InfoCard({ icon, title, text, accent }: { icon: any; title: string; text: string; accent?: boolean }) {
  return (
    <View style={styles.info}>
      <View style={styles.infoIcon}>
        <MaterialCommunityIcons name={icon} size={28} color={colors.primary} />
      </View>
      <View style={styles.infoDivider} />
      <View style={styles.flex}>
        <Text style={[styles.infoTitle, accent && styles.infoTitleAccent]}>{title}</Text>
        <Text style={styles.infoText}>{text}</Text>
      </View>
    </View>
  );
}

/** Highlighted fragment inside a step: the code to dictate, the phrase the device says. */
export function Chip({ text }: { text: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

/** Wide button with icon | label | arrow, as "Iniciar reunión" and "Historial de reuniones". */
export function WideButton({ icon, label, onPress, outline, disabled, testID }: {
  icon: any; label: string; onPress: () => void; outline?: boolean; disabled?: boolean; testID?: string;
}) {
  const color = outline ? colors.primary : "#FFFFFF";
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.wide, outline ? styles.wideOutline : styles.widePrimary, disabled && styles.wideDisabled]}
      testID={testID}
    >
      <ButtonGradient disabled={outline} />
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <View style={[styles.wideDivider, { backgroundColor: color }]} />
      <Text style={[styles.wideText, { color }]}>{label}</Text>
      <MaterialCommunityIcons name="arrow-right" size={24} color={color} />
    </TouchableOpacity>
  );
}

export const k = StyleSheet.create({
  /** Centered screen title under the header: "Reunión en curso", "¡Sincronización exitosa!". */
  title: { color: colors.text, fontSize: 30, lineHeight: 38, fontWeight: "800", textAlign: "center", letterSpacing: -0.5 },
  lead: { color: colors.text, fontSize: 16, lineHeight: 23, textAlign: "center" },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 20, backgroundColor: colors.card, gap: 12 },
  cardTitle: { color: colors.text, fontSize: 22, lineHeight: 28, fontWeight: "800" },
  body: { color: colors.text, fontSize: 15, lineHeight: 22 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  error: { color: colors.error, textAlign: "center" },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { alignItems: "center", paddingTop: 8 },
  back: { alignSelf: "flex-start", width: 48, height: 48, borderRadius: 24, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  brand: { color: colors.text, fontSize: 34, lineHeight: 42, fontWeight: "800", letterSpacing: -0.5, marginTop: 8 },
  subtitle: { color: colors.text, fontSize: 15, lineHeight: 21, textAlign: "center", marginTop: 4, paddingHorizontal: 12 },
  device: { width: 240, aspectRatio: 1774 / 887, marginTop: 16 },
  deviceImage: { width: "100%", height: "100%" },
  // Sits on the device's lower right edge, as in the design.
  badge: { position: "absolute", right: "15%", bottom: "4%", width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, borderWidth: 1, borderColor: "#5A2BD8", alignItems: "center", justifyContent: "center" },
  liveDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: LIVE_GREEN },
  pill: { flexDirection: "row", alignItems: "center", alignSelf: "center", gap: 10, backgroundColor: colors.soft, borderRadius: 24, paddingHorizontal: 20, paddingVertical: 10 },
  pillDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: colors.primary },
  pillText: { color: colors.primary, fontSize: 16, fontWeight: "800" },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 20, backgroundColor: colors.card },
  cardTitle: { color: colors.text, fontSize: 22, lineHeight: 28, fontWeight: "800", marginBottom: 12 },
  step: { flexDirection: "row", gap: 16 },
  stepRail: { alignItems: "center", width: 30 },
  stepNumber: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.soft, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  stepNumberText: { color: colors.text, fontSize: 15, fontWeight: "800" },
  stepLine: { flex: 1, width: 1, minHeight: 14, backgroundColor: colors.border },
  stepBody: { flex: 1, paddingTop: 4, paddingBottom: 16, gap: 6 },
  stepText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  info: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.soft, borderRadius: 24, padding: 18 },
  infoIcon: { width: 44, alignItems: "center" },
  infoDivider: { width: 1, alignSelf: "stretch", backgroundColor: colors.border },
  infoTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  infoTitleAccent: { color: colors.primary, fontSize: 17 },
  infoText: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 2 },
  chip: { alignSelf: "flex-start", backgroundColor: colors.soft, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: colors.primary, fontSize: 15, fontWeight: "800" },
  wide: { minHeight: 56, borderRadius: 30, flexDirection: "row", alignItems: "center", paddingHorizontal: 22, gap: 14 },
  widePrimary: { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  wideOutline: { backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: colors.primary },
  wideDisabled: { opacity: 0.5 },
  wideDivider: { width: 1, height: 26, opacity: 0.5 },
  wideText: { flex: 1, fontSize: 17, fontWeight: "800" },
});
