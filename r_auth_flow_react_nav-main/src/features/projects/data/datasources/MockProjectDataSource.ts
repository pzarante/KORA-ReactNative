import { NewProject, Project } from "../../domain/entities/Project";
import { ProjectDataSource } from "./ProjectDataSource";

export class MockProjectDataSource implements ProjectDataSource {
  async createProject(project: NewProject, creadorNombre: string): Promise<Project> {
    return { ...project, creadorId: "mock-user", creadorNombre, createdAt: new Date().toISOString() };
  }
}
