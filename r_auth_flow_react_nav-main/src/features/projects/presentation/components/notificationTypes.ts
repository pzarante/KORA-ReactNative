import { AppNotification, NotificationType } from "../../domain/entities/Notification";

type NotificationLook = {
  /** MaterialCommunityIcons name. */
  icon: string;
  text: (n: AppNotification, proyecto: string) => string;
  /** Screen opened on tap; it receives `{ project }`. */
  screen: "ProjectDetail" | "Requests" | "Comments" | "MeetingHistory";
};

// One entry per type: TypeScript fails the build if a new NotificationType has no entry here.
export const NOTIFICATION_TYPES: Record<NotificationType, NotificationLook> = {
  solicitud: {
    icon: "account-plus-outline",
    text: (n, p) => `${n.actorNombre} quiere unirse a ${p}${n.detalle ? ` como ${n.detalle}` : ""}`,
    screen: "Requests",
  },
  solicitud_aceptada: { icon: "check-circle-outline", text: (_, p) => `Tu solicitud a ${p} fue aceptada`, screen: "ProjectDetail" },
  solicitud_rechazada: { icon: "close-circle-outline", text: (_, p) => `Tu solicitud a ${p} fue rechazada`, screen: "ProjectDetail" },
  comentario: { icon: "comment-outline", text: (n, p) => `${n.actorNombre} comentó en ${p}`, screen: "Comments" },
  respuesta_comentario: { icon: "comment-arrow-left-outline", text: (n, p) => `${n.actorNombre} respondió tu comentario en ${p}`, screen: "Comments" },
  edicion: { icon: "pencil-outline", text: (n, p) => `${n.actorNombre} editó el proyecto ${p}`, screen: "ProjectDetail" },
  reunion: { icon: "text-box-check-outline", text: (n, p) => `${n.actorNombre} guardó el resumen de «${n.detalle}» en ${p}`, screen: "MeetingHistory" },
};
