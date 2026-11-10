import { formatDay, formatTime } from "@/src/shared/utils/dates";
import { MeetingDraft, SummaryContext } from "../../domain/entities/Meeting";

// shortcut: the KORA NODE device and its AI are simulated; replace waitForDevice/generateSummary
// in the data sources with calls to the device API when it exists.

/** How long the fake device takes to answer. Tests mock this module to 0. */
export const SIMULATED_DELAY_MS = { sync: 4000, summary: 2500 };

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const OBJECTIVES: Record<string, string> = {
  Idea: "Aterrizar la idea y decidir por dónde empezar.",
  "Formación de equipo": "Repartir roles y acordar cómo trabajará el equipo.",
  Investigación: "Compartir los hallazgos de la investigación y definir los próximos pasos.",
  Prototipo: "Revisar el avance del prototipo y priorizar ajustes.",
  Pruebas: "Analizar los resultados de las pruebas y decidir mejoras.",
};

const AGREEMENTS = [
  "Ajustar el cronograma de entregas.",
  "Dividir tareas por equipo.",
  "Revisar referencias visuales.",
  "Documentar las decisiones en un solo lugar.",
  "Validar la propuesta con usuarios reales.",
  "Priorizar lo esencial para la próxima entrega.",
];

const TASKS = ["Actualizar el cronograma", "Desarrollar propuestas visuales", "Preparar la presentación de avances", "Recopilar retroalimentación"];

/** A believable summary built from the project and its real members. */
export function simulatedSummary({ proyectoNombre, etapa, integrantes, fin }: SummaryContext): MeetingDraft {
  const end = new Date(fin);
  // Varies the picks between meetings without randomness, so tests stay stable.
  const seed = end.getDate() + end.getMonth();
  const pick = <T,>(list: T[], count: number) => Array.from({ length: count }, (_, i) => list[(seed + i) % list.length]);
  const people = integrantes.length > 0 ? integrantes : ["el equipo"];
  const followUp = new Date(end.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    titulo: `Seguimiento – ${proyectoNombre}`,
    objetivo: OBJECTIVES[etapa] ?? "Definir los próximos pasos del proyecto.",
    acuerdos: pick(AGREEMENTS, 3),
    proximosPasos: [
      ...pick(TASKS, 2).map((task, i) => ({ texto: `${task} (Responsable: ${people[i % people.length]}).`, hecho: false })),
      { texto: `Reunión de seguimiento: ${formatDay(followUp)} – ${formatTime(end)}`, hecho: false },
    ],
  };
}
