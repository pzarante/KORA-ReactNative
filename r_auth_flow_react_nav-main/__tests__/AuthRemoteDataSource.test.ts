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

  it("in practice mode creates the account with signup-direct and logs in", async () => {
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce({ status: 201, json: async () => ({}) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ accessToken: "a", refreshToken: "r" }) } as Response);

    await expect(new AuthRemoteDataSourceImpl("test-project").signUp("a@a.com", "secret1")).resolves.toBe(false);
    expect(fetchMock.mock.calls.map(([url]) => String(url).split("/").pop())).toEqual(["signup-direct", "login"]);
  });

  it("with real e-mails uses signup and waits for the code instead of logging in", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({ status: 201, json: async () => ({}) } as Response);

    await expect(new AuthRemoteDataSourceImpl("test-project", "signup").signUp("a@a.com", "secret1")).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://roble-api.openlab.uninorte.edu.co/auth/test-project/signup");
  });

  it("resends the verification code and surfaces Roble's error", async () => {
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response)
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: "Usuario ya verificado" }) } as Response);
    const dataSource = new AuthRemoteDataSourceImpl("test-project");

    await dataSource.resendCode("a@a.com");
    expect(fetchMock.mock.calls[0][0]).toContain("/auth/test-project/resend-code");
    expect(JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string)).toEqual({ email: "a@a.com" });
    await expect(dataSource.resendCode("a@a.com")).rejects.toThrow("Usuario ya verificado");
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

  it("requests a password reset using the Roble endpoint and email payload", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    const dataSource = new AuthRemoteDataSourceImpl("test-project");

    await expect(dataSource.forgotPassword("test@example.com")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://roble-api.openlab.uninorte.edu.co/auth/test-project/forgot-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email: "test@example.com" }),
      },
    );
  });

  it("reports password reset rate limiting", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 429,
    } as Response);

    const dataSource = new AuthRemoteDataSourceImpl("test-project");

    await expect(dataSource.forgotPassword("test@example.com"))
      .rejects.toThrow("Demasiados intentos. Espera un momento e inténtalo nuevamente.");
  });

  it("does not expose server details when a password reset request fails", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const dataSource = new AuthRemoteDataSourceImpl("test-project");

    await expect(dataSource.forgotPassword("test@example.com"))
      .rejects.toThrow("No pudimos enviar el enlace. Intenta de nuevo más tarde.");
  });

  it("reports network failures for password reset requests", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("network unavailable"));

    const dataSource = new AuthRemoteDataSourceImpl("test-project");

    await expect(dataSource.forgotPassword("test@example.com"))
      .rejects.toThrow("No pudimos conectar con el servicio. Revisa tu conexión e inténtalo de nuevo.");
  });
});
