import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
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
      onboardingCompletado: true,
    });

    const [url, options] = fetchMock.mock.calls[1];
    expect(url).toContain("/database/test-project/insert");
    const record = JSON.parse((options as RequestInit).body as string).records[0];
    expect(record).toMatchObject({ user_id: "user-1", nombre_completo: "Nancy", habilidades: ["Diseño"] });
    expect(Number.isNaN(Date.parse(record.onboarding_completado))).toBe(false);
  });
});
