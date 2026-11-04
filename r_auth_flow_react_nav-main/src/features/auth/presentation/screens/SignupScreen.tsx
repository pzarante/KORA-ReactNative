import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AuthBrand from "../components/AuthBrand";
import AuthField from "../components/AuthField";
import AuthPrimaryButton from "../components/AuthPrimaryButton";
import AuthSurface from "../components/AuthSurface";
import { useAuth } from "../context/authContext";

export default function SignupScreen({ navigation }: { navigation: any }) {
  const { signup, error, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSignup = async () => {
    if (loading) return;
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return setValidationError("Ingresa un correo válido");
    }
    if (password.length < 6) {
      return setValidationError("La contraseña debe tener mínimo 6 caracteres");
    }
    if (password !== confirmPassword) {
      return setValidationError("Las contraseñas no coinciden");
    }
    if (!acceptedTerms) return setValidationError("Acepta los términos y condiciones");

    setValidationError(null);
    await signup(email.trim(), password);
  };

  return (
    <AuthSurface>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <View testID="signup-screen" style={styles.container}>
          <AuthBrand />
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>REGÍSTRATE</Text>
            <Text style={styles.title}>Crear Cuenta</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <AuthField
              icon="✉"
              testID="signup-email-input"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setValidationError(null);
              }}
              placeholder="ejemplo@uninorte.co"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.label}>Contraseña</Text>
            <AuthField
              icon="▢"
              testID="signup-password-input"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setValidationError(null);
              }}
              placeholder="Crea tu contraseña"
              secureTextEntry
            />
            <Text style={styles.label}>Confirmar Contraseña</Text>
            <AuthField
              icon="▢"
              testID="signup-confirm-password-input"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setValidationError(null);
              }}
              placeholder="Repite tu contraseña"
              secureTextEntry
              error={validationError ?? error ?? undefined}
            />
          </View>

          <TouchableOpacity
            onPress={() => {
              setAcceptedTerms((current) => !current);
              setValidationError(null);
            }}
            style={styles.terms}
          >
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={styles.termsText}>
              Acepto los <Text style={styles.link}>términos y condiciones</Text> de uso
            </Text>
          </TouchableOpacity>

          <AuthPrimaryButton
            label="Continuar"
            onPress={handleSignup}
            testID="signup-button"
            disabled={loading}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")} testID="go-to-login-button">
              <Text style={styles.link}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AuthSurface>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  container: { flex: 1, paddingTop: 48 },
  heading: { marginTop: 18, marginBottom: 27 },
  eyebrow: { color: "#A04BFF", fontSize: 13, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: "#211832", fontSize: 32, fontWeight: "800", marginTop: 5 },
  form: { gap: 8 },
  label: { color: "#211832", fontSize: 14, fontWeight: "700", marginTop: 9 },
  terms: { flexDirection: "row", alignItems: "center", gap: 11, marginVertical: 21 },
  checkbox: { width: 22, height: 22, borderWidth: 1, borderColor: "#4500B5", borderRadius: 6, alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: "#4500B5" },
  checkmark: { color: "#FFFFFF", fontWeight: "800" },
  termsText: { flex: 1, color: "#211832", fontSize: 13, fontWeight: "600" },
  link: { color: "#4500B5", fontWeight: "800", textDecorationLine: "underline" },
  footer: { flexDirection: "row", gap: 5, marginTop: 22 },
  footerText: { color: "#756A8E", fontSize: 13, fontWeight: "600" },
});
