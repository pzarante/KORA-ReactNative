import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors, ui } from "@/src/features/projects/presentation/components/projectUi";
import { UserProfile } from "../../domain/entities/UserProfile";

type Contact = Pick<UserProfile, "whatsapp" | "correoContacto">;

/** WhatsApp (country code + number) and contact e-mail, as in Figma "medios de contacto". */
export default function ContactFields({ value, onChange }: { value: Contact; onChange: (patch: Partial<Contact>) => void }) {
  const [savedCode, ...rest] = value.whatsapp.split(" ");
  const [code, setCode] = useState(savedCode || "+57");
  const number = rest.join(" ");
  const setPhone = (c: string, n: string) => onChange({ whatsapp: n.trim() ? `${c.trim()} ${n.trim()}` : "" });

  return (
    <View>
      <View style={styles.label}>
        <MaterialCommunityIcons name="whatsapp" size={26} color={colors.primary} />
        <Text style={styles.labelText}>WhatsApp</Text>
      </View>
      <View style={styles.phone}>
        <TextInput
          accessibilityLabel="Indicativo del país"
          style={[ui.input, styles.code]}
          value={code}
          onChangeText={(c) => {
            setCode(c);
            setPhone(c, number);
          }}
          keyboardType="phone-pad"
          maxLength={5}
          testID="contact-code-input"
        />
        <TextInput
          accessibilityLabel="Número de WhatsApp"
          style={[ui.input, styles.field, styles.grow]}
          value={number}
          onChangeText={(n) => setPhone(code, n)}
          placeholder="300 123 4567"
          placeholderTextColor={colors.muted}
          keyboardType="phone-pad"
          autoComplete="tel"
          testID="contact-whatsapp-input"
        />
      </View>

      <View style={styles.label}>
        <MaterialCommunityIcons name="email-outline" size={26} color={colors.primary} />
        <Text style={styles.labelText}>Correo electrónico</Text>
      </View>
      <TextInput
        accessibilityLabel="Correo de contacto"
        style={[ui.input, styles.field]}
        value={value.correoContacto}
        onChangeText={(correoContacto) => onChange({ correoContacto })}
        placeholder="ejemplo@uninorte.edu.co"
        placeholderTextColor={colors.muted}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        testID="contact-email-input"
      />

      <View style={styles.note}>
        <MaterialCommunityIcons name="information-outline" size={24} color={colors.muted} />
        <Text style={styles.noteText}>Esta información solo será visible para usuarios con los que decidas colaborar.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 22, marginBottom: 12 },
  labelText: { color: colors.text, fontSize: 18, fontWeight: "800" },
  phone: { flexDirection: "row", gap: 12 },
  code: { width: 92, backgroundColor: colors.soft, borderColor: colors.soft, fontWeight: "800", textAlign: "center" },
  field: { backgroundColor: "rgba(255,255,255,0.88)" },
  grow: { flex: 1 },
  note: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.soft, borderRadius: 24, padding: 18, marginTop: 28 },
  noteText: { flex: 1, color: colors.muted, fontSize: 14, lineHeight: 20 },
});
