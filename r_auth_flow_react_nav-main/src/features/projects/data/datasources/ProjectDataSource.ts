import { JoinRequest, NewProject, Project, ProjectComment, RequestStatus } from "../../domain/entities/Project";

export interface ProjectDataSource {
  createProject(project: NewProject, creadorNombre: string): Promise<Project>;
  /** Newest first. */
  listProjects(): Promise<Project[]>;
  /** All comments when no project is given (used for the counters). */
  listComments(proyectoId?: string): Promise<ProjectComment[]>;
  addComment(comment: { proyectoId: string; texto: string; respuestaA: string | null; autorNombre: string }): Promise<ProjectComment>;
  listRequests(filter?: { proyectoId?: string; usuarioId?: string }): Promise<JoinRequest[]>;
  sendRequest(request: { proyectoId: string; rol: string; mensaje: string; usuarioNombre: string }): Promise<void>;
  setRequestStatus(id: string, estado: RequestStatus): Promise<void>;
  /** null without a session (guest). */
  currentUserId(): Promise<string | null>;
}
