/**
 * Design tokens shared by every feature.
 * Feature code must import colors from here, never from another feature.
 * Values sampled from the Figma captures (see DESIGN_SYSTEM.md §1.1).
 */
export const colors = {
  primary: "#3C00A0",
  text: "#1E1630",
  muted: "#6B6282",
  border: "#E9DCFA",
  soft: "#F0EBFF",
  card: "#FEFCFF",
  orange: "#FF6B00",
  orangeSoft: "#FFEBDF",
  error: "#C62828",
  /** Error card (Figma p. 16–18): pink fill and border. */
  errorSoft: "#FDE8E8",
  errorBorder: "#F6C7C7",
  /** Good-news icons (e.g. accepted request) on a mint tile. */
  success: "#1E8E4E",
  successSoft: "#E2F5EA",
  /** Track of the step progress bar. */
  progressTrack: "#E8D9FA",
  /** Disabled primary button: fill and label. */
  disabled: "#E5E0E8",
  disabledText: "#A49DB0",
  /** Dimmed background behind popups and sheets. */
  scrim: "rgba(33,24,50,0.53)",
} as const;

/** Fill of the big primary buttons, left to right. */
export const primaryGradient = ["#4E11BD", "#5F22D9"] as const;
