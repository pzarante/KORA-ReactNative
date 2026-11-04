import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AuthBrand from "../components/AuthBrand";
import AuthField from "../components/AuthField";
import AuthPrimaryButton from "../components/AuthPrimaryButton";
import AuthSurface from "../components/AuthSurface";
import { useAuth } from "../context/authContext";

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (loading) return;
    if (!email.trim()) return setValidationError("Ingresa tu correo");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return setValidationError("Ingresa un correo válido");
    }
    if (!password) return setValidationError("Ingresa tu contraseña");
    if (password.length < 6) {
      return setValidationError("La contraseña debe tener mínimo 6 caracteres");
    }

    setValidationError(null);
    await login(email.trim(), password);
  };

  return (
    <AuthSurface>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <View testID="login-screen" style={styles.container}>
          <AuthBrand />
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>¡HOLA DE NUEVO!</Text>
            <Text style={styles.title}>Iniciar Sesión</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <AuthField
              icon="✉"
              testID="email-input"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setValidationError(null);
              }}
              placeholder="Escribe tu correo"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Text style={styles.label}>Contraseña</Text>
            <AuthField
              icon="▢"
              testID="password-input"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setValidationError(null);
              }}
              placeholder="Escribe tu contraseña"
              secureTextEntry
              autoComplete="password"
              error={validationError ?? error ?? undefined}
            />
          </View>

          <TouchableOpacity
            accessibilityRole="link"
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.forgot}
          >
            <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <AuthPrimaryButton
            label="Iniciar Sesión"
            onPress={handleLogin}
            testID="login-button"
            disabled={loading}
          />

          <View style={styles.footer}>
            <View style={styles.line} />
            <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
            <TouchableOpacity
              accessibilityRole="link"
              onPress={() => navigation.navigate("Signup")}
              testID="create-account-button"
            >
              <Text style={styles.link}>Regístrate</Text>
            </TouchableOpacity>
            <View style={styles.line} />
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
  forgot: { alignSelf: "flex-end", marginTop: 14, marginBottom: 31 },
  link: { color: "#4500B5", fontSize: 13, fontWeight: "800", textDecorationLine: "underline" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24 },
  line: { height: 1, backgroundColor: "#E6DDF2", flex: 1 },
  footerText: { color: "#756A8E", fontSize: 13, fontWeight: "600" },
});
