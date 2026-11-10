import { MD3LightTheme } from "react-native-paper";

import { colors } from "@/src/shared/ui/tokens";

/**
 * The only theme: Figma has no dark mode (DESIGN_SYSTEM.md §1.2), so the app stays light
 * even when the phone is in dark mode. Paper and the navigation take their colors from here.
 */
export const brandTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: "#FFFFFF",
    primaryContainer: colors.soft,
    onPrimaryContainer: colors.primary,
    secondary: colors.orange,
    onSecondary: "#FFFFFF",
    secondaryContainer: colors.orangeSoft,
    onSecondaryContainer: colors.orange,
    background: "#FFFFFF",
    onBackground: colors.text,
    surface: "#FFFFFF",
    onSurface: colors.text,
    surfaceVariant: colors.soft,
    onSurfaceVariant: colors.muted,
    outline: colors.border,
    error: colors.error,
  },
};
