import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";

describe("AuthRemoteDataSourceImpl", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("preserves a string signup error returned by the API", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      status: 409,
      json: async () => ({ message: "El correo ya está registrado" }),
    } as Response);

    const dataSource = new AuthRemoteDataSourceImpl("test-project");

    await expect(dataSource.signUp("test@example.com", "password123"))
      .rejects.toThrow("Signup error: El correo ya está registrado");
  });

  it("joins signup errors when the API returns an array", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      status: 400,
      json: async () => ({ message: ["Correo inválido", "Contraseña débil"] }),
    } as Response);

    const dataSource = new AuthRemoteDataSourceImpl("test-project");

    await expect(dataSource.signUp("test@example.com", "123"))
      .rejects.toThrow("Signup error: Correo inválido Contraseña débil");
  });

  it("reports rate limiting without exposing the backend exception", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      status: 429,
      json: async () => ({ message: "ThrottlerException: Too Many Requests" }),
    } as Response);

    const dataSource = new AuthRemoteDataSourceImpl("test-project");

    await expect(dataSource.signUp("test@example.com", "password123"))
      .rejects.toThrow("Demasiados intentos. Espera un momento e inténtalo nuevamente.");
  });
});
