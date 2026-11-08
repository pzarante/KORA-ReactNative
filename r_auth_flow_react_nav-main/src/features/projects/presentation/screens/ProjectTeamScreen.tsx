import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import AddRolesSheet from "../components/AddRolesSheet";
import ProjectStepLayout from "../components/ProjectStepLayout";
import { colors, ui } from "../components/projectUi";
import { useCreateProject } from "../context/createProjectContext";

const URL_PATTERN = /^https?:\/\/\S+\.\S+$/i;

export default function ProjectTeamScreen() {
  const { draft, update } = useCreateProject();
  const [rolesOpen, setRolesOpen] = useState(false);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  const addLink = () => {
    const value = link.trim();
    if (!URL_PATTERN.test(value)) {
      setLinkError("Escribe un enlace válido que empiece por http:// o https://");
      return;
    }
    if (!draft.enlaces.includes(value)) update({ enlaces: [...draft.enlaces, value] });
    setLink("");
    setLinkError(null);
  };

  return (
    <ProjectStepLayout title="Equipo y recursos" step={5} next="ProjectReview">
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <MaterialCommunityIcons name="account-group-outline" size={28} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>Roles necesarios</Text>
            <Text style={styles.cardText}>Define los roles que requiere tu proyecto para su desarrollo.</Text>
          </View>
        </View>
        {draft.roles.length > 0 ? (
          <View style={ui.chips}>
            {draft.roles.map((role) => (
              <View key={role} style={[ui.chip, styles.whiteChip]}>
                <Text style={ui.chipText}>{role}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <TouchableOpacity onPress={() => setRolesOpen(true)} style={styles.addRole} testID="open-roles-button">
          <MaterialCommunityIcons name="plus" size={22} color={colors.primary} />
          <Text style={ui.chipText}>{draft.roles.length > 0 ? "Editar roles" : "Agregar rol"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <MaterialCommunityIcons name="link-variant" size={28} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>Referencias y enlaces</Text>
            <Text style={styles.cardText}>
              Agrega enlaces a documentos, repositorios, referentes o recursos clave del proyecto.
            </Text>
          </View>
        </View>
        {draft.enlaces.map((url) => (
          <View key={url} style={styles.linkRow}>
            <Text numberOfLines={1} style={styles.linkText}>{url}</Text>
            <TouchableOpacity
              accessibilityLabel={`Quitar ${url}`}
              onPress={() => update({ enlaces: draft.enlaces.filter((item) => item !== url) })}
            >
              <MaterialCommunityIcons name="close" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.linkInputRow}>
          <TextInput
            autoCapitalize="none"
            keyboardType="url"
            onChangeText={(value) => {
              setLink(value);
              setLinkError(null);
            }}
            onSubmitEditing={addLink}
            placeholder="https://github.com/mi-proyecto"
            placeholderTextColor={colors.muted}
            style={styles.linkInput}
            testID="project-link-input"
            value={link}
          />
          <TouchableOpacity accessibilityLabel="Agregar enlace" onPress={addLink} style={styles.addLink}>
            <MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        {linkError ? <Text style={styles.error}>{linkError}</Text> : null}
      </View>

      <AddRolesSheet
        onClose={() => setRolesOpen(false)}
        onDone={(roles) => update({ roles })}
        roles={draft.roles}
        visible={rolesOpen}
      />
    </ProjectStepLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: 28, backgroundColor: colors.card, padding: 20, gap: 16 },
  cardHeader: { flexDirection: "row", gap: 16 },
  cardIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
  cardText: { color: colors.muted, fontSize: 15, marginTop: 4, lineHeight: 21 },
  whiteChip: { backgroundColor: "#FFFFFF" },
  addRole: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22, backgroundColor: "#EDE3FB" },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  linkText: { flex: 1, color: colors.primary, fontSize: 14 },
  linkInputRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  linkInput: { flex: 1, minHeight: 48, borderRadius: 24, backgroundColor: "#EDE3FB", paddingHorizontal: 16, color: colors.text, fontSize: 14 },
  addLink: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  error: { color: colors.error, fontSize: 13 },
});
