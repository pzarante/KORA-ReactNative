import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { StyleSheet, Text, TextInput } from "react-native";

/** Figma's typeface (DESIGN_SYSTEM.md §2). Pass to `useFonts` at the app root. */
export const brandFonts = {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
};

/** With a loaded font every weight is its own family; `fontWeight` alone picks nothing. */
function familyFor(weight: unknown): string {
  switch (String(weight ?? "400")) {
    case "500":
      return "PlusJakartaSans_500Medium";
    case "600":
      return "PlusJakartaSans_600SemiBold";
    case "700":
    case "bold":
      return "PlusJakartaSans_700Bold";
    case "800":
    case "900":
      return "PlusJakartaSans_800ExtraBold";
    default:
      return "PlusJakartaSans_400Regular";
  }
}

let installed = false;

/**
 * Makes every Text and TextInput use Plus Jakarta Sans in the weight its style asks for,
 * so no screen has to set `fontFamily`. Styles that set their own `fontFamily` (e.g. Sora
 * on Welcome) are left alone. Call once, after the fonts loaded and before rendering.
 */
export function installBrandFont() {
  if (installed) return;
  installed = true;
  for (const component of [Text, TextInput] as any[]) {
    const render = component.render;
    if (typeof render !== "function") continue;
    component.render = function (props: any, ref: any) {
      const flat = StyleSheet.flatten(props.style) ?? {};
      if (flat.fontFamily) return render.call(this, props, ref);
      const font = { fontFamily: familyFor(flat.fontWeight), fontWeight: "normal" as const };
      return render.call(this, { ...props, style: [props.style, font] }, ref);
    };
  }
}
