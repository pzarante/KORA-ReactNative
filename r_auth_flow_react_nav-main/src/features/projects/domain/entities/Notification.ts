/**
 * To add a notification: add its type here, its icon/text/screen in
 * presentation/components/notificationTypes.ts, and call ds.notify(...) where the event happens.
 */
export type NotificationType =
  | "solicitud"
  | "solicitud_aceptada"
  | "solicitud_rechazada"
  | "comentario"
  | "respuesta_comentario"
  | "edicion";

export type AppNotification = {
  id: string;
  tipo: NotificationType;
  proyectoId: string;
  actorNombre: string;
  /** Extra text some types show, e.g. the role asked for in a request. */
  detalle: string;
  leida: boolean;
  createdAt: string;
};

export type NewNotification = {
  /** User ids to notify; the current user and repeated ids are skipped. */
  para: string[];
  tipo: NotificationType;
  proyectoId: string;
  actorNombre: string;
  detalle?: string;
};
