import { Meeting, MeetingChanges, NewMeeting, NodeLink, SummaryContext } from "../../domain/entities/Meeting";
import { KoraNodeDataSource } from "./KoraNodeDataSource";
import { SIMULATED_DELAY_MS, simulatedSummary, wait } from "./simulatedDevice";

const ME = "mock-user";

const seed = (id: string, titulo: string, inicio: string, fin: string, objetivo: string, acuerdos: string[]): Meeting => ({
  id,
  proyectoId: "p2",
  titulo,
  objetivo,
  acuerdos,
  proximosPasos: [
    { texto: "Actualizar el cronograma (Responsable: Ana).", hecho: true },
    { texto: "Desarrollar propuestas visuales (Responsable: Luis).", hecho: false },
  ],
  inicio,
  fin,
  creadorId: ME,
  creadorNombre: "Ana Torres",
  editadoPorNombre: "",
  createdAt: fin,
});

// In-memory data so EXPO_PUBLIC_AUTH_MODE=mock shows a linked project (p2) with history
// and one still to link (p3); see MockProjectDataSource.
export class MockKoraNodeDataSource implements KoraNodeDataSource {
  private links: NodeLink[] = [{ proyectoId: "p2", codigo: "KORA-7F3B", sincronizadoPorNombre: "Ana Torres", createdAt: "2026-10-30T15:00:00.000Z" }];
  private meetings: Meeting[] = [
    seed("m1", "Proyecto final – Proto .Zero", "2026-11-06T20:00:00.000Z", "2026-11-06T20:47:00.000Z", "Ajustes de narrativa, distribución de tareas y próximos pasos.", ["Ajustar el cronograma de entregas.", "Dividir tareas por equipo.", "Revisar referencias visuales."]),
    seed("m2", "Diseño de la identidad NIKIS", "2026-11-04T21:15:00.000Z", "2026-11-04T22:02:00.000Z", "Revisión de propuestas, paleta de color y aplicaciones.", ["Elegir la paleta final.", "Probar el logo en tamaños pequeños."]),
    seed("m3", "Color + Territorio", "2026-11-02T19:00:00.000Z", "2026-11-02T19:46:00.000Z", "Hallazgos de investigación, análisis de referentes y próximos entregables.", ["Compartir el análisis de referentes.", "Definir los entregables de la semana."]),
    seed("m4", "Ecosistema KORA", "2026-10-30T20:30:00.000Z", "2026-10-30T21:20:00.000Z", "Definición de funcionalidades, perfiles de usuario y flujo general.", ["Priorizar el flujo de creación de proyectos.", "Documentar los perfiles de usuario."]),
  ];

  async getLink(proyectoId: string) {
    return this.links.find((link) => link.proyectoId === proyectoId) ?? null;
  }

  async saveLink(link: Pick<NodeLink, "proyectoId" | "codigo" | "sincronizadoPorNombre">) {
    const saved = { ...link, createdAt: new Date().toISOString() };
    this.links.push(saved);
    return saved;
  }

  async listMeetings(proyectoId: string) {
    return this.meetings.filter((m) => m.proyectoId === proyectoId).sort((a, b) => b.inicio.localeCompare(a.inicio));
  }

  async createMeeting(meeting: NewMeeting) {
    const created: Meeting = { ...meeting, id: `m${Date.now()}`, creadorId: ME, editadoPorNombre: "", createdAt: new Date().toISOString() };
    this.meetings.push(created);
    return created;
  }

  async updateMeeting(id: string, changes: MeetingChanges) {
    this.meetings = this.meetings.map((m) => (m.id === id ? { ...m, ...changes } : m));
  }

  waitForDevice() {
    return wait(SIMULATED_DELAY_MS.sync);
  }

  async generateSummary(context: SummaryContext) {
    await wait(SIMULATED_DELAY_MS.summary);
    return simulatedSummary(context);
  }
}
