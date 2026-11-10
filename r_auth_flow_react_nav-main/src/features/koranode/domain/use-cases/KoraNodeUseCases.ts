import { Meeting, MeetingChanges, NodeLink, SummaryContext } from "../entities/Meeting";
import { KoraNodeRepository } from "../repositories/KoraNodeRepository";

/** KORA NODE operations used by the presentation layer. */
export class KoraNodeUseCases {
  constructor(private readonly repository: KoraNodeRepository) {}

  /** "KORA-7F3B": derived from the project id, so every member sees the same code. */
  syncCode(proyectoId: string): string {
    let hash = 0;
    for (const char of proyectoId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return `KORA-${hash.toString(16).toUpperCase().padStart(4, "0").slice(-4)}`;
  }

  getLink(proyectoId: string): Promise<NodeLink | null> {
    return this.repository.getLink(proyectoId);
  }

  /** Waits for the device to confirm the code, then saves the link for the whole team. */
  async syncDevice(proyectoId: string, sincronizadoPorNombre: string): Promise<NodeLink> {
    const codigo = this.syncCode(proyectoId);
    await this.repository.waitForDevice(codigo);
    return this.repository.saveLink({ proyectoId, codigo, sincronizadoPorNombre });
  }

  listMeetings(proyectoId: string): Promise<Meeting[]> {
    return this.repository.listMeetings(proyectoId);
  }

  /** Asks the device for the AI summary of the meeting and saves it as the team's shared notes. */
  async finishMeeting(meeting: SummaryContext & { proyectoId: string; creadorNombre: string }): Promise<Meeting> {
    const { proyectoId, creadorNombre, ...context } = meeting;
    const summary = await this.repository.generateSummary(context);
    return this.repository.createMeeting({ ...summary, proyectoId, creadorNombre, inicio: context.inicio, fin: context.fin });
  }

  updateMeeting(id: string, changes: MeetingChanges): Promise<void> {
    return this.repository.updateMeeting(id, changes);
  }
}
