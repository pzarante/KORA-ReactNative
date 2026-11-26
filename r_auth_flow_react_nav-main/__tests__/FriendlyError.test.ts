import { friendlyStatusMessage, NO_CONNECTION_MESSAGE } from "@/src/core/roble/friendlyError";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";

describe("friendly server errors", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("maps HTTP status to a message without server details", () => {
    expect(friendlyStatusMessage(400)).toBe("Revisa los datos e intenta de nuevo.");
    expect(friendlyStatusMessage(422)).toBe("Revisa los datos e intenta de nuevo.");
    expect(friendlyStatusMessage(403)).toBe("No tienes permiso para hacer esto.");
    expect(friendlyStatusMessage(401)).toBe("Tu sesión expiró. Inicia sesión de nuevo.");
    expect(friendlyStatusMessage(500)).toBe("El servidor está ocupado. Intenta de nuevo en un momento.");
    expect(friendlyStatusMessage(0)).toBe("El servidor está ocupado. Intenta de nuevo en un momento.");
  });

  it("login: wrong credentials, server errors and no network never show Roble's text", async () => {
    const ds = new AuthRemoteDataSourceImpl("test-project");
    jest.spyOn(global, "fetch")
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ message: "Credenciales inválidas" }) } as Response)
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ message: "sorry, too many clients already" }) } as Response)
      .mockRejectedValueOnce(new TypeError("Network request failed"));

    await expect(ds.login("a@a.com", "x")).rejects.toThrow(/^Correo o contraseña incorrectos\.$/);
    await expect(ds.login("a@a.com", "x")).rejects.toThrow(/^El servidor está ocupado/);
    await expect(ds.login("a@a.com", "x")).rejects.toThrow(NO_CONNECTION_MESSAGE);
  });
});
