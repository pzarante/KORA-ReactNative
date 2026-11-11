import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { TopBar } from "@/src/features/projects/presentation/components/feed";
import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { contactError, detailsForRole, PROFILE_ROLES, PROFILE_SKILLS, profileCompletion } from "../../domain/entities/UserProfile";
import AuthField from "../components/AuthField";
import AuthPrimaryButton from "../components/AuthPrimaryButton";
import ContactFields from "../components/ContactFields";
import OptionPill from "../components/OptionPill";
import ProfileProgress from "../components/ProfileProgress";
import RoleDetailsFields from "../components/RoleDetailsFields";
import { useAuth } from "../context/authContext";

/** Every profile section on one screen; opened from "Mi perfil" and when joining a project needs more info. */
export default function EditProfileScreen({ navigation }: { navigation: any }) {
  const { profile, completeProfile, error, clearError } = useAuth();
  const [draft, setDraft] = useState(profile);
  const [nameError, setNameError] = useState<string>();
  const [contactProblem, setContactProblem] = useState<string>();
  const [saving, setSaving] = useState(false);

  // Hide errors left over from another screen, and ours when leaving.
  React.useEffect(() => {
    clearError();
    return clearError;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch: Partial<typeof draft>) => setDraft((current) => ({ ...current, ...patch }));
  const toggleSkill = (skill: string) =>
    set({ habilidades: draft.habilidades.includes(skill) ? draft.habilidades.filter((s) => s !== skill) : [...draft.habilidades, skill] });

  const save = async () => {
    const nombreCompleto = draft.nombreCompleto.trim();
    if (!nombreCompleto) return setNameError("Tu nombre es obligatorio");
    const problem = contactError(draft);
    if (problem) return setContactProblem(problem);
    setSaving(true);
    const saved = await completeProfile({
      ...draft, nombreCompleto, infoAdicional: draft.infoAdicional.trim(), correoContacto: draft.correoContacto.trim(),
      ...detailsForRole(draft.rol, draft),
    });
    setSaving(false);
    if (saved) navigation.goBack();
  };

  return (
    <ScreenSurface>
      <TopBar onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} testID="edit-profile-screen">
          <Text style={styles.title}>Editar perfil</Text>
          <Text style={styles.subtitle}>Completa tu información para que otros puedan conocerte y colaborar contigo</Text>

          <View style={styles.progressCard}>
            <ProfileProgress value={profileCompletion(draft)} label="Tu perfil" />
          </View>

          <Text style={styles.section}>
            Nombre completo <Text style={ui.required}>*</Text>
          </Text>
          <AuthField
            icon="account-outline"
            value={draft.nombreCompleto}
            onChangeText={(nombreCompleto) => {
              set({ nombreCompleto });
              setNameError(undefined);
            }}
            placeholder="Nombre completo"
            autoCapitalize="words"
            autoComplete="name"
            error={nameError}
            testID="edit-name-input"
          />

          <Text style={styles.section}>¿Cuál es tu rol?</Text>
          <View style={styles.roles}>
            {PROFILE_ROLES.map((rol) => (
              <OptionPill key={rol} radio label={rol} selected={draft.rol === rol} onPress={() => set({ rol })} style={styles.role} />
            ))}
          </View>
          {draft.rol ? (
            <View style={styles.roleDetails}>
              <RoleDetailsFields rol={draft.rol} value={draft} onChange={set} />
            </View>
          ) : null}

          <Text style={styles.section}>Habilidades</Text>
          <View style={styles.grid}>
            {PROFILE_SKILLS.map((skill) => (
              <OptionPill key={skill} label={skill} selected={draft.habilidades.includes(skill)} onPress={() => toggleSkill(skill)} style={styles.skill} />
            ))}
          </View>

          <Text style={[styles.section, styles.contactTitle]}>Medios de contacto</Text>
          <ContactFields
            value={draft}
            onChange={(patch) => {
              set(patch);
              setContactProblem(undefined);
            }}
          />
          {contactProblem ? <Text style={ui.error}>{contactProblem}</Text> : null}

          <Text style={styles.section}>Información adicional</Text>
          <TextInput
            style={[ui.input, ui.textArea, styles.bio]}
            placeholder="Cuéntanos algo más sobre ti (intereses, metas, etc.)"
            placeholderTextColor={colors.muted}
            multiline
            value={draft.infoAdicional}
            onChangeText={(infoAdicional) => set({ infoAdicional })}
            textAlignVertical="top"
            testID="edit-bio-input"
          />

          <View style={styles.save}>
            <AuthPrimaryButton label={saving ? "Guardando…" : "Guardar cambios"} onPress={save} disabled={saving} testID="edit-profile-save" />
          </View>
          {error ? <Text style={ui.error}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 40 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center" },
  subtitle: { color: colors.muted, fontSize: 15, fontWeight: "600", textAlign: "center", marginTop: 6, lineHeight: 21 },
  progressCard: { backgroundColor: "rgba(255,255,255,0.92)", borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 18, marginTop: 22 },
  section: { color: colors.text, fontSize: 18, fontWeight: "800", marginTop: 26, marginBottom: 12 },
  // ContactFields brings its own top spacing.
  contactTitle: { marginBottom: 0 },
  roles: { flexDirection: "row", gap: 8 },
  role: { flex: 1, paddingHorizontal: 4 },
  roleDetails: { marginTop: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  skill: { width: "48%" },
  bio: { minHeight: 140, backgroundColor: "rgba(255,255,255,0.92)" },
  save: { marginTop: 30 },
});
