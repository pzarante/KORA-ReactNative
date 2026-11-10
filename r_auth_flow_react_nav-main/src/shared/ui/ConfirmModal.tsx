import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ui } from "./styles";
import { colors } from "./tokens";
import ButtonGradient from "@/src/shared/ui/ButtonGradient";

type Props = {
  visible: boolean;
  /** MaterialCommunityIcons name shown in the big circle. */
  icon: any;
  title: string;
  text: string;
  confirm: string;
  cancel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Centered popup with an illustration icon, as in the "¿Abandonar…?" designs. */
export default function ConfirmModal({ visible, icon, title, text, confirm, cancel, onConfirm, onCancel }: Props) {
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <View style={styles.dialogIcon}>
            <MaterialCommunityIcons name={icon} size={64} color={colors.primary} />
          </View>
          <Text style={styles.dialogTitle}>{title}</Text>
          <Text style={styles.dialogText}>{text}</Text>
          <TouchableOpacity onPress={onConfirm} style={[ui.primaryButton, styles.dialogButton]} testID="confirm-modal-accept">
            <ButtonGradient />
            <Text style={ui.primaryButtonText}>{confirm}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancel} style={[ui.outlineButton, styles.dialogButton]} testID="confirm-modal-cancel">
            <Text style={ui.outlineButtonText}>{cancel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.scrim, justifyContent: "center", padding: 24 },
  dialog: { backgroundColor: "#FFFFFF", borderRadius: 32, padding: 24, alignItems: "center" },
  dialogIcon: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  dialogTitle: { color: colors.text, fontSize: 24, fontWeight: "800", textAlign: "center" },
  dialogText: { color: colors.muted, fontSize: 15, textAlign: "center", marginTop: 12, marginBottom: 24, lineHeight: 22 },
  dialogButton: { alignSelf: "stretch", flex: 0, marginTop: 12 },
});
