import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { colors } from "@/src/shared/ui/tokens";

import { APP_TABS, openCreate } from "./tabs";

/** Same look as the tab bar, for stack screens (e.g. ProjectDetail) that cover the real one. */
export default function AppTabBar({ navigation }: { navigation: any }) {
  const { isLoggedIn } = useAuth();
  const insets = useSafeAreaInsets();
  // Highlight the tab the user came from: the tabs' state is kept on the "App" route below.
  const tabs = navigation.getState()?.routes.find((r: any) => r.name === "App")?.state;
  const active = tabs?.routeNames?.[tabs.index ?? 0] ?? "Home";

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 6) }]} testID="app-tab-bar">
      {APP_TABS.map((tab) => {
        const color = tab.name === active ? colors.primary : colors.muted;
        return (
          <TouchableOpacity
            key={tab.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab.name === active }}
            accessibilityLabel={tab.name === "Create" ? "Crear proyecto" : tab.label}
            onPress={() => (tab.name === "Create" ? openCreate(navigation, isLoggedIn) : navigation.popTo("App", { screen: tab.name }))}
            style={styles.tab}
            testID={`app-tab-${tab.name}`}
          >
            <Feather name={tab.icon} size={24} color={color} />
            <Text style={[styles.label, { color }]} numberOfLines={1}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 6 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 44, gap: 2 },
  label: { fontSize: 12, fontWeight: "700" },
});
