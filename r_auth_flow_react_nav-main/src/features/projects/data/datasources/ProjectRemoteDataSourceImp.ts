import { RobleDatabase } from "@/src/core/roble/RobleDatabase";
import { AuthRemoteDataSource } from "@/src/features/auth/data/datasources/AuthRemoteDataSource";
import { AppNotification, NewNotification } from "../../domain/entities/Notification";
import { JoinRequest, NewProject, Project, ProjectChanges, ProjectComment, RequestStatus } from "../../domain/entities/Project";
import { ProjectDataSource } from "./ProjectDataSource";

const list = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);
// App field -> Roble column of the "proyecto" table.
const PROJECT_COLUMNS: Record<keyof ProjectChanges, string> = {
  icono: "icono",
  nombre: "nombre",
  descripcion: "descripcion",
  sobre: "sobre",
  etiquetas: "etiquetas",
  etapa: "etapa",
  problema: "problema",
  objetivo: "objetivo",
  alcance: "alcance",
  roles: "roles",
  enlaces: "enlaces",
  buscandoPersonas: "buscando_personas",
};

const newestFirst = <T extends { createdAt: string }>(rows: T[]) =>
  rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export class ProjectRemoteDataSourceImp implements ProjectDataSource {
  private readonly db: RobleDatabase;

  constructor(authService: AuthRemoteDataSource, projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    this.db = new RobleDatabase(authService, projectId);
  }

  currentUserId(): Promise<string | null> {
    return this.db.currentUserId();
  }

  async createProject(draft: NewProject, creadorNombre: string): Promise<Project> {
    const creadorId = await this.currentUserId();
    if (!creadorId) throw new Error("No hay una sesión activa para crear el proyecto");

    const project: Project = { ...draft, id: "", buscandoPersonas: true, creadorId, creadorNombre, createdAt: new Date().toISOString() };
    const inserted = await this.db.insert("proyecto", this.toRecord(project), "No se pudo crear el proyecto");
    return { ...project, id: inserted?._id ?? "" };
  }

  async listProjects(): Promise<Project[]> {
    const rows = await this.db.read("proyecto", {});
    return newestFirst(
      rows.filter((row) => !row.archivado).map((row) => ({
        id: row._id,
        icono: row.icono || "lightbulb-outline",
        nombre: row.nombre ?? "",
        descripcion: row.descripcion ?? "",
        sobre: row.sobre ?? "",
        etiquetas: list(row.etiquetas),
        etapa: row.etapa ?? "",
        problema: row.problema ?? "",
        objetivo: row.objetivo ?? "",
        alcance: row.alcance ?? "",
        roles: list(row.roles),
        enlaces: list(row.enlaces),
        // Rows from before the column existed are still looking for people.
        buscandoPersonas: row.buscando_personas !== false,
        creadorId: row.creador_id ?? "",
        creadorNombre: row.creador_nombre ?? "",
        createdAt: row.created_at ?? "",
      })),
    );
  }

  async updateProject(id: string, changes: ProjectChanges) {
    const updates = Object.fromEntries(
      Object.entries(changes).map(([field, value]) => [PROJECT_COLUMNS[field as keyof ProjectChanges], value]),
    );
    await this.db.update("proyecto", id, updates, "No se pudo guardar el proyecto");
  }

  async archiveProject(id: string) {
    await this.db.update("proyecto", id, { archivado: true }, "No se pudo eliminar el proyecto");
  }

  async listNotifications(): Promise<AppNotification[]> {
    const me = await this.currentUserId();
    if (!me) return [];
    const rows = await this.db.read("notificacion", { destinatario_id: me });
    return newestFirst(
      rows.map((row) => ({
        id: row._id,
        tipo: row.tipo,
        proyectoId: row.proyecto_id,
        actorNombre: row.actor_nombre ?? "",
        detalle: row.detalle ?? "",
        leida: !!row.leida,
        createdAt: row.created_at ?? "",
      })),
    );
  }

  async notify({ para, tipo, proyectoId, actorNombre, detalle }: NewNotification) {
    try {
      const me = await this.currentUserId();
      const recipients = [...new Set(para)].filter((id) => id && id !== me);
      if (recipients.length === 0) return;
      const createdAt = new Date().toISOString();
      await this.db.insert(
        "notificacion",
        recipients.map((id) => ({
          destinatario_id: id,
          tipo,
          proyecto_id: proyectoId,
          actor_nombre: actorNombre,
          detalle: detalle ?? null,
          leida: false,
          created_at: createdAt,
        })),
        "No se pudo crear la notificación",
      );
    } catch (err) {
      console.warn(err);
    }
  }

  async markNotificationsRead(ids: string[]) {
    // shortcut: Roble updates one row per call; fine for a personal inbox, batch it if inboxes get large.
    await Promise.all(ids.map((id) => this.db.update("notificacion", id, { leida: true }, "No se pudo marcar la notificación")));
  }

  async listComments(proyectoId?: string): Promise<ProjectComment[]> {
    const rows = await this.db.read("comentario", proyectoId ? { proyecto_id: proyectoId } : {});
    return rows
      .map((row) => ({
        id: row._id,
        proyectoId: row.proyecto_id,
        autorId: row.autor_id ?? null,
        autorNombre: row.autor_nombre ?? "",
        texto: row.texto ?? "",
        respuestaA: row.respuesta_a || null,
        createdAt: row.created_at ?? "",
      }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async addComment(comment: { proyectoId: string; texto: string; respuestaA: string | null; autorNombre: string }) {
    const autorId = await this.currentUserId();
    const createdAt = new Date().toISOString();
    const inserted = await this.db.insert(
      "comentario",
      {
        proyecto_id: comment.proyectoId,
        autor_id: autorId,
        autor_nombre: comment.autorNombre,
        texto: comment.texto,
        respuesta_a: comment.respuestaA,
        created_at: createdAt,
      },
      "No se pudo publicar el comentario",
    );
    return { ...comment, id: inserted?._id ?? createdAt, autorId, createdAt };
  }

  async listRequests(filter: { proyectoId?: string; usuarioId?: string } = {}): Promise<JoinRequest[]> {
    const query: Record<string, string> = {};
    if (filter.proyectoId) query.proyecto_id = filter.proyectoId;
    if (filter.usuarioId) query.usuario_id = filter.usuarioId;
    const rows = await this.db.read("solicitud", query);
    return newestFirst(
      rows.map((row) => ({
        id: row._id,
        proyectoId: row.proyecto_id,
        usuarioId: row.usuario_id,
        usuarioNombre: row.usuario_nombre ?? "",
        rol: row.rol ?? "",
        mensaje: row.mensaje ?? "",
        estado: row.estado ?? "pendiente",
        createdAt: row.created_at ?? "",
      })),
    );
  }

  async sendRequest(request: { proyectoId: string; rol: string; mensaje: string; usuarioNombre: string }) {
    const usuarioId = await this.currentUserId();
    if (!usuarioId) throw new Error("Necesitas una cuenta para unirte a un proyecto");
    await this.db.insert(
      "solicitud",
      {
        proyecto_id: request.proyectoId,
        usuario_id: usuarioId,
        usuario_nombre: request.usuarioNombre,
        rol: request.rol,
        mensaje: request.mensaje,
        estado: "pendiente",
        created_at: new Date().toISOString(),
      },
      "No se pudo enviar la solicitud",
    );
  }

  async setRequestStatus(id: string, estado: RequestStatus) {
    await this.db.update("solicitud", id, { estado }, "No se pudo actualizar la solicitud");
  }

  // Table "guardado" (docs/roble/perfil_y_guardados.sql). Un-saving flips `activo` instead of deleting,
  // because the app's role can update but not delete.
  async listSaved(): Promise<string[]> {
    const me = await this.db.currentUserId();
    if (!me) return [];
    const rows = await this.db.read("guardado", { usuario_id: me });
    return newestFirst(
      rows
        .filter((row) => row.usuario_id === me && row.activo !== false)
        .map((row) => ({ id: String(row.proyecto_id), createdAt: row.created_at ?? "" })),
    ).map((row) => row.id);
  }

  async setSaved(proyectoId: string, saved: boolean) {
    const me = await this.db.currentUserId();
    if (!me) throw new Error("Necesitas una cuenta para guardar proyectos");
    const [row] = (await this.db.read("guardado", { usuario_id: me, proyecto_id: proyectoId }))
      .filter((r) => r.usuario_id === me && r.proyecto_id === proyectoId);
    const createdAt = new Date().toISOString();
    if (row) {
      await this.db.update("guardado", row._id, { activo: saved, created_at: createdAt }, "No se pudo guardar el proyecto");
    } else if (saved) {
      await this.db.insert("guardado", { usuario_id: me, proyecto_id: proyectoId, activo: true, created_at: createdAt }, "No se pudo guardar el proyecto");
    }
  }

  async addMember({ proyectoId, usuarioId, usuarioNombre, rol }: { proyectoId: string; usuarioId: string; usuarioNombre: string; rol: string }) {
    // Membership is an accepted request, the same row "Aceptar" produces from a normal request.
    await this.db.insert(
      "solicitud",
      { proyecto_id: proyectoId, usuario_id: usuarioId, usuario_nombre: usuarioNombre, rol, mensaje: "Agregado con KORA TAG", estado: "aceptada", created_at: new Date().toISOString() },
      "No se pudo agregar a la persona al proyecto",
    );
  }

  private toRecord(project: Project) {
    return {
      nombre: project.nombre,
      icono: project.icono,
      descripcion: project.descripcion,
      sobre: project.sobre,
      etiquetas: project.etiquetas,
      etapa: project.etapa,
      problema: project.problema,
      objetivo: project.objetivo,
      alcance: project.alcance,
      roles: project.roles,
      enlaces: project.enlaces,
      creador_id: project.creadorId,
      creador_nombre: project.creadorNombre,
      created_at: project.createdAt,
    };
  }
}
