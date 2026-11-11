import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import MyQRCodeModal from "@/src/features/projects/presentation/components/MyQRCodeModal";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Button, Surface, Text } from "react-native-paper";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [qrModalVisible, setQrModalVisible] = useState(false);

  return (
    <Surface style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Mi Perfil" />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="titleMedium" style={styles.text}>
          {user?.name ? `Hola, ${user.name}` : "Perfil de usuario"}
        </Text>

        <Button
          mode="contained"
          icon="qrcode"
          onPress={() => setQrModalVisible(true)}
          style={styles.qrButton}
        >
          Mi KORA TAG
        </Button>
      </View>

      <MyQRCodeModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        userProfile={user}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    marginBottom: 16,
  },
  qrButton: {
    borderRadius: 24,
  },
});
