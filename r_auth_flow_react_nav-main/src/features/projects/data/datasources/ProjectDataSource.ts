import { AppNotification, NewNotification } from "../../domain/entities/Notification";
import { JoinRequest, NewProject, Project, ProjectChanges, ProjectComment, RequestStatus } from "../../domain/entities/Project";

export interface ProjectDataSource {
  createProject(project: NewProject, creadorNombre: string): Promise<Project>;
  /** Newest first, without archived (deleted) projects. */
  listProjects(): Promise<Project[]>;
  updateProject(id: string, changes: ProjectChanges): Promise<void>;
  /** "Eliminar proyecto": hides it everywhere but keeps the row. */
  archiveProject(id: string): Promise<void>;
  /** All comments when no project is given (used for the counters). */
  listComments(proyectoId?: string): Promise<ProjectComment[]>;
  addComment(comment: { proyectoId: string; texto: string; respuestaA: string | null; autorNombre: string }): Promise<ProjectComment>;
  listRequests(filter?: { proyectoId?: string; usuarioId?: string }): Promise<JoinRequest[]>;
  sendRequest(request: { proyectoId: string; rol: string; mensaje: string; usuarioNombre: string }): Promise<void>;
  setRequestStatus(id: string, estado: RequestStatus): Promise<void>;
  /** The current user's notifications, newest first; empty for guests. */
  listNotifications(): Promise<AppNotification[]>;
  /** Never throws: a lost notification must not undo the action that caused it. */
  notify(notification: NewNotification): Promise<void>;
  markNotificationsRead(ids: string[]): Promise<void>;
  /** Ids of the projects the current user saved (bookmark), newest first; empty for guests. */
  listSaved(): Promise<string[]>;
  /** Saves or un-saves a project for the current user. */
  setSaved(proyectoId: string, saved: boolean): Promise<void>;
  /** Adds someone to a project directly, as an accepted request (KORA TAG). */
  addMember(member: { proyectoId: string; usuarioId: string; usuarioNombre: string; rol: string }): Promise<void>;
  /** null without a session (guest). */
  currentUserId(): Promise<string | null>;
}
