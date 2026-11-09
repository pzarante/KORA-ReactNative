import { JoinRequest, NewProject, Project, ProjectComment, RequestStatus } from "../../domain/entities/Project";
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

  currentUserId(): Promise<string | null> {
    return this.dataSource.currentUserId();
  }
}
