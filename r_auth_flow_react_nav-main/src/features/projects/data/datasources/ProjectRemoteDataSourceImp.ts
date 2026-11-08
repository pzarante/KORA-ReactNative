import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { userIdFromToken } from "@/src/core/userIdFromToken";
import { AuthRemoteDataSource } from "@/src/features/auth/data/datasources/AuthRemoteDataSource";
import { NewProject, Project } from "../../domain/entities/Project";
import { ProjectDataSource } from "./ProjectDataSource";

export class ProjectRemoteDataSourceImp implements ProjectDataSource {
  private readonly baseUrl: string;
  private readonly prefs = LocalPreferencesAsyncStorage.getInstance();

  constructor(
    private authService: AuthRemoteDataSource,
    projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID,
  ) {
    if (!projectId) throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    const apiUrl = (process.env.EXPO_PUBLIC_ROBLE_API_URL ?? "https://roble-api.openlab.uninorte.edu.co").replace(/\/$/, "");
    this.baseUrl = `${apiUrl}/database/${projectId}`;
  }

  async createProject(draft: NewProject, creadorNombre: string): Promise<Project> {
    const token = await this.prefs.retrieveData<string>("token");
    if (!token) throw new Error("No hay una sesión activa para crear el proyecto");

    const project: Project = {
      ...draft,
      creadorId: userIdFromToken(token),
      creadorNombre,
      createdAt: new Date().toISOString(),
    };
    const insert = (accessToken: string) =>
      fetch(`${this.baseUrl}/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ tableName: "proyecto", records: [this.toRecord(project)] }),
      });

    let response = await insert(token);
    // The wizard can outlast the access token, so refresh once instead of losing the draft.
    if (response.status === 401 && (await this.authService.refreshToken())) {
      response = await insert((await this.prefs.retrieveData<string>("token")) ?? token);
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(`No se pudo crear el proyecto: ${body.message ?? response.status}`);
    }
    return project;
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
