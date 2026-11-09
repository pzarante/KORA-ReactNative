export type UserProfile = {
  userId: string;
  nombreCompleto: string;
  rol: string;
  habilidades: string[];
  infoAdicional: string;
  onboardingCompletado: boolean;
};

export const PROFILE_ROLES = ["Estudiante", "Docente", "Egresado"];

export const PROFILE_SKILLS = [
  "Creatividad", "Investigación", "Innovación", "Programación",
  "Liderazgo", "Marketing", "Comunicación", "Emprendimiento",
  "Diseño", "Trabajo en equipo", "Tecnología", "Gestión de proyectos",
];

type ProfileFields = Pick<UserProfile, "nombreCompleto" | "rol" | "habilidades" | "infoAdicional">;

/** Share of the four profile sections filled in, from 0 to 1. */
export function profileCompletion(p: ProfileFields): number {
  return [p.nombreCompleto.trim(), p.rol, p.habilidades.length, p.infoAdicional.trim()].filter(Boolean).length / 4;
}

/** Joining a project needs a name and a role, the same steps the onboarding never let you skip before. */
export function canJoinProjects(p: ProfileFields): boolean {
  return !!p.nombreCompleto.trim() && !!p.rol;
}
