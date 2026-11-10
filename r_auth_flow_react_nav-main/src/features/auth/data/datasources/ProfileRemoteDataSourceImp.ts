import { LocalPreferencesAsyncStorage } from "@/src/shared/storage/LocalPreferencesAsyncStorage";
import { userIdFromToken } from "@/src/core/userIdFromToken";
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

    const userId = userIdFromToken(token);
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

  async getProfile(userId?: string): Promise<UserProfile | null> {
    const token = await this.prefs.retrieveData<string>("token");
    if (!token) return null;
    const row: any = await this.findProfile(userId ?? userIdFromToken(token), token);
    if (!row) return null;
    return {
      userId: row.user_id,
      nombreCompleto: row.nombre_completo ?? "",
      rol: row.rol ?? "",
      habilidades: Array.isArray(row.habilidades) ? row.habilidades : [],
      infoAdicional: row.info_adicional ?? "",
      whatsapp: row.whatsapp ?? "",
      correoContacto: row.correo_contacto ?? "",
      onboardingCompletado: !!row.onboarding_completado,
    };
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
    // Never trust rows[0]: if the filter is ignored, it would be another user's profile.
    return rows.find((row) => row.user_id === userId);
  }

  private toRecord(profile: UserProfile) {
    return {
      user_id: profile.userId,
      nombre_completo: profile.nombreCompleto,
      rol: profile.rol,
      habilidades: profile.habilidades,
      info_adicional: profile.infoAdicional,
      whatsapp: profile.whatsapp,
      correo_contacto: profile.correoContacto,
      // The Roble column is a timestamp (NOT NULL): store when onboarding was completed.
      onboarding_completado: profile.onboardingCompletado ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
  }
}