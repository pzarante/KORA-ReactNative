import { Meeting, MeetingChanges, MeetingDraft, NewMeeting, NodeLink, SummaryContext } from "../../domain/entities/Meeting";

export interface KoraNodeDataSource {
  /** null while the project has no KORA NODE. */
  getLink(proyectoId: string): Promise<NodeLink | null>;
  saveLink(link: Pick<NodeLink, "proyectoId" | "codigo" | "sincronizadoPorNombre">): Promise<NodeLink>;
  /** Newest first. */
  listMeetings(proyectoId: string): Promise<Meeting[]>;
  createMeeting(meeting: NewMeeting): Promise<Meeting>;
  updateMeeting(id: string, changes: MeetingChanges): Promise<void>;
  /** Resolves when the device confirms the dictated code. */
  waitForDevice(codigo: string): Promise<void>;
  /** The device's AI summary of the meeting it just recorded. */
  generateSummary(context: SummaryContext): Promise<MeetingDraft>;
}
