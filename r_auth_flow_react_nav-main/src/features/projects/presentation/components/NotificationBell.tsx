import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { AppNotification } from "../../domain/entities/Notification";
import { Project } from "../../domain/entities/Project";
import { RoundButton, timeAgo, useProjectUseCases } from "./feed";
import { NOTIFICATION_TYPES } from "./notificationTypes";
import { colors } from "@/src/shared/ui/tokens";

type Row = AppNotification & { project: Project };

/** Keeps the notifications whose type and project still exist, so old or archived ones don't break the list. */
export function withProjects(notifications: AppNotification[], projects: Project[]): Row[] {
  const byId = new Map(projects.map((p) => [p.id, p]));
  return notifications.flatMap((n) => {
    const project = byId.get(n.proyectoId);
    return project && NOTIFICATION_TYPES[n.tipo] ? [{ ...n, project }] : [];
  });
}

/** Bell for the screen headers; opens the "Notificaciones" side panel. Guests always see it empty. */
export default function NotificationBell() {
  const { isLoggedIn } = useAuth();
  const navigation = useNavigation<any>();
  const ds = useProjectUseCases();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  // 0 = hidden, 1 = shown: the panel slides in from the right edge while the scrim fades.
  const slide = useRef(new Animated.Value(0)).current;
  const panelX = slide.interpolate({ inputRange: [0, 1], outputRange: [420, 0] });

  const close = (then?: () => void) =>
    Animated.timing(slide, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => {
      setOpen(false);
      then?.();
    });

  const show = async () => {
    setOpen(true);
    Animated.timing(slide, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    if (!isLoggedIn) return;
    try {
      const [notifications, projects] = await Promise.all([ds.listNotifications(), ds.listProjects()]);
      setItems(withProjects(notifications, projects));
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? "No se pudieron cargar las notificaciones");
    }
  };

  const markRead = (ids: string[]) => {
    const unreadIds = ids.filter((id) => items.some((n) => n.id === id && !n.leida));
    if (unreadIds.length === 0) return;
    setItems((current) => current.map((n) => (unreadIds.includes(n.id) ? { ...n, leida: true } : n)));
    ds.markNotificationsRead(unreadIds).catch((err) => setError(err?.message ?? "No se pudieron marcar las notificaciones"));
  };

  const go = (route: string) => close(() => navigation.navigate(route));

  const unread = items.filter((n) => !n.leida).length;

  return (
    <>
      <RoundButton icon="bell-outline" label="Notificaciones" color={colors.text} onPress={show} testID="notifications-button" />
      <Modal visible={open} transparent animationType="none" onRequestClose={() => close()}>
        <View style={styles.backdrop}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: slide }]}>
            <Pressable accessibilityLabel="Cerrar notificaciones" style={styles.scrim} onPress={() => close()} />
          </Animated.View>
          <Animated.View style={[styles.panelWrap, { transform: [{ translateX: panelX }] }]}>
            <SafeAreaView style={styles.panel} testID="notifications-panel">
              <View pointerEvents="none" style={styles.purpleGlow} />
              <View pointerEvents="none" style={styles.orangeGlow} />
              <View style={styles.header}>
                <Text style={styles.title}>Notificaciones</Text>
                <TouchableOpacity accessibilityLabel="Cerrar" onPress={() => close()} style={styles.close}>
                  <MaterialCommunityIcons name="close" size={26} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.status}>{unread > 0 ? `${unread} sin leer` : "Estás al día"}</Text>
                {isLoggedIn ? (
                  <TouchableOpacity onPress={() => markRead(items.map((n) => n.id))} style={styles.markAll} testID="notifications-mark-all">
                    <View style={styles.check}>
                      <MaterialCommunityIcons name="check" size={18} color={colors.primary} />
                    </View>
                    <Text style={styles.markAllText}>Marcar todas</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {items.length > 0 && isLoggedIn ? (
                <ScrollView contentContainerStyle={styles.list}>
                  {items.map((n) => {
                    const isUnread = !n.leida;
                    const look = NOTIFICATION_TYPES[n.tipo];
                    return (
                      <TouchableOpacity
                        key={n.id}
                        onPress={() => {
                          markRead([n.id]);
                          close(() => navigation.navigate(look.screen, { project: n.project }));
                        }}
                        style={[styles.item, isUnread && styles.itemUnread]}
                        testID={`notification-${n.id}`}
                      >
                        <View style={styles.itemIcon}>
                          <MaterialCommunityIcons name={look.icon as any} size={22} color={colors.primary} />
                        </View>
                        <View style={styles.itemText}>
                          <Text style={styles.itemTitle}>{look.text(n, n.project.nombre)}</Text>
                          <Text style={styles.itemTime}>{timeAgo(n.createdAt)}</Text>
                        </View>
                        {isUnread ? <View style={styles.dot} /> : null}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : (
                <View style={styles.empty} testID="notifications-empty">
                  <Text style={styles.emptyTitle}>No hay nada nuevo</Text>
                  <Text style={styles.emptyText}>
                    {error ?? "Aquí verás postulaciones, respuestas, comentarios y actualizaciones de tus proyectos."}
                  </Text>
                  {!isLoggedIn ? (
                    <View style={styles.guest} testID="notifications-guest">
                      <Text style={styles.guestText}>No olvides iniciar sesión o crear una cuenta para recibir notificaciones.</Text>
                      <TouchableOpacity onPress={() => go("Login")} style={styles.guestPrimary}>
                        <Text style={styles.guestPrimaryText}>Iniciar sesión</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => go("Signup")} style={styles.guestOutline}>
                        <Text style={styles.guestOutlineText}>Crear cuenta</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              )}
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, flexDirection: "row", justifyContent: "flex-end" },
  scrim: { flex: 1, backgroundColor: "rgba(33,24,50,0.53)" },
  panelWrap: { width: "76%", maxWidth: 420 },
  panel: { flex: 1, backgroundColor: "#FFFFFF", borderTopLeftRadius: 32, borderBottomLeftRadius: 32, overflow: "hidden", paddingHorizontal: 16 },
  purpleGlow: { position: "absolute", top: -80, right: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: "#E5CEFF", opacity: 0.6 },
  orangeGlow: { position: "absolute", bottom: "22%", left: -120, width: 220, height: 220, borderRadius: 110, backgroundColor: "#FFD4C8", opacity: 0.5 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 16 },
  title: { color: colors.text, fontSize: 24, fontWeight: "800", letterSpacing: -0.4 },
  close: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  status: { color: colors.muted, fontSize: 14, fontWeight: "700" },
  markAll: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44 },
  check: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  markAllText: { color: colors.primary, fontSize: 14, fontWeight: "800" },
  list: { gap: 10, paddingVertical: 16 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  itemUnread: { backgroundColor: colors.soft },
  itemIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  itemText: { flex: 1, gap: 4 },
  itemTitle: { color: colors.text, fontSize: 14, lineHeight: 20, fontWeight: "600" },
  itemTime: { color: colors.muted, fontSize: 13 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.orange },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  emptyTitle: { color: colors.text, fontSize: 22, fontWeight: "800", textAlign: "center" },
  emptyText: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 12 },
  guest: { alignSelf: "stretch", marginTop: 28, gap: 12 },
  guestText: { color: colors.orange, fontSize: 14, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  guestPrimary: { minHeight: 48, borderRadius: 30, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  guestPrimaryText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  guestOutline: { minHeight: 48, borderRadius: 30, borderWidth: 1.5, borderColor: colors.primary, alignItems: "center", justifyContent: "center" },
  guestOutlineText: { color: colors.primary, fontSize: 15, fontWeight: "800" },
});
