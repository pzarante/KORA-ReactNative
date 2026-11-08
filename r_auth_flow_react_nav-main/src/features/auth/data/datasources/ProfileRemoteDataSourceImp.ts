import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { UserProfile } from "../../domain/entities/UserProfile";
import { ProfileDataSource } from "./ProfileDataSource";

type RemoteProfile = UserProfile & { _id?: string };

export class ProfileRemoteDataSourceImp implements ProfileDataSource {
  private readonly baseUrl: string;
  private readonly prefs = LocalPreferencesAsyncStorage.getInstance();

  constructor(projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    const apiUrl = (process.env.EXPO_PUBLIC_ROBLE_API_URL ?? "https://roble-api.openlab.uninorte.edu.co").replace(/\/$/, "");
    this.baseUrl = `${apiUrl}/database/${projectId}`;
  }

  async saveProfile(profile: Omit<UserProfile, "userId">): Promise<void> {
    const token = await this.prefs.retrieveData<string>("token");
    if (!token) throw new Error("No hay una sesión activa para guardar el perfil");

    const userId = this.getUserIdFromToken(token);
    const completeProfile: UserProfile = { ...profile, userId };
    const existing = await this.findProfile(userId, token);
    const response = existing
      ? await fetch(`${this.baseUrl}/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            tableName: "Usuario",
            idColumn: "_id",
            idValue: existing._id,
            updates: this.toRecord(completeProfile),
          }),
        })
      : await fetch(`${this.baseUrl}/insert`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ tableName: "Usuario", records: [this.toRecord(completeProfile)] }),
        });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(`No se pudo guardar el perfil: ${body.message ?? response.status}`);
    }
  }

  private async findProfile(userId: string, token: string): Promise<RemoteProfile | undefined> {
    const response = await fetch(
      `${this.baseUrl}/read?tableName=Usuario&user_id=${encodeURIComponent(userId)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.status === 404) return undefined;
    if (!response.ok) {
      throw new Error(`No se pudo consultar la tabla Usuario: ${response.status}`);
    }
    const rows = (await response.json()) as RemoteProfile[];
    return rows[0];
  }

  private toRecord(profile: UserProfile) {
    return {
      user_id: profile.userId,
      nombre_completo: profile.nombreCompleto,
      rol: profile.rol,
      habilidades: profile.habilidades,
      info_adicional: profile.infoAdicional,
      onboarding_completado: profile.onboardingCompletado,
      updated_at: new Date().toISOString(),
    };
  }

  private getUserIdFromToken(token: string): string {
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
}