import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/features/projects/presentation/components/projectUi";

/** Purple bar with the percentage of the profile filled in; `label` goes on the left (e.g. "Paso 2 de 4"). */
export default function ProfileProgress({ value, label }: { value: number; label: string }) {
  const width = useRef(new Animated.Value(value)).current;
  const percent = Math.round(value * 100);

  useEffect(() => {
    Animated.timing(width, { toValue: value, duration: 350, useNativeDriver: false }).start();
  }, [value, width]);

  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: percent }} testID="profile-progress">
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, { width: width.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 },
  label: { color: colors.muted, fontSize: 13, fontWeight: "700" },
  percent: { color: colors.primary, fontSize: 15, fontWeight: "800" },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.soft, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 5, backgroundColor: colors.primary },
});
