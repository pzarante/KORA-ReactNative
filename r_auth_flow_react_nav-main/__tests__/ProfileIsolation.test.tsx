import { DIProvider } from "@/src/core/di/DIProvider";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { ProfileRemoteDataSourceImp } from "@/src/features/auth/data/datasources/ProfileRemoteDataSourceImp";
import { AuthContextType, AuthProvider, useAuth } from "@/src/features/auth/presentation/context/authContext";
import { act, render, waitFor } from "@testing-library/react-native";
import React from "react";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const jwt = `x.${btoa(JSON.stringify({ sub: "user-new" })).replace(/=+$/, "")}.y`;
const respond = (body: unknown, status = 200) =>
  Promise.resolve({ ok: status < 300, status, json: async () => body } as Response);

describe("profile does not leak between accounts", () => {
  const prefs = LocalPreferencesAsyncStorage.getInstance();

  beforeEach(async () => {
    jest.restoreAllMocks();
    await Promise.all(["token", "refreshToken", "profile_draft"].map((k) => prefs.removeData(k)));
  });

  it("logging in with an account without profile drops the previous account's draft", async () => {
    await prefs.storeData("profile_draft", { nombreCompleto: "Otro Usuario", rol: "Docente" });
    jest.spyOn(global, "fetch").mockImplementation((url: any) => {
      if (String(url).includes("/login")) return respond({ accessToken: jwt, refreshToken: "r" }, 201);
      if (String(url).includes("/read")) return respond([]);
      return respond({ message: "unauthorized" }, 401);
    });

    let ctx!: AuthContextType;
    const Probe = () => { ctx = useAuth(); return null; };
    render(<DIProvider><AuthProvider><Probe /></AuthProvider></DIProvider>);
    await waitFor(() => expect(ctx.profile.nombreCompleto).toBe("Otro Usuario"));

    await act(async () => { await ctx.login("nuevo@test.com", "Secret123!"); });

    await waitFor(() => expect(ctx.isLoggedIn).toBe(true));
    expect(ctx.profile.nombreCompleto).toBe("");
    expect(ctx.profile.rol).toBe("");
    expect(await prefs.retrieveData("profile_draft")).toBeFalsy();
  });

  it("getProfile ignores rows that belong to another user", async () => {
    await prefs.storeData("token", jwt);
    jest.spyOn(global, "fetch").mockImplementation(() =>
      respond([{ user_id: "someone-else", nombre_completo: "Otro Usuario" }]));

    expect(await new ProfileRemoteDataSourceImp("test-project").getProfile()).toBeNull();
  });
});
