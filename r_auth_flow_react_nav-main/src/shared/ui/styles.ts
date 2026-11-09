import { StyleSheet } from "react-native";

import { colors } from "./tokens";

/** Reusable form/button styles shared by every feature. */
export const ui = StyleSheet.create({
  label: { color: colors.text, fontSize: 16, fontWeight: "800", marginBottom: 10 },
  required: { color: colors.orange },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    paddingHorizontal: 18,
    color: colors.text,
    fontSize: 15,
    backgroundColor: "#FFFFFF",
  },
  textArea: { minHeight: 120, borderRadius: 24, paddingTop: 16, textAlignVertical: "top" },
  helper: { color: colors.muted, fontSize: 13, marginTop: 8, marginLeft: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.soft },
  chipText: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  primaryButton: { flex: 1, minHeight: 54, borderRadius: 30, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryButtonDisabled: { backgroundColor: "#E4E0EA" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  primaryButtonTextDisabled: { color: "#A49DB0" },
  outlineButton: { minHeight: 54, borderRadius: 30, borderWidth: 1.5, borderColor: colors.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  outlineButtonText: { color: colors.primary, fontSize: 16, fontWeight: "800" },
  error: { color: colors.error, marginTop: 12, textAlign: "center" },
});
