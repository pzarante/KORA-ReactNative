export function userIdFromToken(token: string): string {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(globalThis.atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    const userId = decoded.sub ?? decoded.uid ?? decoded.user_id ?? decoded.userId ?? decoded.id;
    if (typeof userId === "string" && userId.length > 0) return userId;
  } catch {
    // The API should return a JWT; the explicit error below is more useful if it does not.
  }
  throw new Error("La sesión de Roble no contiene el user_id del usuario");
}
