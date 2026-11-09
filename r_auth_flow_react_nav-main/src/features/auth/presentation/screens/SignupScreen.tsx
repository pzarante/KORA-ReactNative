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
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const handleSignup = async () => {
    if (loading) return;
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setEmailError("Ingresa un correo válido");
      return;
    }
    if (password.length < 6) {
      setPasswordError("La contraseña debe tener mínimo 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      return;
    }
    if (!acceptedTerms) {
      setConfirmPasswordError("Acepta los términos y condiciones");
      return;
    }

    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    if (await signup(email.trim(), password)) navigation.navigate("VerifyEmail", { email: email.trim() });
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
              icon="email-outline"
              testID="signup-email-input"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setEmailError(null);
              }}
              placeholder="ejemplo@uninorte.co"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError ?? undefined}
            />
            <Text style={styles.label}>Contraseña</Text>
            <AuthField
              icon="lock-outline"
              testID="signup-password-input"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setPasswordError(null);
              }}
              placeholder="Crea tu contraseña"
              secureTextEntry
              error={passwordError ?? undefined}
            />
            <Text style={styles.label}>Confirmar Contraseña</Text>
            <AuthField
              icon="lock-outline"
              testID="signup-confirm-password-input"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setConfirmPasswordError(null);
              }}
              placeholder="Repite tu contraseña"
              secureTextEntry
              error={confirmPasswordError ?? error ?? undefined}
            />
          </View>

          <TouchableOpacity
            onPress={() => {
              setAcceptedTerms((current) => !current);
              setConfirmPasswordError(null);
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
