import { LocalPreferencesAsyncStorage } from "@/src/shared/storage/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSource } from "@/src/features/auth/data/datasources/AuthRemoteDataSource";
import { MockProjectDataSource } from "@/src/features/projects/data/datasources/MockProjectDataSource";
import { ProjectRemoteDataSourceImp } from "@/src/features/projects/data/datasources/ProjectRemoteDataSourceImp";
import { AppNotification } from "@/src/features/projects/domain/entities/Notification";
import { withProjects } from "@/src/features/projects/presentation/components/NotificationBell";
import { NOTIFICATION_TYPES } from "@/src/features/projects/presentation/components/notificationTypes";

const jwt = (sub: string) => `x.${btoa(JSON.stringify({ sub })).replace(/=+$/, "")}.y`;
const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;
const body = (call: unknown[]) => JSON.parse((call[1] as RequestInit).body as string);

describe("notifications", () => {
  const authService = { refreshToken: jest.fn() } as unknown as AuthRemoteDataSource;

  beforeEach(async () => {
    jest.restoreAllMocks();
    await LocalPreferencesAsyncStorage.getInstance().storeData("token", jwt("me"));
  });

  it("inserts one row per recipient, skipping the sender and repeats", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue(ok({ inserted: [] }));
    await new ProjectRemoteDataSourceImp(authService, "p").notify({ para: ["ana", "me", "ana", "luis"], tipo: "edicion", proyectoId: "x", actorNombre: "Yo" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const { tableName, records } = body(fetchMock.mock.calls[0]);
    expect(tableName).toBe("notificacion");
    expect(records.map((r: any) => r.destinatario_id)).toEqual(["ana", "luis"]);
    expect(records[0]).toMatchObject({ tipo: "edicion", proyecto_id: "x", actor_nombre: "Yo", leida: false });
  });

  it("does not throw when Roble rejects the notification", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 400, json: async () => ({ message: "Tabla no existe" }) } as Response);
    await expect(new ProjectRemoteDataSourceImp(authService, "p").notify({ para: ["ana"], tipo: "comentario", proyectoId: "x", actorNombre: "Yo" })).resolves.toBeUndefined();
  });

  it("saves project edits with Roble's column names and hides archived projects", async () => {
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce(ok({}))
      .mockResolvedValueOnce(ok([{ _id: "a", nombre: "A", archivado: true }, { _id: "b", nombre: "B", buscando_personas: false }, { _id: "c", nombre: "C" }]));
    const ds = new ProjectRemoteDataSourceImp(authService, "p");

    await ds.updateProject("a", { nombre: "Nuevo", buscandoPersonas: false });
    expect(body(fetchMock.mock.calls[0])).toEqual({ tableName: "proyecto", idColumn: "_id", idValue: "a", updates: { nombre: "Nuevo", buscando_personas: false } });

    const projects = await ds.listProjects();
    expect(projects.map((p) => [p.id, p.buscandoPersonas])).toEqual([["b", false], ["c", true]]);
  });

  it("drops notifications of deleted projects and has text for every type", async () => {
    const ds = new MockProjectDataSource();
    const [project] = await ds.listProjects();
    const n = (id: string, proyectoId: string): AppNotification =>
      ({ id, tipo: "solicitud", proyectoId, actorNombre: "Ana", detalle: "Diseño", leida: false, createdAt: "" });

    const rows = withProjects([n("1", project.id), n("2", "borrado")], [project]);
    expect(rows.map((r) => r.id)).toEqual(["1"]);
    expect(NOTIFICATION_TYPES.solicitud.text(rows[0], project.nombre)).toBe("Ana quiere unirse a EcoCampus como Diseño");
  });
});
