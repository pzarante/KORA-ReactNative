import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";

type Props = {
  visible: boolean;
  roles: string[];
  onClose: () => void;
  onDone: (roles: string[]) => void;
};

export default function AddRolesSheet({ visible, roles, onClose, onDone }: Props) {
  const [items, setItems] = useState(roles);
  const [text, setText] = useState("");

  const add = () => {
    const role = text.trim();
    if (role && !items.some((item) => item.toLowerCase() === role.toLowerCase())) setItems([...items, role]);
    setText("");
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => {
        setItems(roles);
        setText("");
      }}
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Agregar rol</Text>
            <TouchableOpacity accessibilityLabel="Cerrar" onPress={onClose} style={styles.close}>
              <MaterialCommunityIcons name="close" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Añade los roles que necesitas para tu proyecto</Text>

          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="account-plus-outline" size={22} color={colors.muted} />
            <TextInput
              onChangeText={setText}
              onSubmitEditing={add}
              placeholder="Escribe un rol (ej. Diseñador UX/UI)"
              placeholderTextColor={colors.muted}
              returnKeyType="done"
              style={styles.input}
              testID="role-input"
              value={text}
            />
            <TouchableOpacity accessibilityLabel="Agregar rol" onPress={add} style={styles.addButton} testID="role-add-button">
              <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {items.length > 0 ? (
            <>
              <Text style={styles.listTitle}>Roles agregados ({items.length})</Text>
              <View style={ui.chips}>
                {items.map((role) => (
                  <TouchableOpacity
                    key={role}
                    accessibilityLabel={`Quitar ${role}`}
                    onPress={() => setItems(items.filter((item) => item !== role))}
                    style={ui.chip}
                  >
                    <Text style={ui.chipText}>{role}</Text>
                    <MaterialCommunityIcons name="close" size={16} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}

          <TouchableOpacity
            onPress={() => {
              onDone(items);
              onClose();
            }}
            style={[ui.primaryButton, styles.done]}
            testID="roles-done-button"
          >
            <Text style={ui.primaryButtonText}>Listo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.cancel}>
            <Text style={ui.outlineButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(33,24,50,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: 32 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: colors.text, fontSize: 28, fontWeight: "800" },
  close: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  subtitle: { color: colors.muted, fontSize: 15, marginTop: 8, marginBottom: 20 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 30, paddingLeft: 16, paddingRight: 6, minHeight: 56 },
  input: { flex: 1, color: colors.text, fontSize: 15 },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  listTitle: { color: colors.text, fontSize: 18, fontWeight: "800", marginTop: 24, marginBottom: 12 },
  done: { flex: 0, marginTop: 28 },
  cancel: { alignItems: "center", paddingVertical: 16 },
});
