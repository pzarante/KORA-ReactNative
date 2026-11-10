import { Platform } from "react-native";

import { colors } from "./tokens";

/**
 * Web-only reset for native browser input chrome.
 *
 * Chrome/Edge/Firefox paint their own focus ring and autofill background on
 * <input>/<textarea>. Inside the rounded pills used by the app those colors
 * (yellow on some themes/browsers) bleed over the text area. React Native Web
 * resets the border but not the outline or autofill, so we patch both here.
 */
const INPUT_RESET_CSS = `
input,
textarea {
  outline: none !important;
  -webkit-tap-highlight-color: transparent;
}

input:focus,
textarea:focus {
  outline: none !important;
}

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active,
textarea:-webkit-autofill,
textarea:-webkit-autofill:hover,
textarea:-webkit-autofill:focus,
textarea:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px #FFFFFF inset !important;
  box-shadow: 0 0 0 1000px #FFFFFF inset !important;
  -webkit-text-fill-color: ${colors.text} !important;
  caret-color: ${colors.text} !important;
  transition: background-color 600000s 0s, color 600000s 0s !important;
}

/* Firefox */
input:autofill,
textarea:autofill {
  background-color: #FFFFFF !important;
  box-shadow: 0 0 0 1000px #FFFFFF inset !important;
  color: ${colors.text} !important;
  caret-color: ${colors.text} !important;
}
`;

let installed = false;

/** Injects the reset once. No-op on native and in non-DOM environments. */
export function installWebInputStyles(): void {
  if (installed || Platform.OS !== "web" || typeof document === "undefined") return;

  const style = document.createElement("style");
  style.setAttribute("data-kora", "input-reset");
  style.textContent = INPUT_RESET_CSS;
  document.head.appendChild(style);
  installed = true;
}
