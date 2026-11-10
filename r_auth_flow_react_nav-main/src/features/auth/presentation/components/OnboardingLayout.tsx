import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { profileCompletion } from "../../domain/entities/UserProfile";
import { ProfileDraft, useAuth } from "../context/authContext";
import AuthBrand from "./AuthBrand";
import AuthSurface from "./AuthSurface";
import ProfileProgress from "./ProfileProgress";

export const ONBOARDING_STEPS = 5;

type StepProps = {
  /** 1-based step; shows the progress bar and "Completar perfil después". */
  step: number;
  /** What the user has picked on this screen but not saved yet, so the bar moves while they type. */
  pending: Partial<ProfileDraft>;
  navigation: any;
};

export default function OnboardingLayout({ children, ...stepProps }: { children: React.ReactNode } & Partial<StepProps>) {
  return (
    <AuthSurface scroll>
      <View style={[styles.container, stepProps.step ? styles.withProgress : undefined]}>
        {stepProps.step ? <StepProgress {...(stepProps as StepProps)} /> : null}
        <AuthBrand />
        {children}
        {stepProps.step ? <SkipButton {...(stepProps as StepProps)} /> : null}
      </View>
    </AuthSurface>
  );
}

function StepProgress({ step, pending }: StepProps) {
  const { profile } = useAuth();
  return (
    <View style={styles.progress}>
      <ProfileProgress value={profileCompletion({ ...profile, ...pending })} label={`Paso ${step} de ${ONBOARDING_STEPS}`} />
    </View>
  );
}

// Only the name is mandatory; everything after it can be filled in later from "Mi perfil".
function SkipButton({ pending, navigation }: StepProps) {
  const { profile, completeProfile, error } = useAuth();
  const [saving, setSaving] = React.useState(false);
  const hasName = !!(pending.nombreCompleto ?? profile.nombreCompleto).trim();

  const skip = async () => {
    setSaving(true);
    const patch = pending.nombreCompleto === undefined ? pending : { ...pending, nombreCompleto: pending.nombreCompleto.trim() };
    const saved = await completeProfile(patch);
    setSaving(false);
    if (saved) navigation.popTo("App");
  };

  return (
    <View style={styles.skip}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ disabled: !hasName || saving }}
        disabled={!hasName || saving}
        onPress={skip}
        style={styles.skipButton}
        testID="onboarding-skip"
      >
        <Text style={[styles.skipText, !hasName && styles.skipDisabled]}>
          {saving ? "Guardando…" : "Completar perfil después"}
        </Text>
      </TouchableOpacity>
      {!hasName ? <Text style={styles.hint}>Escribe tu nombre para poder continuar</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70 },
  withProgress: { paddingTop: 16 },
  progress: { marginBottom: 24 },
  skip: { alignItems: "center", marginTop: 14, paddingBottom: 12 },
  skipButton: { minHeight: 44, paddingHorizontal: 16, justifyContent: "center" },
  skipText: { color: "#4500B5", fontSize: 15, fontWeight: "700", textDecorationLine: "underline" },
  skipDisabled: { color: "#B7AECB" },
  hint: { color: "#756A8E", fontSize: 13 },
  error: { color: "#B42318", marginTop: 8, textAlign: "center" },
});
