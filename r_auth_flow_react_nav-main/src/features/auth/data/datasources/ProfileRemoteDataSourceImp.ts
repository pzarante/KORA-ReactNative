import { LocalPreferencesAsyncStorage } from "@/src/shared/storage/LocalPreferencesAsyncStorage";
import { userIdFromToken } from "@/src/core/userIdFromToken";
import { canJoinProjects, UserProfile } from "../../domain/entities/UserProfile";
import { AuthRemoteDataSource } from "./AuthRemoteDataSource";
import { ProfileDataSource } from "./ProfileDataSource";

type RemoteProfile = { _id?: string; user_id?: string; onboarding_completado?: string | null };

export class ProfileRemoteDataSourceImp implements ProfileDataSource {
  private readonly baseUrl: string;
  private readonly prefs = LocalPreferencesAsyncStorage.getInstance();

  constructor(
    projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID,
    // Optional so tests can build it alone; the app passes it so an expired token gets refreshed.
    private readonly authService?: AuthRemoteDataSource,
  ) {
    if (!projectId) throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    const apiUrl = (process.env.EXPO_PUBLIC_ROBLE_API_URL ?? "https://roble-api.test-openlab.uninorte.edu.co").replace(/\/$/, "");
    this.baseUrl = `${apiUrl}/database/${projectId}`;
  }

  async saveProfile(profile: Omit<UserProfile, "userId">): Promise<void> {
    const token = await this.prefs.retrieveData<string>("token");
    if (!token) throw new Error("No hay una sesión activa para guardar el perfil");

    const userId = userIdFromToken(token);
    const completeProfile: UserProfile = { ...profile, userId };
    const existing = await this.findProfile(userId);
    const response = existing
      ? await this.send(`${this.baseUrl}/update`, {
          method: "PUT",
          body: JSON.stringify({
            tableName: "Usuario",
            idColumn: "_id",
            idValue: existing._id,
            updates: this.toRecord(completeProfile, existing.onboarding_completado),
          }),
        })
      : await this.send(`${this.baseUrl}/insert`, {
          method: "POST",
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
    const row: any = await this.findProfile(userId ?? userIdFromToken(token));
    if (!row) return null;
    const nombreCompleto = row.nombre_completo ?? "";
    const rol = row.rol ?? "";
    return {
      userId: row.user_id,
      nombreCompleto,
      rol,
      habilidades: Array.isArray(row.habilidades) ? row.habilidades : [],
      infoAdicional: row.info_adicional ?? "",
      whatsapp: row.whatsapp ?? "",
      correoContacto: row.correo_contacto ?? "",
      // Derived from the data, not the column: onboarding_completado is always filled (see toRecord).
      onboardingCompletado: canJoinProjects({ nombreCompleto, rol }),
    };
  }

  /** Sends with the session token; on 401 refreshes it once and retries, like RobleDatabase. */
  private async send(url: string, init: RequestInit = {}): Promise<Response> {
    const request = async () => {
      const token = await this.prefs.retrieveData<string>("token");
      return fetch(url, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
    };
    const response = await request();
    if (response.status !== 401 || !this.authService) return response;
    const refreshed = await this.authService.refreshToken().catch(() => false);
    return refreshed ? request() : response;
  }

  private async findProfile(userId: string): Promise<RemoteProfile | undefined> {
    const response = await this.send(`${this.baseUrl}/read?tableName=Usuario&user_id=${encodeURIComponent(userId)}`);
    if (response.status === 404) return undefined;
    if (!response.ok) {
      throw new Error(`No se pudo consultar la tabla Usuario: ${response.status}`);
    }
    const rows = (await response.json()) as RemoteProfile[];
    // Never trust rows[0]: if the filter is ignored, it would be another user's profile.
    return rows.find((row) => row.user_id === userId);
  }

  private toRecord(profile: UserProfile, completedAt?: string | null) {
    return {
      user_id: profile.userId,
      nombre_completo: profile.nombreCompleto,
      rol: profile.rol,
      habilidades: profile.habilidades,
      info_adicional: profile.infoAdicional,
      whatsapp: profile.whatsapp,
      correo_contacto: profile.correoContacto,
      // Roble keeps this column NOT NULL and its SQL console can't change that, so it always holds a
      // date: when the profile was first saved. Whether onboarding is done is derived on read.
      onboarding_completado: completedAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}