export type UserProfile = {
  userId: string;
  nombreCompleto: string;
  rol: string;
  habilidades: string[];
  infoAdicional: string;
  /** "+57 3001234567", or "" when not given. */
  whatsapp: string;
  correoContacto: string;
  onboardingCompletado: boolean;
} & RoleDetails;

/**
 * What the onboarding asks after the role (Figma p. 28–30). Optional: profiles saved before
 * these fields existed don't have them. "" or undefined means not given.
 */
export type RoleDetails = {
  carrera?: string;
  semestre?: string;
  departamento?: string;
  asignaturas?: string;
  anioEgreso?: string;
  cargo?: string;
};

/** Which details each role fills in; the rest are cleared when the role changes. */
export const ROLE_DETAIL_FIELDS: Record<string, (keyof RoleDetails)[]> = {
  Estudiante: ["carrera", "semestre"],
  Docente: ["departamento", "asignaturas"],
  Egresado: ["carrera", "anioEgreso", "cargo"],
};

/** Undergraduate programs offered in the student picker (Figma p. 4). */
export const CARRERAS = [
  "Administración de Empresas", "Arquitectura", "Ciencia Política y Gobierno", "Comunicación Social",
  "Contaduría Pública", "Derecho", "Diseño Gráfico", "Diseño Industrial", "Economía", "Enfermería",
  "Ingeniería Civil", "Ingeniería de Sistemas", "Ingeniería Electrónica", "Ingeniería Industrial",
  "Ingeniería Mecánica", "Medicina", "Música", "Negocios Internacionales", "Odontología", "Psicología",
  "Relaciones Internacionales",
];

export const SEMESTRES = Array.from({ length: 12 }, (_, i) => String(i + 1));

/** Graduation years for the picker, newest first. */
export const ANIOS_EGRESO = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i));

/** The role's own details, with the other roles' fields emptied (so a role change leaves no stale data). */
export function detailsForRole(rol: string, details: RoleDetails): Required<RoleDetails> {
  const keep = ROLE_DETAIL_FIELDS[rol] ?? [];
  const all: (keyof RoleDetails)[] = ["carrera", "semestre", "departamento", "asignaturas", "anioEgreso", "cargo"];
  return Object.fromEntries(all.map((key) => [key, keep.includes(key) ? (details[key] ?? "").trim() : ""])) as Required<RoleDetails>;
}

export const PROFILE_ROLES = ["Estudiante", "Docente", "Egresado"];

export const PROFILE_SKILLS = [
  "Creatividad", "Investigación", "Innovación", "Programación",
  "Liderazgo", "Marketing", "Comunicación", "Emprendimiento",
  "Diseño", "Trabajo en equipo", "Tecnología", "Gestión de proyectos",
];

type ProfileFields = Pick<UserProfile, "nombreCompleto" | "rol" | "habilidades" | "infoAdicional" | "whatsapp" | "correoContacto">;

/** Share of the five profile sections filled in (contact counts once), from 0 to 1. */
export function profileCompletion(p: ProfileFields): number {
  const contact = p.whatsapp || p.correoContacto.trim();
  return [p.nombreCompleto.trim(), p.rol, p.habilidades.length, contact, p.infoAdicional.trim()].filter(Boolean).length / 5;
}

/** Error to show for the contact fields, or undefined; `required` asks for at least one of them. */
export function contactError(p: Pick<UserProfile, "whatsapp" | "correoContacto">, required = false): string | undefined {
  const email = p.correoContacto.trim();
  if (required && !p.whatsapp && !email) return "Debes agregar al menos un medio de contacto";
  // Country code plus at least 7 digits.
  if (p.whatsapp && p.whatsapp.replace(/\D/g, "").length < 8) return "Ingresa un número de WhatsApp válido";
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return "Ingresa un correo válido";
}

/** Joining a project needs a name and a role, the same steps the onboarding never let you skip before. */
export function canJoinProjects(p: Pick<UserProfile, "nombreCompleto" | "rol">): boolean {
  return !!p.nombreCompleto.trim() && !!p.rol;
}
