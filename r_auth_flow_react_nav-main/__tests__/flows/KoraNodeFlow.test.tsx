import { act, fireEvent, waitFor } from "@testing-library/react-native";

import { fakeRoble, loginAs, profileRow, renderApp } from "../../testing/flowHelpers";

jest.mock("@react-native-async-storage/async-storage", () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
// The device answers at once instead of after a few seconds.
jest.mock("@/src/features/koranode/data/datasources/simulatedDevice", () => ({
    ...jest.requireActual("@/src/features/koranode/data/datasources/simulatedDevice"),
    SIMULATED_DELAY_MS: { sync: 0, summary: 0 },
}));

const project = {
    _id: "p1", nombre: "EcoCampus", icono: "sprout", descripcion: "Campus sostenible", etiquetas: ["Sostenibilidad"],
    etapa: "Investigación", problema: "", objetivo: "", alcance: "", roles: [], enlaces: [],
    creador_id: "ana", creador_nombre: "Ana", created_at: "2026-08-10T00:00:00.000Z",
};
const luisAccepted = {
    _id: "s1", proyecto_id: "p1", usuario_id: "luis", usuario_nombre: "Luis", rol: "Diseño", mensaje: "", estado: "aceptada", created_at: "2026-08-11T00:00:00.000Z",
};

// Closing transitions and loads finish after an act() ends, and RNTL 11's waitFor doesn't flush
// those updates (a card still closing also blocks presses on the one below); polling inside act() does.
async function settleUntil(check: () => boolean) {
    for (let tries = 0; tries < 40 && !check(); tries++) {
        await act(() => new Promise((resolve) => setTimeout(resolve, 25)));
    }
}

describe("KORA NODE", () => {
    it("links the device, records a meeting and shares its edited notes with the team", async () => {
        const tables: Record<string, any[]> = {
            proyecto: [project], Usuario: [profileRow("ana", "Ana"), profileRow("luis", "Luis")],
            comentario: [], solicitud: [luisAccepted], notificacion: [], kora_node: [], reunion: [],
        };
        globalThis.fetch = fakeRoble("ana", tables) as unknown as typeof fetch;
        const utils = renderApp();
        const { getByTestId, getByText } = utils;
        await loginAs(utils);

        await act(async () => fireEvent.press(getByTestId("project-row-p1")));
        await act(async () => fireEvent.press(await waitFor(() => getByTestId("kora-node-button"))));

        // First time: the sync code, then the (simulated) device confirms it.
        await waitFor(() => expect(getByTestId("kora-node-synced-screen")).toBeTruthy());
        expect(tables.kora_node).toEqual([expect.objectContaining({ proyecto_id: "p1", codigo: expect.stringMatching(/^KORA-[0-9A-F]{4}$/), sincronizado_por: "ana" })]);
        await act(async () => fireEvent.press(getByTestId("kora-node-continue")));

        await act(async () => fireEvent.press(await waitFor(() => getByTestId("start-meeting-button"))));
        expect(getByTestId("meeting-in-progress-screen")).toBeTruthy();
        await act(async () => fireEvent.press(getByTestId("finish-meeting-button")));

        // The AI summary is saved at once as the team's notes, with real members as owners.
        await waitFor(() => expect(getByText("Reunión finalizada")).toBeTruthy());
        expect(tables.reunion).toHaveLength(1);
        const saved = tables.reunion[0];
        expect(saved).toMatchObject({ proyecto_id: "p1", titulo: "Seguimiento – EcoCampus", creador_id: "ana", creador_nombre: "Ana" });
        expect(saved.acuerdos).toHaveLength(3);
        expect(saved.proximos_pasos.map((s: any) => s.texto).join(" ")).toMatch(/Responsable: Ana.*Responsable: Luis/);
        expect(tables.notificacion).toEqual([
            expect.objectContaining({ destinatario_id: "luis", tipo: "reunion", proyecto_id: "p1", actor_nombre: "Ana", detalle: "Seguimiento – EcoCampus" }),
        ]);

        // Edit: new title, drop an agreement, tick a step.
        await act(async () => fireEvent.press(getByTestId("edit-meeting-button")));
        fireEvent.changeText(getByTestId("meeting-title-input"), "Kickoff EcoCampus");
        fireEvent.press(getByTestId("remove-agreement-0"));
        fireEvent.press(getByTestId("step-check-0"));
        await act(async () => fireEvent.press(getByTestId("save-meeting-button")));

        await waitFor(() => expect(getByTestId("meeting-note-title").props.children).toBe("Kickoff EcoCampus"));
        expect(getByTestId("meeting-step-0").props.accessibilityState).toEqual({ checked: true });
        expect(tables.reunion[0]).toMatchObject({ titulo: "Kickoff EcoCampus", editado_por_nombre: "Ana" });
        expect(tables.reunion[0].acuerdos).toHaveLength(2);
        expect(tables.reunion[0].proximos_pasos[0].hecho).toBe(true);

        // The history is the collection of notes; search finds them by their words.
        await settleUntil(() => !utils.queryByTestId("edit-meeting-screen"));
        await act(async () => fireEvent.press(getByTestId("note-history-button")));
        await settleUntil(() => !!utils.queryByTestId(`meeting-row-${saved._id}`));
        expect(getByTestId(`meeting-row-${saved._id}`)).toBeTruthy();
        fireEvent.changeText(getByTestId("meeting-search"), "kickoff");
        expect(getByTestId(`meeting-row-${saved._id}`)).toBeTruthy();
        fireEvent.changeText(getByTestId("meeting-search"), "presupuesto");
        expect(getByText("Ninguna reunión coincide con tu búsqueda.")).toBeTruthy();
        expect(utils.queryByTestId(`meeting-row-${saved._id}`)).toBeNull();
    });
});
