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
};

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
