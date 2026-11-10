import RootNavigator from "@/src/navigation/RootNavigator";
import { DIProvider } from "@/src/core/di/DIProvider";
import { AuthProvider } from "@/src/features/auth/presentation/context/authContext";
import { NavigationContainer } from "@react-navigation/native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";

// Shared by the flow tests in __tests__/flows (kept outside __tests__ so jest doesn't run it as a suite).

export const tokenFor = (sub: string) => `x.${btoa(JSON.stringify({ sub })).replace(/=+$/, "")}.y`;

// A tiny in-memory Roble: /read filters by query params, /insert appends, /update patches by _id.
export function fakeRoble(userId: string, tables: Record<string, any[]>) {
    let nextId = 100;
    const reply = (body: unknown, status = 200) =>
        Promise.resolve({ status, ok: status < 300, json: () => Promise.resolve(body) } as Response);

    return jest.fn((url: string, init?: RequestInit) => {
        if (url.includes("/verify-token")) return reply({}, 401);
        if (url.includes("/login")) return reply({ accessToken: tokenFor(userId), refreshToken: "r" }, 201);
        if (url.includes("/read")) {
            const params = new URL(url).searchParams;
            const rows = (tables[params.get("tableName")!] ?? []).filter((row) =>
                [...params].every(([key, value]) => key === "tableName" || row[key] === value),
            );
            return reply(rows);
        }
        const body = JSON.parse(String(init?.body ?? "{}"));
        if (url.includes("/insert")) {
            const records = body.records.map((r: any) => ({ ...r, _id: `id${nextId++}` }));
            (tables[body.tableName] ??= []).push(...records);
            return reply({ inserted: records }, 201);
        }
        if (url.includes("/update")) {
            const row = tables[body.tableName].find((r) => r._id === body.idValue);
            Object.assign(row, body.updates);
            return reply(row);
        }
        return reply({}, 404);
    });
}

export const profileRow = (userId: string, name: string) => ({
    _id: `u-${userId}`, user_id: userId, nombre_completo: name, rol: "Estudiante", habilidades: ["Diseño"],
    info_adicional: "", onboarding_completado: "2026-08-01T00:00:00.000Z",
});

export async function loginAs(utils: ReturnType<typeof render>) {
    const { getByTestId } = utils;
    await waitFor(() => expect(getByTestId("welcome-screen")).toBeTruthy());
    await act(async () => fireEvent.press(getByTestId("welcome-login-button")));
    fireEvent.changeText(getByTestId("email-input"), "a@a.com");
    fireEvent.changeText(getByTestId("password-input"), "ThePassword!1");
    await act(async () => fireEvent.press(getByTestId("login-button")));
    await waitFor(() => expect(getByTestId("project-row-p1")).toBeTruthy());
}

export const renderApp = () =>
    render(
        <DIProvider>
            <AuthProvider>
                <PaperProvider>
                    <NavigationContainer>
                        <RootNavigator />
                    </NavigationContainer>
                </PaperProvider>
            </AuthProvider>
        </DIProvider>
    );

