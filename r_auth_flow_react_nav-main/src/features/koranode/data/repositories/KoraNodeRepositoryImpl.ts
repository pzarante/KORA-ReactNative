import { Meeting, MeetingChanges, MeetingDraft, NewMeeting, NodeLink, SummaryContext } from "../../domain/entities/Meeting";
import { KoraNodeRepository } from "../../domain/repositories/KoraNodeRepository";
import { KoraNodeDataSource } from "../datasources/KoraNodeDataSource";

/** Adapts the remote/mock data source to the domain repository contract. */
export class KoraNodeRepositoryImpl implements KoraNodeRepository {
  constructor(private readonly dataSource: KoraNodeDataSource) {}

  getLink(proyectoId: string): Promise<NodeLink | null> {
    return this.dataSource.getLink(proyectoId);
  }

  saveLink(link: Pick<NodeLink, "proyectoId" | "codigo" | "sincronizadoPorNombre">): Promise<NodeLink> {
    return this.dataSource.saveLink(link);
  }

  listMeetings(proyectoId: string): Promise<Meeting[]> {
    return this.dataSource.listMeetings(proyectoId);
  }

  createMeeting(meeting: NewMeeting): Promise<Meeting> {
    return this.dataSource.createMeeting(meeting);
  }

  updateMeeting(id: string, changes: MeetingChanges): Promise<void> {
    return this.dataSource.updateMeeting(id, changes);
  }

  waitForDevice(codigo: string): Promise<void> {
    return this.dataSource.waitForDevice(codigo);
  }

  generateSummary(context: SummaryContext): Promise<MeetingDraft> {
    return this.dataSource.generateSummary(context);
  }
}
