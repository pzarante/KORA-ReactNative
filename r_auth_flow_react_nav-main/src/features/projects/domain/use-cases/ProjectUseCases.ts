import { JoinRequest, NewProject, Project, ProjectComment, RequestStatus } from "../entities/Project";
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

  currentUserId(): Promise<string | null> {
    return this.repository.currentUserId();
  }
}
