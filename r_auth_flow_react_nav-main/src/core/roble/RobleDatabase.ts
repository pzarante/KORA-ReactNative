import { LocalPreferencesAsyncStorage } from "@/src/shared/storage/LocalPreferencesAsyncStorage";
import { userIdFromToken } from "@/src/core/userIdFromToken";
import { AuthRemoteDataSource } from "@/src/features/auth/data/datasources/AuthRemoteDataSource";

/**
 * Generic client for the Roble database API (read / insert / update), shared by every
 * feature's remote data source. Handles the session token, its refresh and guest sessions.
 */
export class RobleDatabase {
  private readonly baseUrl: string;
  private readonly authUrl: string;
  private readonly prefs = LocalPreferencesAsyncStorage.getInstance();
  private guestSession?: Promise<string>;

  constructor(
    private authService: AuthRemoteDataSource,
    projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID,
  ) {
    if (!projectId) throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    const apiUrl = (process.env.EXPO_PUBLIC_ROBLE_API_URL ?? "https://roble-api.openlab.uninorte.edu.co").replace(/\/$/, "");
    this.baseUrl = `${apiUrl}/database/${projectId}`;
    this.authUrl = `${apiUrl}/auth/${projectId}`;
  }

  async currentUserId(): Promise<string | null> {
    const token = await this.prefs.retrieveData<string>("token");
    return token ? userIdFromToken(token) : null;
  }

  async update(table: string, id: string, updates: object, errorPrefix: string) {
    const response = await this.authorized(`${this.baseUrl}/update`, {
      method: "PUT",
      body: JSON.stringify({ tableName: table, idColumn: "_id", idValue: id, updates }),
    });
    await this.ensureOk(response, errorPrefix);
  }

  async read(table: string, filter: Record<string, string>): Promise<any[]> {
    const params = new URLSearchParams({ tableName: table, ...filter });
    const response = await this.authorized(`${this.baseUrl}/read?${params}`, { method: "GET" });
    // Roble answers 404 when no row matches the filter.
    if (response.status === 404) return [];
    await this.ensureOk(response, `No se pudo leer ${table}`);
    const rows = await response.json();
    return Array.isArray(rows) ? rows : [];
  }

  async insert(table: string, record: object | object[], errorPrefix: string): Promise<any> {
    const response = await this.authorized(`${this.baseUrl}/insert`, {
      method: "POST",
      body: JSON.stringify({ tableName: table, records: Array.isArray(record) ? record : [record] }),
    });
    await this.ensureOk(response, errorPrefix);
    const body = await response.json().catch(() => ({}));
    return body?.inserted?.[0];
  }

  private async authorized(url: string, init: RequestInit): Promise<Response> {
    const send = (accessToken: string) =>
      fetch(url, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` } });

    const token = await this.prefs.retrieveData<string>("token");
    if (!token) {
      const session = this.guestAccessToken();
      const response = await send(await session);
      if (response.status !== 401) return response;
      // Renew once; if a parallel request already renewed it, reuse that one.
      return send(await this.guestAccessToken(this.guestSession === session));
    }

    let response = await send(token);
    // Long forms can outlast the access token, so refresh once instead of losing what was typed.
    if (response.status === 401 && (await this.authService.refreshToken())) {
      response = await send((await this.prefs.retrieveData<string>("token")) ?? token);
    }
    return response;
  }

  // Roble needs a token even to read, so guests get their own anonymous session (read-only role in Roble).
  // One shared promise so parallel loads don't each open a session.
  private guestAccessToken(renew = false): Promise<string> {
    if (renew || !this.guestSession) {
      this.guestSession = this.loadGuestToken(renew);
      // Don't cache a failure, so the next screen load retries.
      this.guestSession.catch(() => (this.guestSession = undefined));
    }
    return this.guestSession;
  }

  // Roble allows only 3 guest sign-ins per hour per IP, so the session is stored and refreshed, not recreated.
  // Kept apart from "token" so the app still treats the person as a guest.
  private async loadGuestToken(renew: boolean): Promise<string> {
    const saved = await this.prefs.retrieveData<string>("guestToken");
    if (saved && !renew) return saved;

    const refreshToken = await this.prefs.retrieveData<string>("guestRefreshToken");
    const refreshed = renew && refreshToken ? await this.postAuth("refresh-token", { refreshToken }).catch(() => null) : null;
    const session = refreshed ?? (await this.postAuth("signin-anonymous", {}));
    await this.prefs.storeData("guestToken", session.accessToken);
    if (session.refreshToken) await this.prefs.storeData("guestRefreshToken", session.refreshToken);
    return session.accessToken;
  }

  private async postAuth(path: string, body: object): Promise<{ accessToken: string; refreshToken?: string }> {
    const response = await fetch(`${this.authUrl}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.status === 429) {
      throw new Error("Hay muchos invitados nuevos desde esta red. Inténtalo en unos minutos o crea una cuenta.");
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.accessToken) {
      throw new Error(`No se pudieron cargar los proyectos de la comunidad: ${data.message ?? response.status}`);
    }
    return data;
  }

  private async ensureOk(response: Response, errorPrefix: string) {
    if (response.ok) return;
    const body = await response.json().catch(() => ({}));
    throw new Error(`${errorPrefix}: ${body.message ?? response.status}`);
  }
}
