import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { userIdFromToken } from "@/src/core/userIdFromToken";
import { AuthRemoteDataSource } from "@/src/features/auth/data/datasources/AuthRemoteDataSource";
import { JoinRequest, NewProject, Project, ProjectComment, RequestStatus } from "../../domain/entities/Project";
import { ProjectDataSource } from "./ProjectDataSource";

const list = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);
const newestFirst = <T extends { createdAt: string }>(rows: T[]) =>
  rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export class ProjectRemoteDataSourceImp implements ProjectDataSource {
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

  async createProject(draft: NewProject, creadorNombre: string): Promise<Project> {
    const creadorId = await this.currentUserId();
    if (!creadorId) throw new Error("No hay una sesión activa para crear el proyecto");

    const project: Project = { ...draft, id: "", creadorId, creadorNombre, createdAt: new Date().toISOString() };
    const inserted = await this.insert("proyecto", this.toRecord(project), "No se pudo crear el proyecto");
    return { ...project, id: inserted?._id ?? "" };
  }

  async listProjects(): Promise<Project[]> {
    const rows = await this.read("proyecto", {});
    return newestFirst(
      rows.map((row) => ({
        id: row._id,
        icono: row.icono || "lightbulb-outline",
        nombre: row.nombre ?? "",
        descripcion: row.descripcion ?? "",
        etiquetas: list(row.etiquetas),
        etapa: row.etapa ?? "",
        problema: row.problema ?? "",
        objetivo: row.objetivo ?? "",
        alcance: row.alcance ?? "",
        roles: list(row.roles),
        enlaces: list(row.enlaces),
        creadorId: row.creador_id ?? "",
        creadorNombre: row.creador_nombre ?? "",
        createdAt: row.created_at ?? "",
      })),
    );
  }

  async listComments(proyectoId?: string): Promise<ProjectComment[]> {
    const rows = await this.read("comentario", proyectoId ? { proyecto_id: proyectoId } : {});
    return rows
      .map((row) => ({
        id: row._id,
        proyectoId: row.proyecto_id,
        autorId: row.autor_id ?? null,
        autorNombre: row.autor_nombre ?? "",
        texto: row.texto ?? "",
        respuestaA: row.respuesta_a || null,
        createdAt: row.created_at ?? "",
      }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async addComment(comment: { proyectoId: string; texto: string; respuestaA: string | null; autorNombre: string }) {
    const autorId = await this.currentUserId();
    const createdAt = new Date().toISOString();
    const inserted = await this.insert(
      "comentario",
      {
        proyecto_id: comment.proyectoId,
        autor_id: autorId,
        autor_nombre: comment.autorNombre,
        texto: comment.texto,
        respuesta_a: comment.respuestaA,
        created_at: createdAt,
      },
      "No se pudo publicar el comentario",
    );
    return { ...comment, id: inserted?._id ?? createdAt, autorId, createdAt };
  }

  async listRequests(filter: { proyectoId?: string; usuarioId?: string } = {}): Promise<JoinRequest[]> {
    const query: Record<string, string> = {};
    if (filter.proyectoId) query.proyecto_id = filter.proyectoId;
    if (filter.usuarioId) query.usuario_id = filter.usuarioId;
    const rows = await this.read("solicitud", query);
    return newestFirst(
      rows.map((row) => ({
        id: row._id,
        proyectoId: row.proyecto_id,
        usuarioId: row.usuario_id,
        usuarioNombre: row.usuario_nombre ?? "",
        rol: row.rol ?? "",
        mensaje: row.mensaje ?? "",
        estado: row.estado ?? "pendiente",
        createdAt: row.created_at ?? "",
      })),
    );
  }

  async sendRequest(request: { proyectoId: string; rol: string; mensaje: string; usuarioNombre: string }) {
    const usuarioId = await this.currentUserId();
    if (!usuarioId) throw new Error("Necesitas una cuenta para unirte a un proyecto");
    await this.insert(
      "solicitud",
      {
        proyecto_id: request.proyectoId,
        usuario_id: usuarioId,
        usuario_nombre: request.usuarioNombre,
        rol: request.rol,
        mensaje: request.mensaje,
        estado: "pendiente",
        created_at: new Date().toISOString(),
      },
      "No se pudo enviar la solicitud",
    );
  }

  async setRequestStatus(id: string, estado: RequestStatus) {
    const response = await this.authorized(`${this.baseUrl}/update`, {
      method: "PUT",
      body: JSON.stringify({ tableName: "solicitud", idColumn: "_id", idValue: id, updates: { estado } }),
    });
    await this.ensureOk(response, "No se pudo actualizar la solicitud");
  }

  private async read(table: string, filter: Record<string, string>): Promise<any[]> {
    const params = new URLSearchParams({ tableName: table, ...filter });
    const response = await this.authorized(`${this.baseUrl}/read?${params}`, { method: "GET" });
    // Roble answers 404 when no row matches the filter.
    if (response.status === 404) return [];
    await this.ensureOk(response, `No se pudo leer ${table}`);
    const rows = await response.json();
    return Array.isArray(rows) ? rows : [];
  }

  private async insert(table: string, record: object, errorPrefix: string): Promise<any> {
    const response = await this.authorized(`${this.baseUrl}/insert`, {
      method: "POST",
      body: JSON.stringify({ tableName: table, records: [record] }),
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

  private toRecord(project: Project) {
    return {
      nombre: project.nombre,
      icono: project.icono,
      descripcion: project.descripcion,
      etiquetas: project.etiquetas,
      etapa: project.etapa,
      problema: project.problema,
      objetivo: project.objetivo,
      alcance: project.alcance,
      roles: project.roles,
      enlaces: project.enlaces,
      creador_id: project.creadorId,
      creador_nombre: project.creadorNombre,
      created_at: project.createdAt,
    };
  }
}
