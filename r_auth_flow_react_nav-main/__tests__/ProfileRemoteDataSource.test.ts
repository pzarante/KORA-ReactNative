import { LocalPreferencesAsyncStorage } from "@/src/shared/storage/LocalPreferencesAsyncStorage";
import { ProfileRemoteDataSourceImp } from "@/src/features/auth/data/datasources/ProfileRemoteDataSourceImp";

const jwt = `x.${btoa(JSON.stringify({ sub: "user-1" })).replace(/=+$/, "")}.y`;

describe("ProfileRemoteDataSourceImp", () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    await LocalPreferencesAsyncStorage.getInstance().storeData("token", jwt);
  });

  it("inserts a new profile with onboarding_completado as a timestamp", async () => {
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [] } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, status: 201 } as Response);

    await new ProfileRemoteDataSourceImp("test-project").saveProfile({
      nombreCompleto: "Nancy",
      rol: "Estudiante",
      habilidades: ["Diseño"],
      infoAdicional: "",
      whatsapp: "+57 3001234567",
      correoContacto: "",
      onboardingCompletado: true,
    });

    const [url, options] = fetchMock.mock.calls[1];
    expect(url).toContain("/database/test-project/insert");
    const record = JSON.parse((options as RequestInit).body as string).records[0];
    expect(record).toMatchObject({ user_id: "user-1", nombre_completo: "Nancy", habilidades: ["Diseño"], whatsapp: "+57 3001234567", correo_contacto: "" });
    expect(Number.isNaN(Date.parse(record.onboarding_completado))).toBe(false);
  });

  const edited = {
    nombreCompleto: "Nancy R.",
    rol: "Estudiante",
    habilidades: ["Diseño"],
    infoAdicional: "",
    whatsapp: "",
    correoContacto: "",
    onboardingCompletado: true,
  };

  it("editing keeps the original onboarding date", async () => {
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [{ _id: "row-1", user_id: "user-1", onboarding_completado: "2026-11-01T10:00:00.000Z" }] } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

    await new ProfileRemoteDataSourceImp("test-project").saveProfile(edited);

    const [url, options] = fetchMock.mock.calls[1];
    expect(url).toContain("/database/test-project/update");
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body).toMatchObject({ tableName: "Usuario", idColumn: "_id", idValue: "row-1" });
    expect(body.updates).toMatchObject({ nombre_completo: "Nancy R.", onboarding_completado: "2026-11-01T10:00:00.000Z" });
  });

  it("'Hacerlo más tarde' (name, no role) still sends a date: Roble's column is NOT NULL", async () => {
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [] } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, status: 201 } as Response);

    await new ProfileRemoteDataSourceImp("test-project").saveProfile({ ...edited, rol: "", onboardingCompletado: false });

    const record = JSON.parse((fetchMock.mock.calls[1][1] as RequestInit).body as string).records[0];
    expect(Number.isNaN(Date.parse(record.onboarding_completado))).toBe(false);
  });

  it("reads onboarding as done only with a name and a role", async () => {
    const row = { _id: "row-1", user_id: "user-1", nombre_completo: "Nancy", habilidades: [], onboarding_completado: "2026-11-01T10:00:00.000Z" };
    const ds = new ProfileRemoteDataSourceImp("test-project");

    jest.spyOn(global, "fetch").mockResolvedValueOnce({ ok: true, status: 200, json: async () => [{ ...row, rol: "" }] } as unknown as Response);
    expect((await ds.getProfile())?.onboardingCompletado).toBe(false);

    jest.spyOn(global, "fetch").mockResolvedValueOnce({ ok: true, status: 200, json: async () => [{ ...row, rol: "Estudiante" }] } as unknown as Response);
    expect((await ds.getProfile())?.onboardingCompletado).toBe(true);
  });

  it("refreshes an expired token once and retries", async () => {
    const authService = { refreshToken: jest.fn(async () => true) } as any;
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [{ _id: "row-1", user_id: "user-1", onboarding_completado: "2026-11-01T10:00:00.000Z" }] } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

    await new ProfileRemoteDataSourceImp("test-project", authService).saveProfile(edited);

    expect(authService.refreshToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][0]).toContain("/update");
  });
});
