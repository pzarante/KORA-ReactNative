import { LocalPreferencesAsyncStorage } from "@/src/shared/storage/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSource } from "@/src/features/auth/data/datasources/AuthRemoteDataSource";
import { ProjectRemoteDataSourceImp } from "@/src/features/projects/data/datasources/ProjectRemoteDataSourceImp";
import { NewProject } from "@/src/features/projects/domain/entities/Project";

const jwt = (sub: string) => `x.${btoa(JSON.stringify({ sub })).replace(/=+$/, "")}.y`;

const draft: NewProject = {
  icono: "leaf",
  nombre: "EcoCampus",
  descripcion: "Campus sostenible",
  sobre: "",
  etiquetas: ["Sostenibilidad"],
  etapa: "Idea",
  problema: "Mucho plástico",
  objetivo: "Reducir residuos",
  alcance: "",
  roles: ["Tester"],
  enlaces: ["https://github.com/eco"],
};

describe("ProjectRemoteDataSourceImp", () => {
  const prefs = LocalPreferencesAsyncStorage.getInstance();
  const authService = { refreshToken: jest.fn() } as unknown as jest.Mocked<AuthRemoteDataSource>;

  beforeEach(async () => {
    jest.restoreAllMocks();
    authService.refreshToken.mockReset();
    await prefs.storeData("token", jwt("user-1"));
  });

  it("inserts the project into the proyecto table with the creator from the token", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({ ok: true, status: 201, json: async () => ({ inserted: [{ _id: "p1" }] }) } as Response);

    const project = await new ProjectRemoteDataSourceImp(authService, "test-project").createProject(draft, "Nancy");

    expect(project).toMatchObject({ ...draft, id: "p1", creadorId: "user-1", creadorNombre: "Nancy" });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/database/test-project/insert");
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body.tableName).toBe("proyecto");
    expect(body.records[0]).toMatchObject({ nombre: "EcoCampus", etiquetas: ["Sostenibilidad"], creador_id: "user-1", creador_nombre: "Nancy" });
  });

  it("refreshes an expired token once and retries the insert", async () => {
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) } as Response)
      .mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ inserted: [{ _id: "p1" }] }) } as Response);
    authService.refreshToken.mockImplementation(async () => {
      await prefs.storeData("token", jwt("user-1") + "new");
      return true;
    });

    await new ProjectRemoteDataSourceImp(authService, "test-project").createProject(draft, "Nancy");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect((fetchMock.mock.calls[1][1] as RequestInit).headers).toMatchObject({ Authorization: `Bearer ${jwt("user-1")}new` });
  });

  it("surfaces the Roble error message", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 400, json: async () => ({ message: "Tabla no existe" }) } as Response);

    await expect(new ProjectRemoteDataSourceImp(authService, "test-project").createProject(draft, "Nancy"))
      .rejects.toThrow("No se pudo crear el proyecto: Tabla no existe");
  });

  it("treats Roble's 404 on read as an empty list and sorts projects newest first", async () => {
    jest.spyOn(global, "fetch")
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [
        { _id: "a", nombre: "Viejo", created_at: "2026-01-01T00:00:00Z", etiquetas: ["X"] },
        { _id: "b", nombre: "Nuevo", created_at: "2026-02-01T00:00:00Z", etiquetas: "no-array" },
      ] } as Response)
      .mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) } as Response);
    const ds = new ProjectRemoteDataSourceImp(authService, "test-project");

    const projects = await ds.listProjects();
    expect(projects.map((p) => p.id)).toEqual(["b", "a"]);
    expect(projects[0].etiquetas).toEqual([]);
    await expect(ds.listComments("a")).resolves.toEqual([]);
  });

  describe("as a guest", () => {
    const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;
    const authHeader = (call: unknown[]) => ((call[1] as RequestInit).headers as Record<string, string>).Authorization;

    beforeEach(async () => {
      await prefs.removeData("token");
      await prefs.removeData("guestToken");
      await prefs.removeData("guestRefreshToken");
    });

    it("opens one anonymous session for parallel reads and keeps it for the next launch", async () => {
      const fetchMock = jest.spyOn(global, "fetch").mockImplementation(async (url) =>
        String(url).endsWith("/signin-anonymous") ? ok({ accessToken: "guest-1", refreshToken: "r-1" }) : ok([]));

      const ds = new ProjectRemoteDataSourceImp(authService, "test-project");
      await Promise.all([ds.listProjects(), ds.listRequests(), ds.listComments()]);
      await new ProjectRemoteDataSourceImp(authService, "test-project").listProjects(); // app relaunch

      const signIns = fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/auth/test-project/signin-anonymous"));
      expect(signIns).toHaveLength(1); // Roble allows only 3 per hour per IP
      expect(fetchMock.mock.calls.filter(([url]) => String(url).includes("/database/")).map(authHeader))
        .toEqual(Array(4).fill("Bearer guest-1"));
      await expect(ds.currentUserId()).resolves.toBeNull(); // still a guest for the app
    });

    it("renews an expired guest token with its refresh token instead of a new session", async () => {
      await prefs.storeData("guestToken", "old");
      await prefs.storeData("guestRefreshToken", "r-1");
      const fetchMock = jest.spyOn(global, "fetch")
        .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) } as Response)
        .mockResolvedValueOnce(ok({ accessToken: "new" }))
        .mockResolvedValueOnce(ok([]));

      await new ProjectRemoteDataSourceImp(authService, "test-project").listProjects();

      expect(fetchMock.mock.calls[1][0]).toContain("/auth/test-project/refresh-token");
      expect(authHeader(fetchMock.mock.calls[2])).toBe("Bearer new");
      await expect(prefs.retrieveData("guestToken")).resolves.toBe("new");
    });
  });
});
