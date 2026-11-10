/**
 * Design tokens shared by every feature.
 * Feature code must import colors from here, never from another feature.
 */
export const colors = {
  primary: "#3C00A0",
  text: "#1E1630",
  muted: "#6B6282",
  border: "#E9DCFA",
  soft: "#EEE4FC",
  card: "#FEFCFF",
  orange: "#E96212",
  orangeSoft: "#FFE8D8",
  error: "#C62828",
} as const;
