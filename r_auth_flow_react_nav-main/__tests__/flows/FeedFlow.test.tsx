import AuthFlow from "@/src/AuthFlow";
import { DIProvider } from "@/src/core/di/DIProvider";
import { AuthProvider } from "@/src/features/auth/presentation/context/authContext";
import { NavigationContainer } from "@react-navigation/native";
import { act, fireEvent, render, waitFor, within } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";

jest.mock("@react-native-async-storage/async-storage", () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const tokenFor = (sub: string) => `x.${btoa(JSON.stringify({ sub })).replace(/=+$/, "")}.y`;

// A tiny in-memory Roble: /read filters by query params, /insert appends, /update patches by _id.
function fakeRoble(userId: string, tables: Record<string, any[]>) {
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

const project = {
    _id: "p1", nombre: "EcoCampus", icono: "sprout", descripcion: "Campus sostenible", etiquetas: ["Sostenibilidad"],
    etapa: "Idea", problema: "", objetivo: "Reciclar", alcance: "", roles: ["Diseño UI/UX"], enlaces: [],
    creador_id: "creator", creador_nombre: "María", created_at: "2026-08-10T00:00:00.000Z",
};
const profileRow = (userId: string, name: string) => ({
    _id: `u-${userId}`, user_id: userId, nombre_completo: name, rol: "Estudiante", habilidades: ["Diseño"],
    info_adicional: "", onboarding_completado: "2026-08-01T00:00:00.000Z",
});

async function loginAs(utils: ReturnType<typeof render>) {
    const { getByTestId } = utils;
    await waitFor(() => expect(getByTestId("welcome-screen")).toBeTruthy());
    await act(async () => fireEvent.press(getByTestId("welcome-login-button")));
    fireEvent.changeText(getByTestId("email-input"), "a@a.com");
    fireEvent.changeText(getByTestId("password-input"), "ThePassword!1");
    await act(async () => fireEvent.press(getByTestId("login-button")));
    await waitFor(() => expect(getByTestId("project-row-p1")).toBeTruthy());
}

const renderApp = () =>
    render(
        <DIProvider>
            <AuthProvider>
                <PaperProvider>
                    <NavigationContainer>
                        <AuthFlow />
                    </NavigationContainer>
                </PaperProvider>
            </AuthProvider>
        </DIProvider>
    );

describe("Project feed", () => {
    it("lets a member comment and ask to join a project from Home", async () => {
        const tables: Record<string, any[]> = { proyecto: [project], Usuario: [profileRow("ana", "Ana")], comentario: [], solicitud: [] };
        globalThis.fetch = fakeRoble("ana", tables) as unknown as typeof fetch;
        const utils = renderApp();
        const { getByTestId } = utils;
        await loginAs(utils);

        await act(async () => fireEvent.press(getByTestId("project-row-p1")));
        await waitFor(() => expect(getByTestId("project-detail-screen")).toBeTruthy());

        await act(async () => fireEvent.press(getByTestId("view-comments-button")));
        await waitFor(() => expect(getByTestId("comments-screen")).toBeTruthy());
        fireEvent.changeText(getByTestId("comment-input"), "¡Me encanta!");
        await act(async () => fireEvent.press(getByTestId("comment-send-button")));
        await waitFor(() => expect(within(getByTestId("comments-screen")).getByText("¡Me encanta!")).toBeTruthy());
        expect(tables.comentario[0]).toMatchObject({ proyecto_id: "p1", autor_id: "ana", autor_nombre: "Ana", respuesta_a: null });
        await waitFor(() => expect(tables.notificacion?.[0]).toMatchObject({ destinatario_id: "creator", tipo: "comentario", actor_nombre: "Ana" }));

        // Stacked screens stay mounted; the focused one's back button is the last.
        await act(async () => fireEvent.press(utils.getAllByLabelText("Volver").at(-1)!));
        // Let the back transition finish; until then the detail card ignores touches.
        await act(() => new Promise((resolve) => setTimeout(resolve, 1000)));
        await act(async () => fireEvent.press(getByTestId("join-project-button")));
        await waitFor(() => expect(getByTestId("join-request-screen")).toBeTruthy());
        fireEvent.changeText(getByTestId("join-message-input"), "Quiero diseñar la app");
        fireEvent.press(within(getByTestId("join-request-screen")).getByText("Diseño UI/UX"));
        await act(async () => fireEvent.press(getByTestId("send-request-button")));
        await waitFor(() => expect(getByTestId("request-sent-screen")).toBeTruthy());
        expect(tables.solicitud[0]).toMatchObject({ proyecto_id: "p1", usuario_id: "ana", usuario_nombre: "Ana", rol: "Diseño UI/UX", estado: "pendiente" });
        await waitFor(() => expect(tables.notificacion[1]).toMatchObject({ destinatario_id: "creator", tipo: "solicitud", detalle: "Diseño UI/UX" }));
    });

    it("shows the tab bar on the project detail and switches tabs from it", async () => {
        const tables: Record<string, any[]> = { proyecto: [project], Usuario: [profileRow("ana", "Ana")], comentario: [], solicitud: [] };
        globalThis.fetch = fakeRoble("ana", tables) as unknown as typeof fetch;
        const utils = renderApp();
        const { getByTestId, queryByTestId } = utils;
        await loginAs(utils);

        await act(async () => fireEvent.press(getByTestId("project-row-p1")));
        await waitFor(() => expect(getByTestId("app-tab-bar")).toBeTruthy());
        expect(getByTestId("app-tab-Home").props.accessibilityState).toMatchObject({ selected: true });

        await act(async () => fireEvent.press(getByTestId("app-tab-Profile")));
        await waitFor(() => expect(getByTestId("my-profile-screen")).toBeTruthy());
        await waitFor(() => expect(queryByTestId("project-detail-screen")).toBeNull());
    });

    it("lets the creator accept a pending request and see the new member", async () => {
        const request = { _id: "s1", proyecto_id: "p1", usuario_id: "ana", usuario_nombre: "Ana", rol: "Diseño UI/UX", mensaje: "Hola", estado: "pendiente", created_at: "2026-08-11T00:00:00.000Z" };
        const tables: Record<string, any[]> = {
            proyecto: [project], Usuario: [profileRow("creator", "María"), profileRow("ana", "Ana")], comentario: [], solicitud: [request],
        };
        globalThis.fetch = fakeRoble("creator", tables) as unknown as typeof fetch;
        const utils = renderApp();
        const { getByTestId } = utils;
        await loginAs(utils);

        await act(async () => fireEvent.press(getByTestId("project-row-p1")));
        await waitFor(() => expect(getByTestId("view-requests-button")).toBeTruthy());
        await act(async () => fireEvent.press(getByTestId("view-requests-button")));
        await waitFor(() => expect(getByTestId("request-s1")).toBeTruthy());
        await act(async () => fireEvent.press(getByTestId("request-s1")));
        await waitFor(() => expect(getByTestId("applicant-profile-screen")).toBeTruthy());
        await act(async () => fireEvent.press(getByTestId("accept-request-button")));
        await waitFor(() => expect(getByTestId("member-joined-screen")).toBeTruthy());
        expect(tables.solicitud[0].estado).toBe("aceptada");
        await waitFor(() => expect(tables.notificacion?.[0]).toMatchObject({ destinatario_id: "ana", tipo: "solicitud_aceptada" }));

        await act(async () => fireEvent.press(getByTestId("member-joined-team-button")));
        await waitFor(() => expect(within(getByTestId("team-members-screen")).getByText("Ana")).toBeTruthy());
    });

    it("lets a team member edit the project, notifies the creator and asks before dropping changes", async () => {
        const accepted = { _id: "s1", proyecto_id: "p1", usuario_id: "ana", usuario_nombre: "Ana", rol: "Diseño UI/UX", mensaje: "", estado: "aceptada", created_at: "2026-08-11T00:00:00.000Z" };
        const tables: Record<string, any[]> = {
            proyecto: [{ ...project }], Usuario: [profileRow("ana", "Ana")], comentario: [], solicitud: [accepted], notificacion: [],
        };
        globalThis.fetch = fakeRoble("ana", tables) as unknown as typeof fetch;
        const utils = renderApp();
        const { getByTestId, queryByTestId } = utils;
        await loginAs(utils);

        await act(async () => fireEvent.press(getByTestId("project-row-p1")));
        await waitFor(() => expect(getByTestId("edit-project-button")).toBeTruthy());
        await act(async () => fireEvent.press(getByTestId("edit-project-button")));
        await waitFor(() => expect(getByTestId("edit-project-screen")).toBeTruthy());
        // Only the creator can delete.
        expect(queryByTestId("edit-project-delete")).toBeNull();

        fireEvent.changeText(getByTestId("edit-project-name"), "EcoCampus 2");
        await act(async () => fireEvent.press(getByTestId("edit-project-back")));
        await waitFor(() => expect(utils.getByText("¿Salir sin guardar los cambios?")).toBeTruthy());
        await act(async () => fireEvent.press(utils.getByText("Seguir editando")));

        await act(async () => fireEvent.press(getByTestId("edit-project-save")));
        await waitFor(() => expect(queryByTestId("edit-project-screen")).toBeNull());
        expect(tables.proyecto[0].nombre).toBe("EcoCampus 2");
        await waitFor(() => expect(tables.notificacion).toEqual([expect.objectContaining({ destinatario_id: "creator", tipo: "edicion", actor_nombre: "Ana" })]));
        await waitFor(() => expect(within(getByTestId("project-detail-screen")).getByText("EcoCampus 2")).toBeTruthy());
    });

    it("shows the creator their notifications and marks them read", async () => {
        const tables: Record<string, any[]> = {
            proyecto: [project], Usuario: [profileRow("creator", "María")], comentario: [], solicitud: [],
            notificacion: [{ _id: "n1", destinatario_id: "creator", tipo: "edicion", proyecto_id: "p1", actor_nombre: "Ana", leida: false, created_at: "2026-08-12T00:00:00.000Z" }],
        };
        globalThis.fetch = fakeRoble("creator", tables) as unknown as typeof fetch;
        const utils = renderApp();
        const { getAllByTestId, getByTestId } = utils;
        await loginAs(utils);

        await act(async () => fireEvent.press(getAllByTestId("notifications-button")[0]));
        await waitFor(() => expect(utils.getByText("Ana editó el proyecto EcoCampus")).toBeTruthy());
        expect(utils.getByText("1 sin leer")).toBeTruthy();
        await act(async () => fireEvent.press(getByTestId("notifications-mark-all")));
        await waitFor(() => expect(tables.notificacion[0].leida).toBe(true));
        expect(utils.getByText("Estás al día")).toBeTruthy();
    });
});
