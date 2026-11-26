import { colors } from "@/src/shared/ui/tokens";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

// Exported PNG size (px): big enough to print the tag without blurring.
const EXPORT_SIZE = 1024;

interface MyQRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string | null | undefined;
  name: string;
}

export default function MyQRCodeModal({
  visible,
  onClose,
  userId,
  name,
}: MyQRCodeModalProps) {
  const svgRef = useRef<any>(null);
  const [exporting, setExporting] = useState(false);
  if (!visible) return null;

  const fileName = `kora-tag-${(name || "mi-perfil").normalize("NFD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase()}`;
  const fail = (err: any) => Alert.alert("KORA TAG", err?.message ?? "No se pudo guardar tu KORA TAG");

  // Only the signed-in user's own QR is rendered here, so only their own can be exported.
  const exportQr = () => {
    const svg = svgRef.current;
    if (!svg || exporting) return;
    if (Platform.OS === "web") {
      // react-native-svg renders a real <svg> on web: download it as a vector file (prints at any size).
      try {
        const element: SVGSVGElement | undefined = svg.elementRef?.current;
        if (!element) throw new Error("No se encontró el código QR");
        const blob = new Blob([new XMLSerializer().serializeToString(element)], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileName}.svg`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        fail(err);
      }
      return;
    }
    setExporting(true);
    svg.toDataURL(
      async (base64: string) => {
        try {
          const file = new File(Paths.cache, `${fileName}.png`);
          if (file.exists) file.delete();
          file.write(base64, { encoding: "base64" });
          if (!(await Sharing.isAvailableAsync())) throw new Error("Este dispositivo no permite guardar ni compartir archivos");
          // The share sheet offers "Guardar imagen", AirDrop, WhatsApp, correo...
          await Sharing.shareAsync(file.uri, { mimeType: "image/png", UTI: "public.png", dialogTitle: "Guardar mi KORA TAG" });
        } catch (err) {
          fail(err);
        } finally {
          setExporting(false);
        }
      },
      { width: EXPORT_SIZE, height: EXPORT_SIZE },
    );
  };

  // ExploreScreen reads `id` (the userId) to open this person's KORA TAG profile.
  const qrPayload = JSON.stringify({
    id: userId ?? "",
    name,
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
              {name || "Mi Código QR"}
            </Text>
            <Text style={styles.subtitle}>
              Muestra este código para ser incorporado a proyectos
            </Text>
          </View>

          <View style={styles.qrContainer}>
            {userId ? (
              <QRCode
                value={qrPayload}
                size={200}
                quietZone={12}
                color={colors.primary}
                backgroundColor="#FFFFFF"
                getRef={(ref) => (svgRef.current = ref)}
              />
            ) : (
              <View style={styles.qrLoading}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )}
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Guardar mi KORA TAG"
            disabled={!userId || exporting}
            onPress={exportQr}
            style={[styles.exportButton, (!userId || exporting) && styles.exportDisabled]}
            testID="export-qr-button"
          >
            {exporting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="download" size={20} color="#FFFFFF" />
            )}
            <Text style={styles.exportText}>Guardar mi KORA TAG</Text>
          </TouchableOpacity>

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
    padding: 4,
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
  qrLoading: {
    width: 224,
    height: 224,
    alignItems: "center",
    justifyContent: "center",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "stretch",
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    marginTop: 16,
  },
  exportDisabled: {
    opacity: 0.6,
  },
  exportText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
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
