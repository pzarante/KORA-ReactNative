import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSource } from "@/src/features/auth/data/datasources/AuthRemoteDataSource";
import { ProjectRemoteDataSourceImp } from "@/src/features/projects/data/datasources/ProjectRemoteDataSourceImp";
import { NewProject } from "@/src/features/projects/domain/entities/Project";

const jwt = (sub: string) => `x.${btoa(JSON.stringify({ sub })).replace(/=+$/, "")}.y`;

const draft: NewProject = {
  icono: "leaf",
  nombre: "EcoCampus",
  descripcion: "Campus sostenible",
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

  it("inserts the project into the Proyecto table with the creator from the token", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({ ok: true, status: 201 } as Response);

    const project = await new ProjectRemoteDataSourceImp(authService, "test-project").createProject(draft, "Nancy");

    expect(project).toMatchObject({ ...draft, creadorId: "user-1", creadorNombre: "Nancy" });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/database/test-project/insert");
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body.tableName).toBe("Proyecto");
    expect(body.records[0]).toMatchObject({ nombre: "EcoCampus", etiquetas: ["Sostenibilidad"], creador_id: "user-1", creador_nombre: "Nancy" });
  });

  it("refreshes an expired token once and retries the insert", async () => {
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) } as Response)
      .mockResolvedValueOnce({ ok: true, status: 201 } as Response);
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
});
