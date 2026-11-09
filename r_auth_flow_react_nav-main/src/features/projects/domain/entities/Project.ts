export const PROJECT_STAGES = ["Idea", "Formación de equipo", "Investigación", "Prototipo", "Pruebas"];

export type NewProject = {
  icono: string;
  nombre: string;
  descripcion: string;
  etiquetas: string[];
  etapa: string;
  problema: string;
  objetivo: string;
  alcance: string;
  roles: string[];
  enlaces: string[];
};

export type Project = NewProject & {
  id: string;
  creadorId: string;
  creadorNombre: string;
  createdAt: string;
};

export type ProjectComment = {
  id: string;
  proyectoId: string;
  autorId: string | null;
  autorNombre: string;
  texto: string;
  respuestaA: string | null;
  createdAt: string;
};

export type RequestStatus = "pendiente" | "aceptada" | "rechazada";

export type JoinRequest = {
  id: string;
  proyectoId: string;
  usuarioId: string;
  usuarioNombre: string;
  rol: string;
  mensaje: string;
  estado: RequestStatus;
  createdAt: string;
};
