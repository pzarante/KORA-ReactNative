export type NextStep = { texto: string; hecho: boolean };

/** Meeting notes: the AI summary KORA NODE made of a meeting, shared by every member of the project. */
export type Meeting = {
  id: string;
  proyectoId: string;
  titulo: string;
  objetivo: string;
  acuerdos: string[];
  proximosPasos: NextStep[];
  inicio: string;
  fin: string;
  creadorId: string;
  creadorNombre: string;
  /** Empty until someone edits the summary. */
  editadoPorNombre: string;
  createdAt: string;
};

/** The part of the notes the AI writes and people can edit. */
export type MeetingDraft = Pick<Meeting, "titulo" | "objetivo" | "acuerdos" | "proximosPasos">;

export type NewMeeting = MeetingDraft & Pick<Meeting, "proyectoId" | "inicio" | "fin" | "creadorNombre">;

export type MeetingChanges = Partial<MeetingDraft> & { editadoPorNombre?: string };

/** A KORA NODE linked to a project; one per project, visible to the whole team. */
export type NodeLink = { proyectoId: string; codigo: string; sincronizadoPorNombre: string; createdAt: string };

/** What the device knows when it summarizes a meeting. */
export type SummaryContext = { proyectoNombre: string; etapa: string; integrantes: string[]; inicio: string; fin: string };
