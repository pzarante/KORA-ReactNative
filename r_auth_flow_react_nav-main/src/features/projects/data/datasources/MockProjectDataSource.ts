import { JoinRequest, NewProject, Project, ProjectComment, RequestStatus } from "../../domain/entities/Project";
import { ProjectDataSource } from "./ProjectDataSource";

const ME = "mock-user";

// In-memory data so EXPO_PUBLIC_AUTH_MODE=mock shows a populated feed.
export class MockProjectDataSource implements ProjectDataSource {
  private projects: Project[] = [
    {
      id: "p1",
      icono: "sprout",
      nombre: "EcoCampus",
      descripcion: "Una iniciativa para hacer de la universidad un espacio más sostenible.",
      sobre: "Desarrollar una estrategia participativa que promueva hábitos sostenibles en la comunidad universitaria a través de actividades, recursos y herramientas digitales.",
      etiquetas: ["Sostenibilidad", "Campus"],
      etapa: "Investigación",
      problema: "La falta de hábitos sostenibles en el campus genera un alto impacto ambiental.",
      objetivo: "Fomentar hábitos sostenibles en la comunidad universitaria.",
      alcance: "Campus principal durante el próximo semestre.",
      roles: ["Diseño UI/UX", "Análisis de datos"],
      enlaces: [],
      creadorId: "other-user",
      creadorNombre: "María López",
      createdAt: "2026-08-10T12:00:00.000Z",
    },
  ];
  private comments: ProjectComment[] = [];
  private requests: JoinRequest[] = [];

  async currentUserId() {
    return ME;
  }

  async createProject(project: NewProject, creadorNombre: string): Promise<Project> {
    const created = { ...project, id: `p${Date.now()}`, creadorId: ME, creadorNombre, createdAt: new Date().toISOString() };
    this.projects.unshift(created);
    return created;
  }

  async listProjects() {
    return [...this.projects];
  }

  async listComments(proyectoId?: string) {
    return this.comments.filter((c) => !proyectoId || c.proyectoId === proyectoId);
  }

  async addComment(comment: { proyectoId: string; texto: string; respuestaA: string | null; autorNombre: string }) {
    const created = { ...comment, id: `c${this.comments.length + 1}`, autorId: ME, createdAt: new Date().toISOString() };
    this.comments.push(created);
    return created;
  }

  async listRequests(filter: { proyectoId?: string; usuarioId?: string } = {}) {
    return this.requests.filter(
      (r) => (!filter.proyectoId || r.proyectoId === filter.proyectoId) && (!filter.usuarioId || r.usuarioId === filter.usuarioId),
    );
  }

  async sendRequest(request: { proyectoId: string; rol: string; mensaje: string; usuarioNombre: string }) {
    this.requests.unshift({ ...request, id: `r${this.requests.length + 1}`, usuarioId: ME, estado: "pendiente", createdAt: new Date().toISOString() });
  }

  async setRequestStatus(id: string, estado: RequestStatus) {
    this.requests = this.requests.map((r) => (r.id === id ? { ...r, estado } : r));
  }
}
