import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/src/shared/ui/tokens";
import { ui } from "@/src/shared/ui/styles";
import { PROJECT_ICONS } from "@/src/features/projects/presentation/components/projectIcons";
import ButtonGradient from "@/src/shared/ui/ButtonGradient";

type Props = {
  visible: boolean;
  selected: string;
  onClose: () => void;
  onSelect: (icon: string) => void;
};

export default function IconPickerModal({ visible, selected, onClose, onSelect }: Props) {
  const [choice, setChoice] = useState(selected);

  return (
    <Modal animationType="fade" onRequestClose={onClose} onShow={() => setChoice(selected)} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <TouchableOpacity accessibilityLabel="Cerrar" onPress={onClose} style={styles.close}>
            <MaterialCommunityIcons name="close" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Más iconos</Text>
          <Text style={styles.subtitle}>Elige un icono para identificar tu proyecto</Text>
          <ScrollView contentContainerStyle={styles.grid}>
            {PROJECT_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                accessibilityLabel={icon}
                accessibilityState={{ selected: choice === icon }}
                onPress={() => setChoice(icon)}
                style={[styles.icon, choice === icon && styles.iconSelected]}
              >
                <MaterialCommunityIcons name={icon} size={26} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.count}>{PROJECT_ICONS.length} iconos disponibles</Text>
          <TouchableOpacity
            onPress={() => {
              onSelect(choice);
              onClose();
            }}
            style={[ui.primaryButton, styles.done]}
          >
            <ButtonGradient />
            <Text style={ui.primaryButtonText}>Listo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.scrim, justifyContent: "center", padding: 20 },
  card: { maxHeight: "90%", backgroundColor: "#FFFFFF", borderRadius: 32, padding: 22 },
  close: { position: "absolute", top: 18, right: 18, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center", zIndex: 1 },
  title: { color: colors.text, fontSize: 26, fontWeight: "800", textAlign: "center", marginTop: 8 },
  subtitle: { color: colors.muted, fontSize: 14, textAlign: "center", marginTop: 8, marginBottom: 18 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  iconSelected: { borderWidth: 2, borderColor: colors.primary },
  count: { color: colors.muted, textAlign: "center", marginVertical: 14 },
  done: { flex: 0 },
});
