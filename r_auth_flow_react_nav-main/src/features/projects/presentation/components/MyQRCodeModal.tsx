import { colors } from "@/src/shared/ui/tokens";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

interface MyQRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  userProfile: any;
}

export default function MyQRCodeModal({
  visible,
  onClose,
  userProfile,
}: MyQRCodeModalProps) {
  if (!visible) return null;

  const qrPayload = JSON.stringify({
    id: userProfile?.id || "user-123",
    name: userProfile?.nombre || "Usuario KORA",
    email: userProfile?.email || "",
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.tagBrand}>KORA TAG</Text>
            <Text style={styles.title}>
              {userProfile?.nombre || "Mi Código QR"}
            </Text>
            <Text style={styles.subtitle}>
              Muestra este código para ser incorporado a proyectos
            </Text>
          </View>

          <View style={styles.qrContainer}>
            <QRCode
              value={qrPayload}
              size={180}
              color={colors.primary}
              backgroundColor="#FFFFFF"
            />
          </View>

          <View style={styles.footerInfo}>
            <MaterialCommunityIcons
              name="information-outline"
              size={18}
              color={colors.muted}
            />
            <Text style={styles.footerText}>
              Cualquier miembro de la comunidad puede escanear tu KORA TAG para
              conectar.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 18,
    right: 18,
    padding: 6,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  tagBrand: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.soft,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 10,
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 12,
  },
  footerText: {
    flex: 1,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
