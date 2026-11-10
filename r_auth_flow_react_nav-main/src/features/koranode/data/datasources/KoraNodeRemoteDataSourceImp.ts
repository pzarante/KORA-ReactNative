import { RobleDatabase } from "@/src/core/roble/RobleDatabase";
import { AuthRemoteDataSource } from "@/src/features/auth/data/datasources/AuthRemoteDataSource";
import { Meeting, MeetingChanges, NewMeeting, NextStep, NodeLink, SummaryContext } from "../../domain/entities/Meeting";
import { KoraNodeDataSource } from "./KoraNodeDataSource";
import { SIMULATED_DELAY_MS, simulatedSummary, wait } from "./simulatedDevice";

// App field -> Roble column of the "reunion" table.
const MEETING_COLUMNS: Record<keyof MeetingChanges, string> = {
  titulo: "titulo",
  objetivo: "objetivo",
  acuerdos: "acuerdos",
  proximosPasos: "proximos_pasos",
  editadoPorNombre: "editado_por_nombre",
};

const list = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);
const steps = (value: unknown): NextStep[] =>
  Array.isArray(value) ? value.map((step) => ({ texto: String(step?.texto ?? ""), hecho: !!step?.hecho })) : [];

const toMeeting = (row: any): Meeting => ({
  id: row._id,
  proyectoId: row.proyecto_id,
  titulo: row.titulo ?? "",
  objetivo: row.objetivo ?? "",
  acuerdos: list(row.acuerdos),
  proximosPasos: steps(row.proximos_pasos),
  inicio: row.inicio ?? "",
  fin: row.fin ?? "",
  creadorId: row.creador_id ?? "",
  creadorNombre: row.creador_nombre ?? "",
  editadoPorNombre: row.editado_por_nombre ?? "",
  createdAt: row.created_at ?? "",
});

export class KoraNodeRemoteDataSourceImp implements KoraNodeDataSource {
  private readonly db: RobleDatabase;

  constructor(authService: AuthRemoteDataSource, projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    this.db = new RobleDatabase(authService, projectId);
  }

  async getLink(proyectoId: string): Promise<NodeLink | null> {
    const [row] = await this.db.read("kora_node", { proyecto_id: proyectoId });
    return row
      ? { proyectoId: row.proyecto_id, codigo: row.codigo, sincronizadoPorNombre: row.sincronizado_por_nombre ?? "", createdAt: row.created_at ?? "" }
      : null;
  }

  async saveLink({ proyectoId, codigo, sincronizadoPorNombre }: Pick<NodeLink, "proyectoId" | "codigo" | "sincronizadoPorNombre">) {
    const createdAt = new Date().toISOString();
    try {
      await this.db.insert(
        "kora_node",
        { proyecto_id: proyectoId, codigo, sincronizado_por: await this.db.currentUserId(), sincronizado_por_nombre: sincronizadoPorNombre, created_at: createdAt },
        "No se pudo vincular el KORA NODE",
      );
    } catch (err) {
      // proyecto_id is UNIQUE: if a teammate linked it a moment ago, use their link.
      const existing = await this.getLink(proyectoId);
      if (existing) return existing;
      throw err;
    }
    return { proyectoId, codigo, sincronizadoPorNombre, createdAt };
  }

  async listMeetings(proyectoId: string): Promise<Meeting[]> {
    const rows = await this.db.read("reunion", { proyecto_id: proyectoId });
    return rows.map(toMeeting).sort((a, b) => b.inicio.localeCompare(a.inicio));
  }

  async createMeeting(meeting: NewMeeting): Promise<Meeting> {
    const creadorId = (await this.db.currentUserId()) ?? "";
    const createdAt = new Date().toISOString();
    const inserted = await this.db.insert(
      "reunion",
      {
        proyecto_id: meeting.proyectoId,
        titulo: meeting.titulo,
        objetivo: meeting.objetivo,
        acuerdos: meeting.acuerdos,
        proximos_pasos: meeting.proximosPasos,
        inicio: meeting.inicio,
        fin: meeting.fin,
        creador_id: creadorId,
        creador_nombre: meeting.creadorNombre,
        created_at: createdAt,
        updated_at: createdAt,
      },
      "No se pudo guardar el resumen de la reunión",
    );
    return { ...meeting, id: inserted?._id ?? "", creadorId, editadoPorNombre: "", createdAt };
  }

  async updateMeeting(id: string, changes: MeetingChanges) {
    const updates = Object.fromEntries(
      Object.entries(changes).map(([field, value]) => [MEETING_COLUMNS[field as keyof MeetingChanges], value]),
    );
    await this.db.update("reunion", id, { ...updates, updated_at: new Date().toISOString() }, "No se pudo guardar la reunión");
  }

  waitForDevice(): Promise<void> {
    return wait(SIMULATED_DELAY_MS.sync);
  }

  async generateSummary(context: SummaryContext) {
    await wait(SIMULATED_DELAY_MS.summary);
    return simulatedSummary(context);
  }
}
