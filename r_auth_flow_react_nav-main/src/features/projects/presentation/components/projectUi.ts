import { StyleSheet } from "react-native";

export const colors = {
  primary: "#4500B5",
  text: "#211832",
  muted: "#756A8E",
  border: "#E6DDF2",
  soft: "#F5EEFF",
  card: "#F8F5FC",
  orange: "#FF5A00",
  orangeSoft: "#FFEDE3",
  error: "#C62828",
};

// MaterialCommunityIcons names; the first six are the quick picks in "Información básica".
export const PROJECT_ICONS = [
  "leaf", "web", "chip", "apple-keyboard-command", "gamepad-variant-outline", "book-open-variant", "cube-outline",
  "lightbulb-on-outline", "account-group-outline", "school-outline", "flask-outline", "laptop", "cellphone", "weather-cloudy",
  "white-balance-sunny", "water-outline", "recycle", "tree-outline", "sprout-outline", "heart-outline", "medical-bag",
  "wheelchair-accessibility", "briefcase-outline", "storefront-outline", "office-building-outline", "home-outline", "map-marker-outline", "compass-outline",
  "camera-outline", "music-note-outline", "palette-outline", "pencil-outline", "cog-outline", "rocket-launch-outline", "forum-outline",
  "chart-bar", "chart-pie", "presentation", "bullhorn-outline", "handshake-outline", "calendar-blank-outline", "clipboard-check-outline",
  "target", "trophy-outline", "flag-outline", "sitemap-outline", "trending-up", "layers-outline", "database-outline",
  "shield-check-outline", "lock-outline", "key-outline", "puzzle-outline", "server", "headphones", "movie-open-outline",
  "soccer", "microphone-outline", "hand-heart-outline", "paw-outline", "flower-outline", "waves", "image-filter-hdr",
  "tent", "campfire", "test-tube", "earth", "star-four-points-outline", "star-shooting-outline", "bank-outline",
] as const;

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

export const URL_PATTERN = /^https?:\/\/\S+\.\S+$/i;
