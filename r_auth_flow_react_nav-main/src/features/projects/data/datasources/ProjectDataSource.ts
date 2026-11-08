import { NewProject, Project } from "../../domain/entities/Project";

export interface ProjectDataSource {
  createProject(project: NewProject, creadorNombre: string): Promise<Project>;
}
