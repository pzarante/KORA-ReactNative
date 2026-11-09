import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";

type Props = {
  title: string;
  step?: number;
  nextLabel?: string;
  nextDisabled?: boolean;
  next?: string;
  onNext?: () => void;
  children: React.ReactNode;
};

const TOTAL_STEPS = 5;

export default function ProjectStepLayout({ title, step, nextLabel = "Siguiente", nextDisabled = false, next, onNext, children }: Props) {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [confirmExit, setConfirmExit] = useState(false);
  const progress = step ? step / TOTAL_STEPS : 0;

  const abandon = () => {
    setConfirmExit(false);
    navigation.getParent()?.goBack();
  };

  const goNext = () => {
    if (onNext) onNext();
    else if (route.params?.fromReview) navigation.goBack();
    else navigation.navigate(next);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Salir de la creación del proyecto"
            onPress={() => setConfirmExit(true)}
            style={styles.backButton}
            testID="project-exit-button"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
        </View>

        {step ? (
          <View style={styles.progressBlock}>
            <View style={styles.progressRow}>
              <Text style={styles.stepText}>PASO {step} DE {TOTAL_STEPS}</Text>
              <Text style={styles.percentText}>{Math.round(progress * 100)}% Completado</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        ) : null}

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={ui.outlineButton}>
            <Text style={ui.outlineButtonText}>Atrás</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityState={{ disabled: nextDisabled }}
            disabled={nextDisabled}
            onPress={goNext}
            style={[ui.primaryButton, nextDisabled && ui.primaryButtonDisabled]}
            testID="project-next-button"
          >
            <Text style={[ui.primaryButtonText, nextDisabled && ui.primaryButtonTextDisabled]}>{nextLabel}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal animationType="fade" onRequestClose={() => setConfirmExit(false)} transparent visible={confirmExit}>
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <View style={styles.dialogIcon}>
              <MaterialCommunityIcons name="folder-alert-outline" size={64} color={colors.primary} />
            </View>
            <Text style={styles.dialogTitle}>¿Abandonar la creación del proyecto?</Text>
            <Text style={styles.dialogText}>
              Perderás los cambios que has realizado hasta ahora y deberás empezar de nuevo si decides continuar más tarde.
            </Text>
            <TouchableOpacity onPress={abandon} style={[ui.primaryButton, styles.dialogButton]} testID="project-abandon-confirm">
              <Text style={ui.primaryButtonText}>Sí, abandonar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setConfirmExit(false)} style={[ui.outlineButton, styles.dialogButton]}>
              <Text style={ui.outlineButtonText}>Seguir creando</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 24, paddingTop: 12 },
  backButton: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, color: colors.text, fontSize: 26, fontWeight: "800" },
  progressBlock: { paddingHorizontal: 24, marginTop: 24 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  stepText: { color: colors.muted, fontSize: 13, fontWeight: "800" },
  percentText: { color: colors.muted, fontSize: 13 },
  track: { height: 6, borderRadius: 3, backgroundColor: "#EADFFB" },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
  content: { padding: 24, gap: 24 },
  footer: { flexDirection: "row", gap: 14, paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
  backdrop: { flex: 1, backgroundColor: "rgba(33,24,50,0.5)", justifyContent: "center", padding: 24 },
  dialog: { backgroundColor: "#FFFFFF", borderRadius: 32, padding: 24, alignItems: "center" },
  dialogIcon: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  dialogTitle: { color: colors.text, fontSize: 24, fontWeight: "800", textAlign: "center" },
  dialogText: { color: colors.muted, fontSize: 15, textAlign: "center", marginTop: 12, marginBottom: 24, lineHeight: 22 },
  dialogButton: { alignSelf: "stretch", flex: 0, marginTop: 12 },
});
