import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AuthBrand from "../components/AuthBrand";
import AuthField from "../components/AuthField";
import AuthPrimaryButton from "../components/AuthPrimaryButton";
import AuthSurface from "../components/AuthSurface";
import { useAuth } from "../context/authContext";

// Only reached with EXPO_PUBLIC_ROBLE_SIGNUP_ENDPOINT=signup (real e-mails): Roble mails a code after signup.
export default function VerifyEmailScreen({ navigation, route }: { navigation: any; route: any }) {
  const { validate, resendCode, loading } = useAuth();
  const email: string = route.params?.email ?? "";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const handleVerify = async () => {
    if (loading) return;
    if (!code.trim()) {
      setError("Ingresa el código que te enviamos");
      return;
    }
    // On success the context logs in and the app moves on to onboarding by itself.
    setError(await validate(email, code.trim()));
  };

  const handleResend = async () => {
    setError(null);
    const message = await resendCode(email);
    setError(message);
    setResent(!message);
  };

  return (
    <AuthSurface scroll>
        <View testID="verify-email-screen" style={styles.container}>
          <AuthBrand />
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>VERIFICA TU CORREO</Text>
            <Text style={styles.title}>Ingresa el código</Text>
            <Text style={styles.description}>
              Te enviamos un código a <Text style={styles.email}>{email}</Text>. Escríbelo para activar tu cuenta.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Código de verificación</Text>
            <AuthField
              icon="shield-key-outline"
              testID="verify-code-input"
              accessibilityLabel="Código de verificación"
              value={code}
              onChangeText={(value) => {
                setCode(value);
                setError(null);
                setResent(false);
              }}
              placeholder="Escribe el código"
              autoCapitalize="none"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              error={error ?? undefined}
            />
            {resent ? (
              <Text accessibilityLiveRegion="polite" style={styles.status} testID="code-resent-status">
                Te enviamos un código nuevo. Revisa también la carpeta de spam.
              </Text>
            ) : null}
          </View>

          <View style={styles.button}>
            <AuthPrimaryButton label="Verificar  →" onPress={handleVerify} testID="verify-code-button" disabled={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No te llegó?</Text>
            <TouchableOpacity accessibilityRole="button" onPress={handleResend} testID="resend-code-button">
              <Text style={styles.link}>Reenviar código</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Correo equivocado?</Text>
            <TouchableOpacity accessibilityRole="button" onPress={() => navigation.goBack()} testID="change-email-button">
              <Text style={styles.link}>Volver al registro</Text>
            </TouchableOpacity>
          </View>
        </View>
    </AuthSurface>
  );
}

// Same tokens as SignupScreen so both steps read as one flow.
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 48 },
  heading: { marginTop: 18, marginBottom: 27 },
  eyebrow: { color: "#A04BFF", fontSize: 13, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: "#211832", fontSize: 32, fontWeight: "800", marginTop: 5 },
  description: { color: "#756A8E", fontSize: 15, fontWeight: "600", lineHeight: 22, marginTop: 8 },
  email: { color: "#211832", fontWeight: "800" },
  form: { gap: 8 },
  label: { color: "#211832", fontSize: 14, fontWeight: "700", marginTop: 9 },
  status: { color: "#756A8E", fontSize: 12, lineHeight: 18, marginLeft: 16 },
  button: { marginTop: 28 },
  link: { color: "#4500B5", fontWeight: "800", textDecorationLine: "underline" },
  footer: { flexDirection: "row", gap: 5, marginTop: 22 },
  footerText: { color: "#756A8E", fontSize: 13, fontWeight: "600" },
});
