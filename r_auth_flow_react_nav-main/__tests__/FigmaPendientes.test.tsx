// Covers the Figma screens added together: role details, saved projects, KORA TAG membership,
// the login error card and the notifications' day headers.
import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { ProfileRemoteDataSourceImp } from "@/src/features/auth/data/datasources/ProfileRemoteDataSourceImp";
import { detailsForRole } from "@/src/features/auth/domain/entities/UserProfile";
import ProfileView from "@/src/features/auth/presentation/components/ProfileView";
import { AuthContext, AuthContextType } from "@/src/features/auth/presentation/context/authContext";
import LoginScreen from "@/src/features/auth/presentation/screens/LoginScreen";
import OnboardingRoleDetailsScreen from "@/src/features/auth/presentation/screens/OnboardingRoleDetailsScreen";
import { AuthRemoteDataSource } from "@/src/features/auth/data/datasources/AuthRemoteDataSource";
import { ProjectRemoteDataSourceImp } from "@/src/features/projects/data/datasources/ProjectRemoteDataSourceImp";
import { LocalPreferencesAsyncStorage } from "@/src/shared/storage/LocalPreferencesAsyncStorage";
import { dayLabel } from "@/src/shared/utils/dates";

jest.mock("@/src/features/projects/presentation/components/NotificationBell", () => () => null);

const jwt = (sub: string) => `x.${btoa(JSON.stringify({ sub })).replace(/=+$/, "")}.y`;
const ok = (body: unknown, status = 200) => ({ ok: status < 300, status, json: async () => body }) as unknown as Response;
const bodyOf = (call: any[]) => JSON.parse((call[1] as RequestInit).body as string);

const baseProfile = { nombreCompleto: "Nancy", rol: "Estudiante", habilidades: [], infoAdicional: "", whatsapp: "", correoContacto: "", onboardingCompletado: true };
const createAuth = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  isLoggedIn: false, loading: false, error: null, loggedUser: null, clearError: jest.fn(), login: jest.fn(), signup: jest.fn(),
  logout: jest.fn(), forgotPassword: jest.fn(), validate: jest.fn(), resendCode: jest.fn(), getLoggedUser: jest.fn(),
  profile: baseProfile, updateProfile: jest.fn(), completeProfile: jest.fn().mockResolvedValue(true), ...overrides,
});

beforeEach(async () => {
  jest.restoreAllMocks();
  await LocalPreferencesAsyncStorage.getInstance().storeData("token", jwt("user-1"));
});

describe("role details", () => {
  it("keeps only the current role's fields", () => {
    expect(detailsForRole("Docente", { carrera: "Medicina", semestre: "2", departamento: " Ing Sistemas ", asignaturas: "Base de datos" })).toEqual({
      carrera: "", semestre: "", departamento: "Ing Sistemas", asignaturas: "Base de datos", anioEgreso: "", cargo: "",
    });
  });

  it("onboarding: a student picks career and semester, then goes on to skills", async () => {
    const auth = createAuth();
    const navigation = { navigate: jest.fn(), popTo: jest.fn() };
    const { getByTestId, getByText } = render(
      <AuthContext.Provider value={auth}>
        <OnboardingRoleDetailsScreen navigation={navigation} />
      </AuthContext.Provider>,
    );
    expect(getByText("Conozcamos tu formación")).toBeTruthy();
    fireEvent.press(getByTestId("role-carrera-select"));
    fireEvent.press(getByText("Diseño Gráfico"));
    fireEvent.press(getByTestId("role-semestre-2"));
    await act(async () => fireEvent.press(getByTestId("role-details-continue")));
    expect(auth.updateProfile).toHaveBeenCalledWith(expect.objectContaining({ carrera: "Diseño Gráfico", semestre: "2", departamento: "" }));
    expect(navigation.navigate).toHaveBeenCalledWith("OnboardingSkills");
  });

  it("profile shows the role's info row like Figma", () => {
    const { getByText } = render(<ProfileView profile={{ ...baseProfile, carrera: "Diseño Gráfico", semestre: "2" }} />);
    expect(getByText("Información académica")).toBeTruthy();
    expect(getByText("Diseño Gráfico")).toBeTruthy();
    expect(getByText("2°")).toBeTruthy();
  });

  it("saves and reads the new Usuario columns", async () => {
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce(ok([{ _id: "row-1", user_id: "user-1", onboarding_completado: "2026-11-01T10:00:00.000Z" }]))
      .mockResolvedValueOnce(ok({}));
    await new ProfileRemoteDataSourceImp("test-project").saveProfile({ ...baseProfile, rol: "Egresado", carrera: "Diseño", anioEgreso: "2024", cargo: "Diseñadora", semestre: "3" });
    expect(bodyOf(fetchMock.mock.calls[1]).updates).toMatchObject({ carrera: "Diseño", anio_egreso: "2024", cargo: "Diseñadora", semestre: null, departamento: null });

    fetchMock.mockResolvedValueOnce(ok([{ user_id: "user-1", nombre_completo: "Ana", rol: "Docente", habilidades: [], departamento: "Ing", asignaturas: "BD" }]));
    expect(await new ProfileRemoteDataSourceImp("test-project").getProfile()).toMatchObject({ departamento: "Ing", asignaturas: "BD", carrera: "" });
  });
});

describe("saved projects (guardado)", () => {
  const authService = { refreshToken: jest.fn() } as unknown as AuthRemoteDataSource;

  it("inserts the first time and only flips `activo` afterwards (the app can't delete)", async () => {
    const ds = new ProjectRemoteDataSourceImp(authService, "test-project");
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValueOnce(ok([], 404)).mockResolvedValueOnce(ok({ inserted: [{ _id: "g1" }] }, 201));
    await ds.setSaved("p1", true);
    expect(fetchMock.mock.calls[1][0]).toContain("/insert");
    expect(bodyOf(fetchMock.mock.calls[1]).records[0]).toMatchObject({ usuario_id: "user-1", proyecto_id: "p1", activo: true });

    fetchMock.mockResolvedValueOnce(ok([{ _id: "g1", usuario_id: "user-1", proyecto_id: "p1", activo: true }])).mockResolvedValueOnce(ok({}));
    await ds.setSaved("p1", false);
    expect(fetchMock.mock.calls[3][0]).toContain("/update");
    expect(bodyOf(fetchMock.mock.calls[3])).toMatchObject({ tableName: "guardado", idValue: "g1", updates: { activo: false } });
  });

  it("lists only active saves of the current user", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(ok([
      { usuario_id: "user-1", proyecto_id: "p1", activo: true, created_at: "2026-11-01" },
      { usuario_id: "user-1", proyecto_id: "p2", activo: false, created_at: "2026-11-02" },
      { usuario_id: "other", proyecto_id: "p3", activo: true, created_at: "2026-11-03" },
    ]));
    expect(await new ProjectRemoteDataSourceImp(authService, "test-project").listSaved()).toEqual(["p1"]);
  });

  it("KORA TAG adds the person as an accepted request", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValueOnce(ok({ inserted: [{ _id: "s1" }] }, 201));
    await new ProjectRemoteDataSourceImp(authService, "test-project").addMember({ proyectoId: "p1", usuarioId: "nancy", usuarioNombre: "Nancy", rol: "Estudiante" });
    expect(bodyOf(fetchMock.mock.calls[0])).toMatchObject({ tableName: "solicitud", records: [{ proyecto_id: "p1", usuario_id: "nancy", estado: "aceptada" }] });
  });
});

describe("login error card", () => {
  const renderLogin = (error: string) =>
    render(
      <AuthContext.Provider value={createAuth({ error })}>
        <LoginScreen navigation={{ navigate: jest.fn() }} />
      </AuthContext.Provider>,
    );

  it("wrong credentials show Figma's 'Correo o contraseña incorrectos'", () => {
    const { getByTestId, getByText } = renderLogin("Login error: Credenciales inválidas");
    expect(getByTestId("login-error-card")).toBeTruthy();
    expect(getByText("Correo o contraseña incorrectos")).toBeTruthy();
  });

  it("other failures say 'No se pudo iniciar sesión' with the reason", () => {
    const { getByText } = renderLogin("Login error: Servidor caído");
    expect(getByText("No se pudo iniciar sesión")).toBeTruthy();
    expect(getByText("Servidor caído")).toBeTruthy();
  });
});

describe("notification day headers", () => {
  const now = new Date(2026, 10, 10, 15, 0);
  it("labels today, yesterday and older days", () => {
    expect(dayLabel(new Date(2026, 10, 10, 8, 0).toISOString(), now)).toBe("Hoy");
    expect(dayLabel(new Date(2026, 10, 9, 23, 0).toISOString(), now)).toBe("Ayer");
    expect(dayLabel(new Date(2026, 10, 6, 12, 0).toISOString(), now)).toBe("vie, 6 nov.");
  });
});

describe("Roble 'skipped' rows", () => {
  const authService = { refreshToken: jest.fn() } as unknown as AuthRemoteDataSource;

  it("an insert Roble drops (201 + skipped) is an error, not a success", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(ok([], 404))
      .mockResolvedValueOnce(ok({ inserted: [], skipped: [{ index: 0, reason: "Columnas inválidas: usuario_id" }] }, 201));
    await expect(new ProjectRemoteDataSourceImp(authService, "test-project").setSaved("p1", true)).rejects.toThrow("Columnas inválidas");
  });

  it("a new profile Roble drops is reported too", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(ok([]))
      .mockResolvedValueOnce(ok({ inserted: [], skipped: [{ index: 0, reason: "Columnas inválidas: carrera" }] }, 201));
    await expect(new ProfileRemoteDataSourceImp("test-project").saveProfile(baseProfile)).rejects.toThrow("Columnas inválidas: carrera");
  });
});
