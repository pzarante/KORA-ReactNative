import { AppNotification, NewNotification } from "../../domain/entities/Notification";
import { JoinRequest, NewProject, Project, ProjectChanges, ProjectComment, RequestStatus } from "../../domain/entities/Project";
import { ProjectRepository } from "../../domain/repositories/ProjectRepository";
import { ProjectDataSource } from "../datasources/ProjectDataSource";

/** Adapts the remote/mock data source to the domain repository contract. */
export class ProjectRepositoryImpl implements ProjectRepository {
  constructor(private readonly dataSource: ProjectDataSource) {}

  createProject(project: NewProject, creadorNombre: string): Promise<Project> {
    return this.dataSource.createProject(project, creadorNombre);
  }

  listProjects(): Promise<Project[]> {
    return this.dataSource.listProjects();
  }

  updateProject(id: string, changes: ProjectChanges): Promise<void> {
    return this.dataSource.updateProject(id, changes);
  }

  archiveProject(id: string): Promise<void> {
    return this.dataSource.archiveProject(id);
  }

  listComments(proyectoId?: string): Promise<ProjectComment[]> {
    return this.dataSource.listComments(proyectoId);
  }

  addComment(comment: { proyectoId: string; texto: string; respuestaA: string | null; autorNombre: string }): Promise<ProjectComment> {
    return this.dataSource.addComment(comment);
  }

  listRequests(filter?: { proyectoId?: string; usuarioId?: string }): Promise<JoinRequest[]> {
    return this.dataSource.listRequests(filter);
  }

  sendRequest(request: { proyectoId: string; rol: string; mensaje: string; usuarioNombre: string }): Promise<void> {
    return this.dataSource.sendRequest(request);
  }

  setRequestStatus(id: string, estado: RequestStatus): Promise<void> {
    return this.dataSource.setRequestStatus(id, estado);
  }

  listNotifications(): Promise<AppNotification[]> {
    return this.dataSource.listNotifications();
  }

  notify(notification: NewNotification): Promise<void> {
    return this.dataSource.notify(notification);
  }

  markNotificationsRead(ids: string[]): Promise<void> {
    return this.dataSource.markNotificationsRead(ids);
  }

  currentUserId(): Promise<string | null> {
    return this.dataSource.currentUserId();
  }

  listSaved(): Promise<string[]> {
    return this.dataSource.listSaved();
  }

  setSaved(proyectoId: string, saved: boolean): Promise<void> {
    return this.dataSource.setSaved(proyectoId, saved);
  }

  addMember(member: { proyectoId: string; usuarioId: string; usuarioNombre: string; rol: string }): Promise<void> {
    return this.dataSource.addMember(member);
  }
}
