import { AppNotification, NewNotification } from "../../domain/entities/Notification";
import { JoinRequest, NewProject, Project, ProjectChanges, ProjectComment, RequestStatus } from "../../domain/entities/Project";
import { ProjectDataSource } from "./ProjectDataSource";

const ME = "mock-user";

const MINE = {
  sobre: "",
  etiquetas: ["Sostenibilidad"],
  problema: "",
  objetivo: "",
  alcance: "",
  roles: [],
  enlaces: [],
  buscandoPersonas: true,
  creadorId: ME,
  creadorNombre: "Ana Torres",
};

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
      buscandoPersonas: true,
      creadorId: "other-user",
      creadorNombre: "María López",
      createdAt: "2026-08-10T12:00:00.000Z",
    },
    // Projects of the mock user: p2 already has a KORA NODE with meetings, p3 does not (see MockKoraNodeDataSource).
    {
      ...MINE,
      id: "p2",
      icono: "leaf",
      nombre: "Campus Sostenible",
      descripcion: "Acciones concretas para reducir residuos en el campus.",
      etapa: "Prototipo",
      createdAt: "2026-09-01T12:00:00.000Z",
    },
    {
      ...MINE,
      id: "p3",
      icono: "rocket-launch-outline",
      nombre: "Ecosistema KORA",
      descripcion: "La plataforma para conectar proyectos y talento en la universidad.",
      etapa: "Idea",
      createdAt: "2026-10-01T12:00:00.000Z",
    },
  ];
  private comments: ProjectComment[] = [];
  private requests: JoinRequest[] = [
    { id: "r-p2", proyectoId: "p2", usuarioId: "luis", usuarioNombre: "Luis Rojas", rol: "Diseño UI/UX", mensaje: "", estado: "aceptada", createdAt: "2026-09-02T12:00:00.000Z" },
  ];
  private notifications: (AppNotification & { para: string })[] = [];

  async currentUserId() {
    return ME;
  }

  async createProject(project: NewProject, creadorNombre: string): Promise<Project> {
    const created = { ...project, id: `p${Date.now()}`, buscandoPersonas: true, creadorId: ME, creadorNombre, createdAt: new Date().toISOString() };
    this.projects.unshift(created);
    return created;
  }

  async listProjects() {
    return [...this.projects];
  }

  async updateProject(id: string, changes: ProjectChanges) {
    this.projects = this.projects.map((p) => (p.id === id ? { ...p, ...changes } : p));
  }

  async archiveProject(id: string) {
    this.projects = this.projects.filter((p) => p.id !== id);
  }

  async listNotifications() {
    return this.notifications.filter((n) => n.para === ME);
  }

  async notify({ para, detalle = "", ...rest }: NewNotification) {
    const createdAt = new Date().toISOString();
    for (const id of new Set(para)) {
      if (id && id !== ME) this.notifications.unshift({ ...rest, detalle, para: id, id: `n${this.notifications.length + 1}`, leida: false, createdAt });
    }
  }

  async markNotificationsRead(ids: string[]) {
    this.notifications = this.notifications.map((n) => (ids.includes(n.id) ? { ...n, leida: true } : n));
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

  private saved: string[] = [];

  async listSaved() {
    return [...this.saved];
  }

  async setSaved(proyectoId: string, saved: boolean) {
    this.saved = saved ? [proyectoId, ...this.saved.filter((id) => id !== proyectoId)] : this.saved.filter((id) => id !== proyectoId);
  }

  async addMember({ proyectoId, usuarioId, usuarioNombre, rol }: { proyectoId: string; usuarioId: string; usuarioNombre: string; rol: string }) {
    this.requests.unshift({ id: `r${Date.now()}`, proyectoId, usuarioId, usuarioNombre, rol, mensaje: "Agregado con KORA TAG", estado: "aceptada", createdAt: new Date().toISOString() });
  }
}
