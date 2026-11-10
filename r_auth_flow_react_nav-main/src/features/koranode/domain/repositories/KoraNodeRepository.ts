import { Meeting, MeetingChanges, MeetingDraft, NewMeeting, NodeLink, SummaryContext } from "../entities/Meeting";

/**
 * Domain contract for KORA NODE: the device link, the shared meeting notes and the
 * device itself (sync confirmation and AI summary). Presentation uses KoraNodeUseCases.
 */
export interface KoraNodeRepository {
  getLink(proyectoId: string): Promise<NodeLink | null>;
  saveLink(link: Pick<NodeLink, "proyectoId" | "codigo" | "sincronizadoPorNombre">): Promise<NodeLink>;
  /** Newest first. */
  listMeetings(proyectoId: string): Promise<Meeting[]>;
  createMeeting(meeting: NewMeeting): Promise<Meeting>;
  updateMeeting(id: string, changes: MeetingChanges): Promise<void>;
  waitForDevice(codigo: string): Promise<void>;
  generateSummary(context: SummaryContext): Promise<MeetingDraft>;
}
