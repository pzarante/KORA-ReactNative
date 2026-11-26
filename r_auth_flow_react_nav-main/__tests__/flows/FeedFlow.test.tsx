import { act, fireEvent, waitFor, within } from "@testing-library/react-native";

import { fakeRoble, loginAs, profileRow, renderApp } from "../../testing/flowHelpers";

jest.mock("@react-native-async-storage/async-storage", () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const project = {
    _id: "p1", nombre: "EcoCampus", icono: "sprout", descripcion: "Campus sostenible", etiquetas: ["Sostenibilidad"],
    etapa: "Idea", problema: "", objetivo: "Reciclar", alcance: "", roles: ["Diseño UI/UX"], enlaces: [],
    creador_id: "creator", creador_nombre: "María", created_at: "2026-08-10T00:00:00.000Z",
};
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

    const accepted = { _id: "s1", proyecto_id: "p1", usuario_id: "ana", usuario_nombre: "Ana", rol: "Diseño UI/UX", mensaje: "", estado: "aceptada", created_at: "2026-08-11T00:00:00.000Z" };

    it("gives a non-creator member node, save and leave (no edit), and lets them leave and ask again", async () => {
        const tables: Record<string, any[]> = {
            proyecto: [{ ...project }], Usuario: [profileRow("ana", "Ana")], comentario: [], solicitud: [{ ...accepted }], notificacion: [],
        };
        globalThis.fetch = fakeRoble("ana", tables) as unknown as typeof fetch;
        const utils = renderApp();
        const { getByTestId, queryByTestId } = utils;
        await loginAs(utils);

        await act(async () => fireEvent.press(getByTestId("project-row-p1")));
        await waitFor(() => expect(getByTestId("leave-project-button")).toBeTruthy());
        expect(getByTestId("kora-node-button")).toBeTruthy();
        expect(getByTestId("save-project-button")).toBeTruthy();
        expect(queryByTestId("edit-project-button")).toBeNull();

        await act(async () => fireEvent.press(getByTestId("leave-project-button")));
        await waitFor(() => expect(utils.getByText("¿Salir del proyecto?")).toBeTruthy());
        await act(async () => fireEvent.press(getByTestId("confirm-modal-accept")));
        await waitFor(() => expect(tables.solicitud[0].estado).toBe("retirada"));
        await waitFor(() => expect(getByTestId("leave-success")).toBeTruthy());
        await waitFor(() => expect(tables.notificacion).toEqual(
            expect.arrayContaining([expect.objectContaining({ destinatario_id: "creator", tipo: "salida", actor_nombre: "Ana" })]),
        ));
        await act(async () => fireEvent.press(utils.getAllByLabelText("Volver").at(-1)!));
        await act(() => new Promise((resolve) => setTimeout(resolve, 1000)));
        await act(async () => fireEvent.press(getByTestId("project-row-p1")));
        await waitFor(() => expect(getByTestId("join-project-button")).toBeTruthy());
    });

    it("lets the creator keep editing and kick a member, who disappears from the team", async () => {
        const tables: Record<string, any[]> = {
            proyecto: [{ ...project }], Usuario: [profileRow("creator", "María"), profileRow("ana", "Ana")], comentario: [], solicitud: [{ ...accepted }], notificacion: [],
        };
        globalThis.fetch = fakeRoble("creator", tables) as unknown as typeof fetch;
        const utils = renderApp();
        const { getByTestId, queryByTestId } = utils;
        await loginAs(utils);

        await act(async () => fireEvent.press(getByTestId("project-row-p1")));
        await waitFor(() => expect(getByTestId("edit-project-button")).toBeTruthy());
        expect(getByTestId("view-requests-button")).toBeTruthy();

        await act(async () => fireEvent.press(getByTestId("view-team-button")));
        await waitFor(() => expect(getByTestId("kick-member-s1")).toBeTruthy());
        await act(async () => fireEvent.press(getByTestId("kick-member-s1")));
        await waitFor(() => expect(utils.getByText("¿Expulsar a Ana?")).toBeTruthy());
        await act(async () => fireEvent.press(getByTestId("confirm-modal-accept")));
        await waitFor(() => expect(tables.solicitud[0].estado).toBe("expulsada"));
        await waitFor(() => expect(tables.notificacion).toEqual([expect.objectContaining({ destinatario_id: "ana", tipo: "expulsion" })]));
        await waitFor(() => expect(queryByTestId("kick-member-s1")).toBeNull());
    });

    it("signs out locally even when the server logout fails", async () => {
        const tables: Record<string, any[]> = { proyecto: [project], Usuario: [profileRow("ana", "Ana")], comentario: [], solicitud: [] };
        globalThis.fetch = fakeRoble("ana", tables) as unknown as typeof fetch; // /logout answers 404
        const utils = renderApp();
        await loginAs(utils);
        await act(async () => fireEvent.press(utils.getByText("Mi Perfil")));
        await waitFor(() => expect(utils.getByTestId("logout-button")).toBeTruthy());
        await act(async () => fireEvent.press(utils.getByTestId("logout-button")));
        await waitFor(() => expect(utils.getByTestId("welcome-screen")).toBeTruthy());
    });

    it("shows each team member's whatsapp and email", async () => {
        const tables: Record<string, any[]> = {
            proyecto: [{ ...project }],
            Usuario: [profileRow("creator", "María"), { ...profileRow("ana", "Ana"), whatsapp: "3001234567", correo_contacto: "ana@uninorte.edu.co" }],
            comentario: [], solicitud: [{ ...accepted }], notificacion: [],
        };
        globalThis.fetch = fakeRoble("creator", tables) as unknown as typeof fetch;
        const utils = renderApp();
        await loginAs(utils);

        await act(async () => fireEvent.press(utils.getByTestId("project-row-p1")));
        await waitFor(() => expect(utils.getByTestId("view-team-button")).toBeTruthy());
        await act(async () => fireEvent.press(utils.getByTestId("view-team-button")));
        await waitFor(() => expect(within(utils.getByTestId("team-members-screen")).getByText("3001234567 · ana@uninorte.edu.co")).toBeTruthy());
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
