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
  creadorId: string;
  creadorNombre: string;
  createdAt: string;
};
