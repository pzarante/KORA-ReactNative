import { AppNotification, NotificationType } from "../../domain/entities/Notification";

type NotificationLook = {
  /** Bold first line, as in Figma p. 41 ("Solicitud aceptada"). */
  title: string;
  /** MaterialCommunityIcons name. */
  icon: string;
  /** Icon color: green for good news, red for a refusal, purple otherwise. */
  tone?: "success" | "danger";
  text: (n: AppNotification, proyecto: string) => string;
  /** Screen opened on tap; it receives `{ project }`. */
  screen: "ProjectDetail" | "Requests" | "Comments" | "MeetingHistory";
};

// One entry per type: TypeScript fails the build if a new NotificationType has no entry here.
export const NOTIFICATION_TYPES: Record<NotificationType, NotificationLook> = {
  solicitud: { title: "Nueva solicitud",
    icon: "account-plus-outline",
    text: (n, p) => `${n.actorNombre} quiere unirse a ${p}${n.detalle ? ` como ${n.detalle}` : ""}`,
    screen: "Requests",
  },
  solicitud_aceptada: { title: "Solicitud aceptada", tone: "success", icon: "check-circle-outline", text: (_, p) => `Tu solicitud a ${p} fue aceptada`, screen: "ProjectDetail" },
  solicitud_rechazada: { title: "Solicitud rechazada", tone: "danger", icon: "close-circle-outline", text: (_, p) => `Tu solicitud a ${p} fue rechazada`, screen: "ProjectDetail" },
  comentario: { title: "Nuevo comentario", icon: "comment-outline", text: (n, p) => `${n.actorNombre} comentó en ${p}`, screen: "Comments" },
  respuesta_comentario: { title: "Respuesta a tu comentario", icon: "comment-arrow-left-outline", text: (n, p) => `${n.actorNombre} respondió tu comentario en ${p}`, screen: "Comments" },
  edicion: { title: "Proyecto editado", icon: "pencil-outline", text: (n, p) => `${n.actorNombre} editó el proyecto ${p}`, screen: "ProjectDetail" },
  reunion: { title: "Nueva reunión", icon: "text-box-check-outline", text: (n, p) => `${n.actorNombre} guardó el resumen de «${n.detalle}» en ${p}`, screen: "MeetingHistory" },
  kora_tag: { title: "Te agregaron a un proyecto", tone: "success", icon: "qrcode-scan", text: (n, p) => `${n.actorNombre} te agregó a ${p} con tu KORA TAG`, screen: "ProjectDetail" },
};
