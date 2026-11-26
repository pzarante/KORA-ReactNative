import { AppNotification, NewNotification } from "../entities/Notification";
import { JoinRequest, NewProject, Project, ProjectChanges, ProjectComment, RequestStatus } from "../entities/Project";
import { ProjectRepository } from "../repositories/ProjectRepository";

/**
 * Application-level operations for projects. Presentation resolves this class
 * from the DI container instead of talking to a data source.
 */
export class ProjectUseCases {
  constructor(private readonly repository: ProjectRepository) {}

  createProject(project: NewProject, creadorNombre: string): Promise<Project> {
    return this.repository.createProject(project, creadorNombre);
  }

  listProjects(): Promise<Project[]> {
    return this.repository.listProjects();
  }

  updateProject(id: string, changes: ProjectChanges): Promise<void> {
    return this.repository.updateProject(id, changes);
  }

  archiveProject(id: string): Promise<void> {
    return this.repository.archiveProject(id);
  }

  listComments(proyectoId?: string): Promise<ProjectComment[]> {
    return this.repository.listComments(proyectoId);
  }

  addComment(comment: { proyectoId: string; texto: string; respuestaA: string | null; autorNombre: string }): Promise<ProjectComment> {
    return this.repository.addComment(comment);
  }

  listRequests(filter?: { proyectoId?: string; usuarioId?: string }): Promise<JoinRequest[]> {
    return this.repository.listRequests(filter);
  }

  sendRequest(request: { proyectoId: string; rol: string; mensaje: string; usuarioNombre: string }): Promise<void> {
    return this.repository.sendRequest(request);
  }

  setRequestStatus(id: string, estado: RequestStatus): Promise<void> {
    return this.repository.setRequestStatus(id, estado);
  }

  listNotifications(): Promise<AppNotification[]> {
    return this.repository.listNotifications();
  }

  notify(notification: NewNotification): Promise<void> {
    return this.repository.notify(notification);
  }

  markNotificationsRead(ids: string[]): Promise<void> {
    return this.repository.markNotificationsRead(ids);
  }

  currentUserId(): Promise<string | null> {
    return this.repository.currentUserId();
  }

  listSaved(): Promise<string[]> {
    return this.repository.listSaved();
  }

  setSaved(proyectoId: string, saved: boolean): Promise<void> {
    return this.repository.setSaved(proyectoId, saved);
  }

  addMember(member: { proyectoId: string; usuarioId: string; usuarioNombre: string; rol: string }): Promise<void> {
    return this.repository.addMember(member);
  }

  /** The current user leaves `project`; `team` is the project's requests (as listRequests returns them). */
  async leaveProject(project: Project, team: JoinRequest[]): Promise<void> {
    const me = await this.repository.currentUserId();
    const mine = team.find((r) => r.usuarioId === me && r.estado === "aceptada");
    if (!mine) throw new Error("No formas parte de este proyecto");
    await this.repository.setRequestStatus(mine.id, "retirada");
    const others = team.filter((r) => r.estado === "aceptada" && r.id !== mine.id).map((r) => r.usuarioId);
    await this.repository.notify({ para: [project.creadorId, ...others], tipo: "salida", proyectoId: project.id, actorNombre: mine.usuarioNombre });
  }

  /** The creator removes `member` (an accepted request) from `project`. */
  async removeMember(project: Project, member: JoinRequest, team: JoinRequest[]): Promise<void> {
    await this.repository.setRequestStatus(member.id, "expulsada");
    await this.repository.notify({ para: [member.usuarioId], tipo: "expulsion", proyectoId: project.id, actorNombre: project.creadorNombre });
    const others = team.filter((r) => r.estado === "aceptada" && r.id !== member.id).map((r) => r.usuarioId);
    await this.repository.notify({ para: others, tipo: "salida", proyectoId: project.id, actorNombre: member.usuarioNombre });
  }
}
