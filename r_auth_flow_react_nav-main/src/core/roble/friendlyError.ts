// Screens show err.message as is, so raw Roble/DB texts must never reach a thrown Error.
export const NO_CONNECTION_MESSAGE = "No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.";
export const NOT_SAVED_MESSAGE = "La información no se guardó. Intenta de nuevo más tarde.";

export function friendlyStatusMessage(status: number): string {
  if (status === 401) return "Tu sesión expiró. Inicia sesión de nuevo.";
  if (status === 403) return "No tienes permiso para hacer esto.";
  if (status === 400 || status === 422) return "Revisa los datos e intenta de nuevo.";
  return "El servidor está ocupado. Intenta de nuevo en un momento.";
}
