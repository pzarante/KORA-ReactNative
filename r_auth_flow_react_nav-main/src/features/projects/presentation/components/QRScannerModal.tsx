import { colors } from "@/src/shared/ui/tokens";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const SCANNER_SIZE = width * 0.7; // Tamaño del recuadro de lectura

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
}

export default function QRScannerModal({
  visible,
  onClose,
  onScanSuccess,
}: QRScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false);
    }
  }, [visible]);

  if (!visible) return null;

  if (!permission?.granted) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.permissionContainer}>
          <MaterialCommunityIcons
            name="camera-off"
            size={64}
            color={colors.primary}
          />
          <Text style={styles.permissionTitle}>
            Permiso de cámara requerido
          </Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a tu cámara para poder escanear el KORA TAG.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Conceder permiso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeTextButton} onPress={onClose}>
            <Text style={styles.closeText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScanSuccess(data);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          {/* Overlay oscuro para enfocar la vista en el marco central */}
          <View style={styles.overlay}>
            <View style={styles.overlayRow} />
            <View style={styles.centerRow}>
              <View style={styles.overlaySide} />

              {/* Recuadro / Marco central donde se alinea el QR */}
              <View style={styles.scanBox}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>

              <View style={styles.overlaySide} />
            </View>

            <View style={styles.overlayBottom}>
              <Text style={styles.instructionText}>
                Alinea el código QR de KORA TAG dentro del marco
              </Text>

              {/* Botón flotante para disparar el escaneo si deseas captura manual */}
              <TouchableOpacity
                style={styles.captureButton}
                onPress={() => {
                  // Simula o confirma lectura manual si no detecta automáticamente
                  handleBarcodeScanned({ data: "nancy-kora-tag-id" });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.captureButtonInner}>
                  <MaterialCommunityIcons
                    name="qrcode-scan"
                    size={28}
                    color="#FFFFFF"
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón de cerrar superior */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 25,
  },
  overlay: { flex: 1 },
  overlayRow: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)" },
  centerRow: { flexDirection: "row", height: SCANNER_SIZE },
  overlaySide: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)" },
  scanBox: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: colors.primary,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 20,
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
    gap: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 10,
  },
  permissionButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 15 },
  closeTextButton: { padding: 10 },
  closeText: { color: colors.muted, fontSize: 14, fontWeight: "600" },
});
