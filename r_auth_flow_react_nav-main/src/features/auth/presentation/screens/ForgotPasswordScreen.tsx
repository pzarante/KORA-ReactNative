import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BrandLogo from "@/src/shared/ui/BrandLogo";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";
import { useAuth } from "../context/authContext";
import { colors } from "@/src/shared/ui/tokens";
import ButtonGradient from "@/src/shared/ui/ButtonGradient";

export default function ForgotPasswordScreen({ navigation }: { navigation: any }) {
  const { forgotPassword, error, loading, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [requestFailed, setRequestFailed] = useState(false);

  const handleSendResetEmail = async () => {
    const normalizedEmail = email.trim();
    setSubmitted(false);
    setEmailError(null);
    setRequestFailed(false);
    clearError();

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setEmailError("Ingresa un correo electrónico válido.");
      return;
    }

    if (await forgotPassword(normalizedEmail)) {
      setSubmitted(true);
    } else {
      setRequestFailed(true);
    }
  };

  return (
    <ScreenSurface>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View testID="forgot-password-screen" style={styles.container}>
            <BrandLogo />

            <View style={styles.heading}>
              <Text style={styles.eyebrow}>¿OLVIDASTE TU CONTRASEÑA?</Text>
              <Text style={styles.title}>Recuperar Contraseña</Text>
              <Text style={styles.description}>
                Ingresa tu correo electrónico y te enviaremos un enlace para
                restablecer tu contraseña.
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={17}
                  color={colors.muted}
                />
                <TextInput
                  accessibilityLabel="Correo Electrónico"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  onChangeText={(value) => {
                    setEmail(value);
                    setSubmitted(false);
                    setEmailError(null);
                    setRequestFailed(false);
                    clearError();
                  }}
                  placeholder="Escribe tu correo"
                  placeholderTextColor="#666666"
                  style={styles.input}
                  testID="forgot-password-email-input"
                  value={email}
                />
              </View>
              {emailError ? (
                <Text accessibilityRole="alert" style={styles.error}>
                  {emailError}
                </Text>
              ) : null}
              {requestFailed || error ? (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error ?? "No pudimos enviar el enlace. Intenta de nuevo más tarde."}
                </Text>
              ) : null}

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ disabled: loading }}
                disabled={loading}
                onPress={handleSendResetEmail}
                style={[styles.sendLink, loading && styles.sendLinkDisabled]}
                testID="send-reset-link-button"
              >
                <Text style={styles.sendLinkText}>
                  {loading ? "Enviando..." : "Enviar enlace"}
                </Text>
              </TouchableOpacity>
              {submitted ? (
                <Text
                  accessibilityLiveRegion="polite"
                  style={styles.status}
                  testID="reset-submission-status"
                >
                  Si el correo está registrado, recibirás un enlace para
                  restablecer tu contraseña.
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => navigation.navigate("Login")}
              style={styles.backButton}
              testID="back-to-login-button"
            >
              <ButtonGradient radius={28} />
              <Text style={styles.backButtonText}>
                Volver a Inicio de sesión
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={15}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  container: {
    flex: 1,
    paddingTop: 48,
    paddingBottom: 32,
  },
  heading: {
    marginTop: 18,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.32,
    marginTop: 10,
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22.5,
    marginTop: 7,
  },
  form: {
    marginTop: 82,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  inputWrapper: {
    height: 54,
    borderWidth: 1,
    borderColor: "#E9E3F5",
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginHorizontal: 2,
  },
  input: {
    flex: 1,
    color: "#666666",
    fontSize: 15,
    marginLeft: 12,
    paddingVertical: 0,
  },
  sendLink: {
    alignSelf: "flex-start",
    marginTop: 7,
    marginLeft: 21,
    paddingVertical: 2,
  },
  sendLinkText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  sendLinkDisabled: { opacity: 0.6 },
  error: {
    color: "#B42318",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    marginHorizontal: 21,
  },
  status: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    marginHorizontal: 21,
  },
  backButton: {
    minHeight: 54,
    borderRadius: 28,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    marginLeft: -3,
    marginRight: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.19,
    shadowRadius: 8,
    elevation: 5,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 7,
  },
});
