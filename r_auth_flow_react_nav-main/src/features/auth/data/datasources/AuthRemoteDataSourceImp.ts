import { ILocalPreferences } from "@/src/shared/storage/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/shared/storage/LocalPreferencesAsyncStorage";
import { userIdFromToken } from "@/src/core/userIdFromToken";
import { ResilientHttpClient } from "@/src/core/roble/ResilientHttpClient";
import { friendlyStatusMessage } from "@/src/core/roble/friendlyError";
import { AuthUser } from "../../domain/entities/AuthUser";
import { AuthRemoteDataSource } from "./AuthRemoteDataSource";

export class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;

  private prefs: ILocalPreferences;
  private refreshInFlight?: Promise<boolean>;

  constructor(
    projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID,
    // "signup-direct": practice accounts, no e-mail. "signup": real e-mails, Roble sends a verification code.
    private readonly signupEndpoint = process.env.EXPO_PUBLIC_ROBLE_SIGNUP_ENDPOINT ?? "signup-direct",
  ) {
    if (!projectId || projectId === "TU_PROJECT_ID_REAL") {
      throw new Error("Configura el Project ID real de Roble en el archivo .env");
    }
    this.projectId = projectId;
    const apiUrl = (process.env.EXPO_PUBLIC_ROBLE_API_URL ?? "https://roble-api.test-openlab.uninorte.edu.co").replace(/\/$/, "");
    this.baseUrl = `${apiUrl}/auth/${this.projectId}`;
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await ResilientHttpClient.request(`${this.baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data["accessToken"];
        const refreshToken = data["refreshToken"];
        if (!token || !refreshToken) {
          throw new Error("Roble no devolvió los tokens de sesión");
        }
        await this.prefs.storeData("token", token);
        await this.prefs.storeData("refreshToken", refreshToken);
        await this.prefs.storeData<AuthUser>("sessionUser", { email });
        //console.log("Token:", token, "\nRefresh Token:", refreshToken);
        return Promise.resolve();
      } else {
        const body = await response.json().catch(() => ({}));
        console.warn(`Login failed (${response.status})`, body);
        // Roble answers the same for a wrong password and an unknown e-mail.
        if (response.status === 400 || response.status === 401) throw new Error("Correo o contraseña incorrectos.");
        if (response.status === 429) throw new Error("Demasiados intentos. Espera un momento e inténtalo nuevamente.");
        throw new Error(friendlyStatusMessage(response.status));
      }
    } catch (e: any) {
      //console.error("Login failed", e);
      throw e;
    }
  }

  async signUp(email: string, password: string): Promise<boolean> {
    try {
      const response = await ResilientHttpClient.request(`${this.baseUrl}/${this.signupEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          email: email,
          name: email.split("@")[0],
          password: password,
        }),
      });

      if (response.status === 201) {
        // With "signup" the account stays inactive until verify-email, so logging in now would fail.
        if (this.signupEndpoint === "signup") return true;
        await this.login(email, password);
        return false;
      } else {
        const body = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error("Demasiados intentos. Espera un momento e inténtalo nuevamente.");
        }
        throw new Error(this.userFacingMessage(response.status, body, "No fue posible crear la cuenta."));
      }
    } catch (e: any) {
      console.error("Signup failed", e);
      throw e;
    }
  }

  /**
   * Roble's 4xx texts on signup / resend (e.g. e-mail already registered, password rules) are in Spanish
   * and tell the person what to fix, so they're kept; 5xx bodies are server internals and are not.
   */
  private userFacingMessage(status: number, body: any, fallback: string): string {
    console.warn(`Roble auth error (${status})`, body);
    if (status >= 500 || status === 0) return friendlyStatusMessage(status);
    const message = Array.isArray(body?.message) ? body.message.join(" ") : body?.message;
    return typeof message === "string" && message.trim() ? message : fallback;
  }

  async logOut(): Promise<void> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      // Best effort: a failed server call must never keep the user signed in locally.
      if (token) await ResilientHttpClient.request(`${this.baseUrl}/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    } catch {
      // ignored on purpose
    } finally {
      await this.prefs.removeData("token");
      await this.prefs.removeData("refreshToken");
      await this.prefs.removeData("sessionUser");
    }
  }
  async resendCode(email: string): Promise<void> {
    const response = await ResilientHttpClient.request(`${this.baseUrl}/resend-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(this.userFacingMessage(response.status, body, "No pudimos reenviar el código. Intenta de nuevo."));
    }
  }

  async validate(email: string, validationCode: string): Promise<void> {
    try {
      const response = await ResilientHttpClient.request(`${this.baseUrl}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email, code: validationCode }),
      });

      if (response.status === 201) {
        return Promise.resolve();
      } else {
        const body = await response.json().catch(() => ({}));
        console.warn(`Email verification failed (${response.status})`, body);
        if (response.status >= 400 && response.status < 500) throw new Error("El código no es válido o ya expiró.");
        throw new Error(friendlyStatusMessage(response.status));
      }
    } catch (e: any) {
      console.error("Validation failed", e);
      throw e;
    }
  }

  async refreshToken(): Promise<boolean> {
    if (this.refreshInFlight) return this.refreshInFlight;
    this.refreshInFlight = this.performTokenRefresh();
    try {
      return await this.refreshInFlight;
    } finally {
      this.refreshInFlight = undefined;
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = await this.prefs.retrieveData<string>("refreshToken");
      if (!refreshToken) {
        console.warn("Refresh token failed", "No refresh token found");
        return false;
      }
      const response = await ResilientHttpClient.request(`${this.baseUrl}/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data["accessToken"];
        if (!newToken) throw new Error("Roble no devolvió un access token renovado");
        await this.prefs.storeData("token", newToken);
        if (data["refreshToken"]) await this.prefs.storeData("refreshToken", data["refreshToken"]);
        console.log("Token refreshed successfully");
        return true;
      }
      const body = await response.json().catch(() => ({}));
      console.warn(`Refresh token failed (${response.status})`, body);
      // Any 4xx here means the refresh token is no longer valid.
      throw new Error(friendlyStatusMessage(response.status < 500 ? 401 : response.status));
    } catch (e: any) {
      console.error("Refresh token failed", e);
      throw e;
    }
  }
  async forgotPassword(email: string): Promise<void> {
    let response: Response;
    try {
      response = await ResilientHttpClient.request(`${this.baseUrl}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email }),
      });
    } catch {
      throw new Error(
        "No pudimos conectar con el servicio. Revisa tu conexión e inténtalo de nuevo.",
      );
    }

    if (response.status === 429) {
      throw new Error(
        "Demasiados intentos. Espera un momento e inténtalo nuevamente.",
      );
    }
    if (!response.ok) {
      throw new Error(
        "No pudimos enviar el enlace. Intenta de nuevo más tarde.",
      );
    }
  }
  resetPassword(
    email: string,
    newPassword: string,
    validationCode: string,
  ): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  async verifyToken(): Promise<boolean> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      if (!token) return false;

      const response = await ResilientHttpClient.request(`${this.baseUrl}/verify-token`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        console.log("Token is valid");
        return true;
      } else {
        const body = await response.json();
        console.error(`Token verification error: ${body.message}`);
        return false;
      }
    } catch (e: any) {
      console.error("Verify token failed", e);
      return false;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const token = await this.prefs.retrieveData<string>("token");
    if (!token) return null;
    const savedUser = await this.prefs.retrieveData<AuthUser>("sessionUser");
    if (savedUser?.email) return savedUser;
    try {
      return { email: "", userId: userIdFromToken(token) };
    } catch {
      return { email: "" };
    }
  }
}
