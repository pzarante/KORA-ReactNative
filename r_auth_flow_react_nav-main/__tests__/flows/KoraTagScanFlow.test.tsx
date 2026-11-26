import { act, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

import { fakeRoble, loginAs, profileRow, renderApp } from "../../testing/flowHelpers";

jest.mock("@react-native-async-storage/async-storage", () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// No camera in jest: the fake scanner "reads" whatever QR the test puts in mockQr.
let mockQr = "";
jest.mock("@/src/features/projects/presentation/components/QRScannerModal", () => {
    const { createElement } = require("react");
    const { Pressable } = require("react-native");
    return function MockQRScannerModal({ visible, onScanSuccess }: any) {
        return visible ? createElement(Pressable, { testID: "fake-qr-read", onPress: () => onScanSuccess(mockQr) }) : null;
    };
});

const project = {
    _id: "p1", nombre: "EcoCampus", icono: "sprout", descripcion: "Campus sostenible", etiquetas: ["Sostenibilidad"],
    etapa: "Idea", problema: "", objetivo: "Reciclar", alcance: "", roles: ["Diseño UI/UX"], enlaces: [],
    creador_id: "ana", creador_nombre: "Ana", created_at: "2026-08-10T00:00:00.000Z",
};

async function scan(qr: string) {
    globalThis.fetch = fakeRoble("ana", {
        proyecto: [project], Usuario: [profileRow("ana", "Ana"), profileRow("nancy", "Nancy")], comentario: [], solicitud: [],
    }) as unknown as typeof fetch;
    const utils = renderApp();
    const { getByTestId, getByText } = utils;
    await loginAs(utils);
    await act(async () => fireEvent.press(getByText("Explorar")));
    await waitFor(() => expect(getByTestId("explore-tab-people")).toBeTruthy());
    await act(async () => fireEvent.press(getByTestId("explore-tab-people")));
    await waitFor(() => expect(getByTestId("kora-tag-scan-button")).toBeTruthy());
    await act(async () => fireEvent.press(getByTestId("kora-tag-scan-button")));
    mockQr = qr;
    await act(async () => fireEvent.press(getByTestId("fake-qr-read")));
    return utils;
}

describe("KORA TAG camera scan", () => {
    it("opens the scanned person's KORA TAG profile", async () => {
        const { getByTestId, getByText } = await scan(JSON.stringify({ id: "nancy", name: "Nancy" }));
        await waitFor(() => expect(getByTestId("kora-tag-profile-screen")).toBeTruthy());
        expect(getByText("Nancy")).toBeTruthy();
    });

    it.each([
        ["your own QR", JSON.stringify({ id: "ana" })],
        ["a QR that isn't a KORA TAG", "https://not-a-kora-tag.example"],
    ])("rejects %s", async (_, qr) => {
        const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
        const { queryByTestId } = await scan(qr);
        await waitFor(() => expect(alert).toHaveBeenCalledTimes(1));
        expect(queryByTestId("kora-tag-profile-screen")).toBeNull();
        alert.mockRestore();
    });
});
